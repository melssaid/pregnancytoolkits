
CREATE TABLE public.visitor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL,
  session_start timestamp with time zone NOT NULL DEFAULT now(),
  language text DEFAULT 'en',
  platform text DEFAULT 'web',
  referrer text,
  screen_width integer,
  is_twa boolean DEFAULT false,
  country_hint text
);

ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can log visits"
  ON public.visitor_sessions FOR INSERT
  WITH CHECK (true);

-- No public read (admin only via service_role)
CREATE POLICY "No public read"
  ON public.visitor_sessions FOR SELECT
  USING (false);

CREATE POLICY "Service role can read"
  ON public.visitor_sessions FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "No public update"
  ON public.visitor_sessions FOR UPDATE
  USING (false);

CREATE POLICY "No public delete"
  ON public.visitor_sessions FOR DELETE
  USING (false);

-- Index for analytics queries
CREATE INDEX idx_visitor_sessions_date ON public.visitor_sessions (session_start DESC);
CREATE INDEX idx_visitor_sessions_visitor ON public.visitor_sessions (visitor_id);
