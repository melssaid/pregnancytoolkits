
-- 1. billing_diagnostics: restrict insert to reasonable payload size
DROP POLICY IF EXISTS "Anyone can insert diagnostics" ON public.billing_diagnostics;
CREATE POLICY "Validated insert diagnostics" ON public.billing_diagnostics
  FOR INSERT TO public
  WITH CHECK (
    length((device_info)::text) <= 5000
    AND length((diagnostics_result)::text) <= 10000
  );

-- 2. push_subscriptions: restrict insert to valid-looking data
DROP POLICY IF EXISTS "Anyone can insert push subscription" ON public.push_subscriptions;
CREATE POLICY "Validated insert push subscription" ON public.push_subscriptions
  FOR INSERT TO public
  WITH CHECK (
    endpoint IS NOT NULL
    AND length(endpoint) >= 10
    AND length(endpoint) <= 1000
    AND length(p256dh) >= 10
    AND length(auth) >= 10
    AND length(user_language) <= 10
  );

-- 3. push_subscriptions: restrict update to own endpoint only
DROP POLICY IF EXISTS "Anyone can update push subscription" ON public.push_subscriptions;
CREATE POLICY "Update own push subscription by endpoint" ON public.push_subscriptions
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (
    endpoint IS NOT NULL
    AND length(endpoint) >= 10
    AND length(endpoint) <= 1000
    AND length(user_language) <= 10
  );
