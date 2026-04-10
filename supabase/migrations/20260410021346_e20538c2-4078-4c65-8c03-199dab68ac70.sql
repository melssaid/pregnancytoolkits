-- Table to store Web Push subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_language text NOT NULL DEFAULT 'en',
  pregnancy_week integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can save their push subscription (no auth required for TWA)
CREATE POLICY "Anyone can insert push subscription"
ON public.push_subscriptions
FOR INSERT
TO public
WITH CHECK (true);

-- Anyone can update their own subscription by endpoint
CREATE POLICY "Anyone can update push subscription"
ON public.push_subscriptions
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Only service_role can read (for sending notifications from edge function)
CREATE POLICY "Service role can read subscriptions"
ON public.push_subscriptions
FOR SELECT
TO service_role
USING (true);

-- No public reads
CREATE POLICY "No public read"
ON public.push_subscriptions
FOR SELECT
TO public
USING (false);

-- No public deletes
CREATE POLICY "No public delete"
ON public.push_subscriptions
FOR DELETE
TO public
USING (false);

-- Service role can delete expired subscriptions
CREATE POLICY "Service role can delete subscriptions"
ON public.push_subscriptions
FOR DELETE
TO service_role
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();