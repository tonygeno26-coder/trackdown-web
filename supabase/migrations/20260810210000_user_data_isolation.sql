-- Per-user data isolation: add user_id columns and replace permissive RLS policies.
-- Existing rows without user_id remain in the database but are invisible under RLS.

ALTER TABLE public.shifts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.playing_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS shifts_user_id_idx ON public.shifts(user_id);
CREATE INDEX IF NOT EXISTS playing_sessions_user_id_idx ON public.playing_sessions(user_id);
CREATE INDEX IF NOT EXISTS app_settings_user_id_idx ON public.app_settings(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_user_id_unique ON public.app_settings(user_id)
  WHERE user_id IS NOT NULL;

-- Replace wide-open anon policies
DROP POLICY IF EXISTS "Allow all for anon" ON public.shifts;
DROP POLICY IF EXISTS "Allow all for anon" ON public.playing_sessions;
DROP POLICY IF EXISTS "Allow all for anon" ON public.app_settings;

CREATE POLICY "Users manage own shifts"
  ON public.shifts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own playing sessions"
  ON public.playing_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own app settings"
  ON public.app_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Defense-in-depth: auto-assign user_id on insert when client omits it
CREATE OR REPLACE FUNCTION public.set_user_id_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_shifts_user_id ON public.shifts;
CREATE TRIGGER set_shifts_user_id
  BEFORE INSERT ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_from_auth();

DROP TRIGGER IF EXISTS set_playing_sessions_user_id ON public.playing_sessions;
CREATE TRIGGER set_playing_sessions_user_id
  BEFORE INSERT ON public.playing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_from_auth();

DROP TRIGGER IF EXISTS set_app_settings_user_id ON public.app_settings;
CREATE TRIGGER set_app_settings_user_id
  BEFORE INSERT ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_from_auth();
