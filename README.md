# BidClub

Realtime lowest-unique-bid arena. Turborepo monorepo with separate user and admin Next.js apps, Supabase auth/DB/realtime, RTK Query, and shared shadcn-style UI.

## Apps

| App | Port | Purpose |
| --- | --- | --- |
| `apps/web` | 3000 | Player experience — signup, registration fee, live auction room |
| `apps/admin` | 3001 | Backoffice — list products, activate auctions, monitor, force-close |

## Packages

- `@bidclub/ui` — design tokens + shadcn-based components (Live Arena Vault)
- `@bidclub/shared` — bid range (`0.00…100.00` ETB), Zod schemas, types, constants
- `@bidclub/config` — shared TS base config

## Rules

- One-time mock registration fee: **100 ETB**
- Per-bid mock fee: **75 ETB**
- Valid bids: any amount from `0.00` to `100.00` ETB (stored as cents)
- Auction closes after **20 days** (wall-clock timer only)
- Per-product **bid fee** (admin-set; default 75 ETB)
- Winner = **lowest amount that appears exactly once**
- Users may bid multiple times

## Setup

```bash
pnpm install
```

1. Create a Supabase project.
2. Copy `.env.example` values into:
   - `apps/web/.env.local`
   - `apps/admin/.env.local`
3. Run the SQL in `supabase/migrations/` (001 → 008) in the Supabase SQL editor.
4. Promote an admin user:

```sql
update profiles set role = 'admin' where id = '<auth-user-uuid>';
```

5. Start both apps:

```bash
pnpm dev
```

Or individually:

```bash
pnpm dev:web
pnpm dev:admin
```

## Payments

Mock only for now (`mock_pay_registration`, `place_bid` RPCs). Telebirr can replace the payment provider later without changing auction rules.
