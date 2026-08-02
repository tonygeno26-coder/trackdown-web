-- Saved hands for poker study / replay (not financial tracking)
CREATE TABLE IF NOT EXISTS public.saved_hands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.playing_sessions(id) ON DELETE SET NULL,
  casino text NOT NULL DEFAULT '',
  game text NOT NULL DEFAULT '',
  stakes text NOT NULL DEFAULT '',
  played_at timestamptz NOT NULL DEFAULT now(),
  hero_position text NOT NULL DEFAULT '',
  villain_position text NOT NULL DEFAULT '',
  effective_stack text NOT NULL DEFAULT '',
  hero_cards text NOT NULL DEFAULT '',
  board_cards text NOT NULL DEFAULT '',
  action_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  result text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_hands_user_id_idx ON public.saved_hands(user_id);
CREATE INDEX IF NOT EXISTS saved_hands_played_at_idx ON public.saved_hands(played_at DESC);
CREATE INDEX IF NOT EXISTS saved_hands_tags_idx ON public.saved_hands USING gin(tags);

ALTER TABLE public.saved_hands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved hands"
  ON public.saved_hands
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
