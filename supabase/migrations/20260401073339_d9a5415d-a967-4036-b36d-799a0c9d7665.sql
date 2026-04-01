CREATE TABLE public.billing_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  diagnostics_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  readiness_score integer NOT NULL DEFAULT 0,
  readiness_summary text NOT NULL DEFAULT 'NOT_READY',
  catalog_ready boolean NOT NULL DEFAULT false,
  errors text[] NOT NULL DEFAULT '{}'::text[]
);

ALTER TABLE public.billing_diagnostics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert diagnostics (including anonymous users)
CREATE POLICY "Anyone can insert diagnostics"
  ON public.billing_diagnostics FOR INSERT
  TO public
  WITH CHECK (true);

-- Only service_role can read diagnostics (admin only)
CREATE POLICY "Service role can read diagnostics"
  ON public.billing_diagnostics FOR SELECT
  TO service_role
  USING (true);

-- No public read/update/delete
CREATE POLICY "No public read"
  ON public.billing_diagnostics FOR SELECT
  TO public
  USING (false);

CREATE POLICY "No public update"
  ON public.billing_diagnostics FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "No public delete"
  ON public.billing_diagnostics FOR DELETE
  TO public
  USING (false);