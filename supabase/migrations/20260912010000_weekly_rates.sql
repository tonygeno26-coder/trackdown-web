-- Weekly Pay: posted per-down tournament rate for a Monday-Sunday week.
-- user_id + RLS mirror 20260810210000_user_data_isolation.sql; the unique
-- constraint is on (user_id, week_start) rather than week_start alone so
-- each anonymous-auth user gets their own rate per week.

create table if not exists weekly_rates (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  down_rate numeric not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_rates_user_id_idx on public.weekly_rates(user_id);

alter table public.weekly_rates enable row level security;

drop policy if exists "Users manage own weekly rates" on public.weekly_rates;
create policy "Users manage own weekly rates"
  on public.weekly_rates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_weekly_rates_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_weekly_rates_user_id on public.weekly_rates;
create trigger set_weekly_rates_user_id
  before insert on public.weekly_rates
  for each row
  execute function public.set_weekly_rates_user_id();
