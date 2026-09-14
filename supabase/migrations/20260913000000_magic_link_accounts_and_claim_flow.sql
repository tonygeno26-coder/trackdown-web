-- profiles: tracks whether a user has completed (or explicitly skipped) the
-- one-time claim-your-past-shifts flow. One row per auth.users identity
-- (anonymous or linked), auto-created via trigger.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  claim_completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- Backfill profiles for identities that already exist (the distinct
-- anonymous users already using the app before this migration).
insert into public.profiles (id)
select distinct user_id from public.shifts where user_id is not null
on conflict (id) do nothing;

-- Unclaimed-shifts pool: the existing "Users manage own shifts" policy
-- (auth.uid() = user_id) can never match a NULL user_id — NULL = NULL is not
-- true in SQL — so without these, no authenticated client could ever see or
-- claim the legacy pre-isolation rows. These are additive (OR'd with the
-- existing policy), not a replacement, and only ever touch rows that are
-- currently unclaimed.
drop policy if exists "Authenticated users can view unclaimed shifts" on public.shifts;
create policy "Authenticated users can view unclaimed shifts"
  on public.shifts
  for select
  using (user_id is null);

drop policy if exists "Authenticated users can claim unclaimed shifts" on public.shifts;
create policy "Authenticated users can claim unclaimed shifts"
  on public.shifts
  for update
  using (user_id is null)
  with check (auth.uid() = user_id);
