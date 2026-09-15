-- The "Authenticated users can view unclaimed shifts" SELECT policy was an
-- unconditional `user_id IS NULL` grant to the whole `shifts` table. Since
-- RLS OR's permissive policies together, this meant EVERY authenticated
-- user's normal shift queries (Home/Stats/History) silently included every
-- other user's still-unclaimed legacy shifts, not just their own — visible
-- forever, not just during the one-time claim flow. Replace the blanket
-- policy with a SECURITY DEFINER function scoped to that specific use case.

drop policy if exists "Authenticated users can view unclaimed shifts" on public.shifts;

create or replace function public.get_unclaimed_shifts()
returns setof public.shifts
language sql
security definer
set search_path = public
as $$
  select * from public.shifts where user_id is null order by start_time desc;
$$;

revoke all on function public.get_unclaimed_shifts() from public;
grant execute on function public.get_unclaimed_shifts() to authenticated;
