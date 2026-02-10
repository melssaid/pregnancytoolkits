
-- Replace cleanup_old_analytics with SECURITY INVOKER instead of SECURITY DEFINER
-- service_role already bypasses RLS, so SECURITY DEFINER is not needed
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count INTEGER;
  calling_role TEXT;
BEGIN
  -- Get the current role
  calling_role := current_user;
  
  -- Only allow service_role or supabase_admin to execute
  IF calling_role NOT IN ('service_role', 'supabase_admin', 'postgres') THEN
    RAISE EXCEPTION 'Unauthorized: This function requires service_role or admin privileges. Current role: %', calling_role;
  END IF;
  
  DELETE FROM public.tool_analytics
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Cleaned up % old analytics records', deleted_count;
  
  RETURN deleted_count;
END;
$function$;

-- Ensure only service_role can execute
REVOKE EXECUTE ON FUNCTION public.cleanup_old_analytics() FROM public;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_analytics() FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_analytics() FROM authenticated;
