-- BidClub initial schema: profiles, auctions, bids, payments + RLS + realtime

create extension if not exists "pgcrypto";

-- Enums
create type public.user_role as enum ('user', 'admin');
create type public.auction_status as enum ('draft', 'active', 'closed');
create type public.payment_type as enum ('registration', 'bid');
create type public.payment_status as enum ('mock_completed', 'pending', 'failed');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role public.user_role not null default 'user',
  registration_paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auctions / products
create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  status public.auction_status not null default 'draft',
  max_bids integer not null default 1000 check (max_bids > 0),
  bid_count integer not null default 0 check (bid_count >= 0),
  ends_at timestamptz,
  winner_id uuid references public.profiles (id),
  winning_amount_cents integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bids (amount stored in cents: 0.25 birr = 25)
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents integer not null check (
    amount_cents >= 0
    and amount_cents <= 25000
    and amount_cents % 25 = 0
  ),
  created_at timestamptz not null default now()
);

create index bids_auction_id_idx on public.bids (auction_id);
create index bids_auction_amount_idx on public.bids (auction_id, amount_cents);
create index bids_user_id_idx on public.bids (user_id);

-- Payments (mock for now; Telebirr later)
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.payment_type not null,
  amount_birr numeric(10, 2) not null,
  status public.payment_status not null default 'mock_completed',
  auction_id uuid references public.auctions (id) on delete set null,
  bid_id uuid references public.bids (id) on delete set null,
  created_at timestamptz not null default now()
);

create index payments_user_id_idx on public.payments (user_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger auctions_updated_at
  before update on public.auctions
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lowest unique bid computation
create or replace function public.compute_lowest_unique_winner(p_auction_id uuid)
returns table (winner_id uuid, winning_amount_cents integer)
language sql
stable
as $$
  with counts as (
    select b.amount_cents, count(*) as cnt
    from public.bids b
    where b.auction_id = p_auction_id
    group by b.amount_cents
  ),
  unique_amounts as (
    select amount_cents
    from counts
    where cnt = 1
  ),
  lowest as (
    select min(amount_cents) as amount_cents
    from unique_amounts
  )
  select b.user_id, b.amount_cents
  from public.bids b
  join lowest l on l.amount_cents = b.amount_cents
  where b.auction_id = p_auction_id
  order by b.created_at asc
  limit 1;
$$;

-- Atomic place bid + mock payment + maybe close
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
  if v_auction.status <> 'active' then
    raise exception 'Auction is not active';
  end if;
  if v_auction.bid_count >= v_auction.max_bids then
    raise exception 'Auction is full';
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

  if v_auction.bid_count >= v_auction.max_bids then
    select * into v_winner from public.compute_lowest_unique_winner(p_auction_id);
    update public.auctions
    set status = 'closed',
        winner_id = v_winner.winner_id,
        winning_amount_cents = v_winner.winning_amount_cents,
        updated_at = now()
    where id = p_auction_id
    returning * into v_auction;
  end if;

  return jsonb_build_object(
    'bid', to_jsonb(v_bid),
    'payment', to_jsonb(v_payment),
    'auction', to_jsonb(v_auction)
  );
end;
$$;

-- Mock registration payment
create or replace function public.mock_pay_registration()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_payment public.payments%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'Profile not found';
  end if;
  if v_profile.registration_paid_at is not null then
    raise exception 'Registration already paid';
  end if;

  insert into public.payments (user_id, type, amount_birr, status)
  values (v_user_id, 'registration', 100, 'mock_completed')
  returning * into v_payment;

  update public.profiles
  set registration_paid_at = now(),
      updated_at = now()
  where id = v_user_id
  returning * into v_profile;

  return jsonb_build_object(
    'profile', to_jsonb(v_profile),
    'payment', to_jsonb(v_payment)
  );
end;
$$;

-- Admin force-close with winner calc
create or replace function public.close_auction(p_auction_id uuid)
returns public.auctions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_auction public.auctions%rowtype;
  v_winner record;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role is distinct from 'admin' then
    raise exception 'Admin only';
  end if;

  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then
    raise exception 'Auction not found';
  end if;

  select * into v_winner from public.compute_lowest_unique_winner(p_auction_id);

  update public.auctions
  set status = 'closed',
      winner_id = v_winner.winner_id,
      winning_amount_cents = v_winner.winning_amount_cents,
      updated_at = now()
  where id = p_auction_id
  returning * into v_auction;

  return v_auction;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.auctions enable row level security;
alter table public.bids enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profiles policies
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile display name"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auctions policies
create policy "Anyone can view active/closed auctions"
  on public.auctions for select
  using (
    status in ('active', 'closed')
    or public.is_admin()
  );

create policy "Admins manage auctions"
  on public.auctions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Bids policies: sealed until reveal — players only see their own bids; admins see all
create policy "Users see own bids; admins see all"
  on public.bids for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());


create policy "No direct bid inserts"
  on public.bids for insert
  to authenticated
  with check (false);

-- Payments policies
create policy "Users see own payments"
  on public.payments for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "No direct payment inserts"
  on public.payments for insert
  to authenticated
  with check (false);

-- Storage bucket for auction images
insert into storage.buckets (id, name, public)
values ('auction-images', 'auction-images', true)
on conflict (id) do nothing;

create policy "Public read auction images"
  on storage.objects for select
  using (bucket_id = 'auction-images');

create policy "Admins upload auction images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'auction-images' and public.is_admin());

create policy "Admins update auction images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'auction-images' and public.is_admin());

create policy "Admins delete auction images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'auction-images' and public.is_admin());

-- Realtime
alter publication supabase_realtime add table public.auctions;
alter publication supabase_realtime add table public.bids;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.auctions to anon, authenticated;
grant select on public.bids to authenticated;
grant select on public.payments to authenticated;
grant execute on function public.place_bid(uuid, integer) to authenticated;
grant execute on function public.mock_pay_registration() to authenticated;
grant execute on function public.close_auction(uuid) to authenticated;
grant execute on function public.compute_lowest_unique_winner(uuid) to authenticated;
