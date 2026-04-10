
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  language TEXT,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  total_subscribers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- No public access
CREATE POLICY "No public read" ON public.notification_logs FOR SELECT USING (false);
CREATE POLICY "No public insert" ON public.notification_logs FOR INSERT WITH CHECK (false);
CREATE POLICY "No public update" ON public.notification_logs FOR UPDATE USING (false);
CREATE POLICY "No public delete" ON public.notification_logs FOR DELETE USING (false);

-- Service role full access
CREATE POLICY "Service role can read" ON public.notification_logs FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role can insert" ON public.notification_logs FOR INSERT TO service_role WITH CHECK (true);
