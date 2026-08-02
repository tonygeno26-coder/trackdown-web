-- Trackdown schema
-- Run this via Supabase MCP execute_sql (not the PostgREST schema cache).

create extension if not exists "pgcrypto";

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('tournament', 'cash')),
  down_length int not null check (down_length in (30, 40)),
  start_time timestamptz not null,
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active', 'completed')),
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Only one shift should be active at a time. Enforced in the app layer,
-- but this index makes it cheap to look up.
create index if not exists shifts_status_idx on shifts (status);
create index if not exists shifts_start_time_idx on shifts (start_time desc);

alter table shifts enable row level security;

-- Personal single-user tool for now: allow all operations via the anon key.
-- Tighten this with real auth (Supabase Auth) before sharing access with anyone else.
drop policy if exists "Allow all for anon" on shifts;
create policy "Allow all for anon"
  on shifts
  for all
  using (true)
  with check (true);

-- Incremental migrations (run via execute_sql)
alter table shifts add column if not exists title text not null default '';
alter table shifts add column if not exists house_tax_pct numeric not null default 0;
alter table shifts add column if not exists is_lump_sum boolean not null default false;
alter table shifts add column if not exists lump_sum_tips numeric;
alter table shifts add column if not exists settled_status text;
alter table shifts add column if not exists settled_amount numeric;
alter table shifts add column if not exists hourly_rate numeric;

alter table shifts drop constraint if exists shifts_type_check;
alter table shifts add constraint shifts_type_check check (type in ('tournament', 'cash', 'homegame'));

-- Playing sessions (separate from dealer shifts)
create table if not exists playing_sessions (
  id uuid primary key default gen_random_uuid(),
  session_type text not null check (
    session_type in ('cash', 'tournament')
  ),
  status text not null default 'active' check (
    status in ('active', 'completed')
  ),
  title text not null default '',
  location text not null default '',
  game text not null default '',
  stakes text not null default '',
  start_time timestamptz not null,
  ended_at timestamptz,
  initial_buy_in numeric not null default 0,
  additional_buy_ins numeric not null default 0,
  cash_out numeric,
  expenses numeric not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists playing_sessions_status_idx on playing_sessions (status);
create index if not exists playing_sessions_start_time_idx on playing_sessions (start_time desc);

alter table playing_sessions enable row level security;

drop policy if exists "Allow all for anon" on playing_sessions;
create policy "Allow all for anon"
  on playing_sessions
  for all
  using (true)
  with check (true);

-- App settings (single-user defaults)
create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  default_location text not null default '',
  default_poker_game text not null default '',
  default_poker_stakes text not null default '',
  default_table_game text not null default '',
  default_table_minimum numeric,
  default_tournament_hourly_rate numeric,
  default_tournament_down_length int
    check (default_tournament_down_length in (30, 40)),
  default_dealer_shift_type text
    check (
      default_dealer_shift_type in (
        'tournament',
        'cash',
        'homegame'
      )
    ),
  currency_code text not null default 'USD',
  developer_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

drop policy if exists "Allow all for anon" on app_settings;
create policy "Allow all for anon"
  on app_settings
  for all
  using (true)
  with check (true);

alter table shifts add column if not exists is_demo boolean not null default false;
alter table playing_sessions add column if not exists is_demo boolean not null default false;
