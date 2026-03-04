-- Fix 1: Drop overly permissive subscription UPDATE policy
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Fix 2: Harden cleanup_old_ai_logs to match cleanup_old_analytics pattern
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
  calling_role TEXT;
BEGIN
  calling_role := current_user;
  IF calling_role NOT IN ('service_role', 'supabase_admin', 'postgres') THEN
    RAISE EXCEPTION 'Unauthorized: This function requires service_role or admin privileges. Current role: %', calling_role;
  END IF;
  DELETE FROM public.ai_usage_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_ai_logs() FROM public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_ai_logs() FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_ai_logs() FROM authenticated;