-- Arenas close only when the wall-clock timer ends (default 20 days).
-- Bid count no longer closes an auction.
-- Safe to run even if 003 was skipped: creates ends_at if missing.

alter table public.auctions
  add column if not exists ends_at timestamptz;

-- Backfill active arenas to a 20-day window from creation
update public.auctions
set ends_at = coalesce(created_at, now()) + interval '20 days'
where status = 'active'
  and (
    ends_at is null
    or ends_at < coalesce(created_at, now()) + interval '1 day'
  );

-- Raise legacy max_bids so it never acts as a soft close
update public.auctions
set max_bids = 1000000
where max_bids < 1000000;

alter table public.auctions
  alter column max_bids set default 1000000;

-- Close every active auction whose timer has elapsed
create or replace function public.sync_expired_auctions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_winner record;
  v_count integer := 0;
begin
  for r in
    select id from public.auctions
    where status = 'active'
      and ends_at is not null
      and ends_at <= now()
    for update
  loop
    select * into v_winner from public.compute_lowest_unique_winner(r.id);
    update public.auctions
    set status = 'closed',
        winner_id = v_winner.winner_id,
        winning_amount_cents = v_winner.winning_amount_cents,
        updated_at = now()
    where id = r.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

grant execute on function public.sync_expired_auctions() to anon, authenticated;

-- Timer-only place_bid (no max_bids close)
create or replace function public.place_bid(p_auction_id uuid, p_amount_cents integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_auction public.auctions%rowtype;
  v_bid public.bids%rowtype;
  v_payment public.payments%rowtype;
  v_winner record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount_cents < 0 or p_amount_cents > 25000 or mod(p_amount_cents, 25) <> 0 then
    raise exception 'Invalid bid amount. Use 0 to 250 in steps of 0.25';
  end if;

  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'Profile not found';
  end if;
  if v_profile.registration_paid_at is null then
    raise exception 'Registration fee required before bidding';
  end if;

  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then
    raise exception 'Auction not found';
  end if;

  -- Expire on the timer before accepting the bid
  if v_auction.ends_at is not null and v_auction.ends_at <= now() then
    select * into v_winner from public.compute_lowest_unique_winner(p_auction_id);
    update public.auctions
    set status = 'closed',
        winner_id = v_winner.winner_id,
        winning_amount_cents = v_winner.winning_amount_cents,
        updated_at = now()
    where id = p_auction_id;
    raise exception 'Auction has ended';
  end if;

  if v_auction.status <> 'active' then
    raise exception 'Auction is not active';
  end if;

  insert into public.bids (auction_id, user_id, amount_cents)
  values (p_auction_id, v_user_id, p_amount_cents)
  returning * into v_bid;

  insert into public.payments (user_id, type, amount_birr, status, auction_id, bid_id)
  values (v_user_id, 'bid', 75, 'mock_completed', p_auction_id, v_bid.id)
  returning * into v_payment;

  update public.auctions
  set bid_count = bid_count + 1,
      updated_at = now()
  where id = p_auction_id
  returning * into v_auction;

  return jsonb_build_object(
    'bid', to_jsonb(v_bid),
    'payment', to_jsonb(v_payment),
    'auction', to_jsonb(v_auction)
  );
end;
$$;
