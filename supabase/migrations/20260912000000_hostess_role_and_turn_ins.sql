-- Hostess role for Home Game shifts: periodic chip turn-ins instead of a down schedule

alter table shifts add column if not exists role text check (role in ('dealer', 'hostess'));
alter table shifts add column if not exists tax_model text check (tax_model in ('flat', 'tiered'));
alter table shifts add column if not exists tiered_threshold numeric default 1000;
alter table shifts add column if not exists tiered_rate_below numeric default 25;
alter table shifts add column if not exists tiered_rate_above numeric default 50;
alter table shifts add column if not exists turn_ins jsonb not null default '[]'::jsonb;

update shifts set role = 'dealer' where type = 'homegame' and role is null;
