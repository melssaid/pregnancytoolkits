
-- Drop the old permissive insert policy and replace with stricter validation
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.tool_analytics;

CREATE POLICY "Validated analytics insert only"
ON public.tool_analytics
FOR INSERT
WITH CHECK (
  -- Session ID must be non-empty and reasonable length
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 5 AND 100
  -- Tool ID must be lowercase alphanumeric with hyphens/underscores, 2-50 chars
  AND tool_id ~ '^[a-z0-9_-]{2,50}$'
  -- Action type must be lowercase with underscores, 2-50 chars
  AND action_type ~ '^[a-z_]{2,50}$'
  -- Metadata size limit (prevent large payloads)
  AND (metadata IS NULL OR length(metadata::text) <= 5000)
);

-- Update the rate limit trigger to be stricter (15 per minute instead of 30)
CREATE OR REPLACE FUNCTION public.check_analytics_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.tool_analytics
  WHERE session_id = NEW.session_id
    AND created_at > NOW() - INTERVAL '1 minute';

  IF recent_count >= 15 THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many analytics events per minute';
  END IF;

  RETURN NEW;
END;
$function$;
