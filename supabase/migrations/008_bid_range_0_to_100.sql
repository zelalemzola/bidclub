-- Bids: any amount from 0.00–100.00 ETB (integer cents 0–10000).
-- Removes the old 0–250 / 0.25-step restriction.

alter table public.bids
  drop constraint if exists bids_amount_cents_check;

alter table public.bids
  add constraint bids_amount_cents_check
  check (
    amount_cents >= 0
    and amount_cents <= 10000
  );

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
  v_fee numeric(10, 2);
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount_cents < 0 or p_amount_cents > 10000 then
    raise exception 'Invalid bid amount. Use any amount from 0.00 to 100.00 ETB';
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

  v_fee := coalesce(v_auction.bid_fee_birr, 75);

  insert into public.bids (auction_id, user_id, amount_cents)
  values (p_auction_id, v_user_id, p_amount_cents)
  returning * into v_bid;

  insert into public.payments (user_id, type, amount_birr, status, auction_id, bid_id)
  values (v_user_id, 'bid', v_fee, 'mock_completed', p_auction_id, v_bid.id)
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
