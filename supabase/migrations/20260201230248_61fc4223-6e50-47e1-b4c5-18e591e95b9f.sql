-- Add explicit DENY policies for UPDATE and DELETE on tool_analytics
-- This ensures no one can modify or delete analytics records directly

CREATE POLICY "No direct update access"
ON public.tool_analytics
FOR UPDATE
USING (false);

CREATE POLICY "No direct delete access"
ON public.tool_analytics
FOR DELETE
USING (false);

-- Update the cleanup_old_analytics function to add authorization check
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Log cleanup for monitoring
  RAISE NOTICE 'Cleaned up % old analytics records', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Revoke execute from public roles to ensure only service role can call it
REVOKE EXECUTE ON FUNCTION public.cleanup_old_analytics() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_analytics() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_analytics() FROM anon;

-- Add documentation comment
COMMENT ON FUNCTION public.cleanup_old_analytics() IS 
'SECURITY: This function uses SECURITY DEFINER to bypass RLS. Only callable via service role key in automated cleanup tasks. Never grant EXECUTE to public or authenticated roles.';