
-- Tighten the tool_analytics INSERT policy to require a non-empty session_id
-- instead of fully open WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.tool_analytics;

CREATE POLICY "Anyone can insert analytics"
  ON public.tool_analytics
  FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL AND length(session_id) > 0
  );
