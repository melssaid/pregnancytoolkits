
-- Allow service_role to UPDATE subscriptions (Edge Function uses service_role to bypass RLS)
-- Note: service_role bypasses RLS by default, but we add an explicit policy for clarity

-- Add UPDATE policy that only allows the service_role (used by Edge Functions)
CREATE POLICY "Service role can update subscriptions"
ON public.subscriptions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
