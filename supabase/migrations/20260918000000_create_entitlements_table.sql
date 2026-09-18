-- Tracks manual entitlement overrides (currently just "grandfathered" beta
-- testers and the App Review account) separately from the paid-subscription
-- source of truth, which lives in RevenueCat. Deliberately NOT part of
-- `profiles`: that table's RLS policy lets a user update their own row, and
-- a self-writable grandfathered flag would let anyone bypass the paywall.
-- This table has a SELECT policy only — no INSERT/UPDATE/DELETE policy for
-- authenticated/anon at all, so it's read-only from the client; entitlements
-- are only ever granted via direct SQL/dashboard access. Also built to hold
-- future manually-granted entitlements beyond just "grandfathered" without
-- a schema change (e.g. comped accounts, promo access).

create table public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  grandfathered boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "Users can view own entitlements"
  on public.entitlements for select
  using (auth.uid() = user_id);
