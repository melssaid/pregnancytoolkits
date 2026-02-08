
-- Add CHECK constraints to validate analytics data at the database level
-- This prevents data poisoning even if client-side validation is bypassed

-- Validate tool_id format: 2-50 chars, lowercase alphanumeric with hyphens/underscores
ALTER TABLE public.tool_analytics
ADD CONSTRAINT chk_tool_id_format
CHECK (tool_id ~ '^[a-z0-9_-]{2,50}$');

-- Validate action_type format: 2-50 chars, lowercase with underscores
ALTER TABLE public.tool_analytics
ADD CONSTRAINT chk_action_type_format
CHECK (action_type ~ '^[a-z_]{2,50}$');

-- Validate session_id length: max 100 chars
ALTER TABLE public.tool_analytics
ADD CONSTRAINT chk_session_id_length
CHECK (char_length(session_id) <= 100 AND char_length(session_id) >= 5);

-- Validate metadata size: max 10KB
ALTER TABLE public.tool_analytics
ADD CONSTRAINT chk_metadata_size
CHECK (metadata IS NULL OR octet_length(metadata::text) <= 10240);

-- Create a rate-limiting function to prevent analytics flooding
-- Limits to 30 inserts per session_id per minute
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.tool_analytics
  WHERE session_id = NEW.session_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many analytics events per minute';
  END IF;

  RETURN NEW;
END;
$$;

-- Attach the rate-limiting trigger
CREATE TRIGGER trg_analytics_rate_limit
BEFORE INSERT ON public.tool_analytics
FOR EACH ROW
EXECUTE FUNCTION public.check_analytics_rate_limit();
