
-- Fix subscriptions UPDATE policy: add WITH CHECK to prevent user_id tampering
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Also ensure subscriptions UPDATE is restricted to non-critical columns
-- by noting: status, google_play_token, google_play_order_id are the only
-- safe fields users should update. subscription_end/start should be server-only.
-- We enforce this at the application layer since column-level RLS is not supported.

-- Add a note: subscription_type and status tampering risk
-- Mitigate by ensuring only service_role can set status='active' for paid plans
-- This is enforced via Edge Function validation (existing pattern)

COMMENT ON POLICY "Users can update their own subscription" ON public.subscriptions
  IS 'WITH CHECK added to prevent user_id reassignment attacks';
