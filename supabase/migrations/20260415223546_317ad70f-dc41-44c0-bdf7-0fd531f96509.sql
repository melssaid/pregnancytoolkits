
CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  notification_type text,
  purchase_token text,
  subscription_id text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processing_status text NOT NULL DEFAULT 'success',
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access" ON public.webhook_logs FOR SELECT TO public USING (false);
CREATE POLICY "No public insert" ON public.webhook_logs FOR INSERT TO public WITH CHECK (false);
CREATE POLICY "No public update" ON public.webhook_logs FOR UPDATE TO public USING (false);
CREATE POLICY "No public delete" ON public.webhook_logs FOR DELETE TO public USING (false);
CREATE POLICY "Service role full access" ON public.webhook_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs (event_type);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs (created_at DESC);
