
-- Coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  duration_type TEXT NOT NULL CHECK (duration_type IN ('day', 'week', 'month')),
  max_claims INTEGER NOT NULL DEFAULT 100,
  current_claims INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read coupons" ON public.coupons
  FOR SELECT TO public USING (true);

-- No insert/update/delete from client
CREATE POLICY "No public insert coupons" ON public.coupons
  FOR INSERT TO public WITH CHECK (false);
CREATE POLICY "No public update coupons" ON public.coupons
  FOR UPDATE TO public USING (false);
CREATE POLICY "No public delete coupons" ON public.coupons
  FOR DELETE TO public USING (false);

-- Service role full access
CREATE POLICY "Service role manage coupons" ON public.coupons
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Coupon claims table
CREATE TABLE public.coupon_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupon_claims_device ON public.coupon_claims(device_fingerprint);
CREATE INDEX idx_coupon_claims_user ON public.coupon_claims(user_id);
CREATE UNIQUE INDEX idx_coupon_claims_unique ON public.coupon_claims(coupon_id, device_fingerprint);

ALTER TABLE public.coupon_claims ENABLE ROW LEVEL SECURITY;

-- No direct client access — all via service_role in Edge Function
CREATE POLICY "No public select claims" ON public.coupon_claims
  FOR SELECT TO public USING (false);
CREATE POLICY "No public insert claims" ON public.coupon_claims
  FOR INSERT TO public WITH CHECK (false);
CREATE POLICY "No public update claims" ON public.coupon_claims
  FOR UPDATE TO public USING (false);
CREATE POLICY "No public delete claims" ON public.coupon_claims
  FOR DELETE TO public USING (false);

CREATE POLICY "Service role manage claims" ON public.coupon_claims
  FOR ALL TO service_role USING (true) WITH CHECK (true);
