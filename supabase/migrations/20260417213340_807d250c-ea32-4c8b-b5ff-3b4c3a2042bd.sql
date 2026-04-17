-- جدول لتتبع حالة الاستهلاك لكل جهاز
CREATE TABLE public.ai_quota_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  points_used INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- فهرس سريع للبحث
CREATE INDEX idx_ai_quota_state_fingerprint ON public.ai_quota_state(device_fingerprint);
CREATE INDEX idx_ai_quota_state_client_id ON public.ai_quota_state(client_id);

-- تفعيل RLS
ALTER TABLE public.ai_quota_state ENABLE ROW LEVEL SECURITY;

-- منع كل وصول عام — service role فقط
CREATE POLICY "No public read quota state"
ON public.ai_quota_state FOR SELECT
USING (false);

CREATE POLICY "No public insert quota state"
ON public.ai_quota_state FOR INSERT
WITH CHECK (false);

CREATE POLICY "No public update quota state"
ON public.ai_quota_state FOR UPDATE
USING (false);

CREATE POLICY "No public delete quota state"
ON public.ai_quota_state FOR DELETE
USING (false);

CREATE POLICY "Service role full access quota state"
ON public.ai_quota_state FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.update_ai_quota_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ai_quota_state_updated_at
BEFORE UPDATE ON public.ai_quota_state
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_quota_updated_at();

-- دالة لحساب الاستهلاك الفعلي من ai_usage_logs (آخر 30 يوم)
CREATE OR REPLACE FUNCTION public.get_quota_usage(
  _device_fingerprint TEXT,
  _client_id TEXT,
  _window_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  points_used INTEGER,
  period_start TIMESTAMP WITH TIME ZONE,
  call_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _period_start TIMESTAMP WITH TIME ZONE;
BEGIN
  _period_start := now() - (_window_days || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT
    COALESCE(SUM(
      CASE 
        WHEN ai_type LIKE '%premium%' OR ai_type LIKE '%advanced%' THEN 3
        WHEN ai_type LIKE '%insight%' OR ai_type LIKE '%analysis%' THEN 2
        ELSE 1
      END
    ), 0)::INTEGER AS points_used,
    _period_start AS period_start,
    COUNT(*)::BIGINT AS call_count
  FROM public.ai_usage_logs
  WHERE (client_id = _client_id OR client_id = _device_fingerprint)
    AND created_at >= _period_start
    AND success = true;
END;
$$;