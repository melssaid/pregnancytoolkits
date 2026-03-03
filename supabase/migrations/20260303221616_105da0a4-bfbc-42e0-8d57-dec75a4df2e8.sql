
-- AI Usage Logs table for tracking actual API consumption
CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  ai_type text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  client_id text NOT NULL,
  user_id uuid,
  tokens_used integer DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  response_time_ms integer
);

-- Index for daily/monthly aggregation queries
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage_logs (created_at DESC);
CREATE INDEX idx_ai_usage_type ON public.ai_usage_logs (ai_type);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role can read (admin dashboard will use edge function)
CREATE POLICY "No direct access" ON public.ai_usage_logs FOR SELECT USING (false);
CREATE POLICY "No direct insert" ON public.ai_usage_logs FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update" ON public.ai_usage_logs FOR UPDATE USING (false);
CREATE POLICY "No direct delete" ON public.ai_usage_logs FOR DELETE USING (false);

-- Cleanup function for old logs (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ai_usage_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
