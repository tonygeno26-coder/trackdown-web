-- Combined tournament + cash game dealer shifts

ALTER TABLE public.shifts DROP CONSTRAINT IF EXISTS shifts_type_check;
ALTER TABLE public.shifts ADD CONSTRAINT shifts_type_check
  CHECK (type IN ('tournament', 'cash', 'homegame', 'tournament_cash'));

ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS active_segment text;
ALTER TABLE public.shifts DROP CONSTRAINT IF EXISTS shifts_active_segment_check;
ALTER TABLE public.shifts ADD CONSTRAINT shifts_active_segment_check
  CHECK (active_segment IS NULL OR active_segment IN ('tournament', 'cash'));
