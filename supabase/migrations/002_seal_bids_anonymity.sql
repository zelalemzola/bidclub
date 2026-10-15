-- Seal bids: players must not see other users' bids (names or amounts) until the auction ends.
-- Winner is revealed via auctions.winner_id / winning_amount_cents only.

drop policy if exists "Authenticated users can view bids" on public.bids;
drop policy if exists "Users see own bids; admins see all" on public.bids;

create policy "Users see own bids; admins see all"
  on public.bids for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());
