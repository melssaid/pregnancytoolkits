-- Create a function to cleanup old analytics records (90 day retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.tool_analytics
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup for monitoring
  RAISE NOTICE 'Cleaned up % old analytics records', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Create an index on created_at for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_tool_analytics_created_at 
ON public.tool_analytics(created_at);

-- Add a comment documenting the retention policy
COMMENT ON FUNCTION public.cleanup_old_analytics() IS 
'Deletes analytics records older than 90 days. Should be called periodically via cron or scheduled task. Data retention policy: 90 days for anonymous analytics.';