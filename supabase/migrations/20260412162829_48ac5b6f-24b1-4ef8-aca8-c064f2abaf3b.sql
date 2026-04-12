INSERT INTO coupons (code, bonus_points, duration_type, max_claims, is_active, expires_at)
VALUES 
  ('MOHAMED60', 60, 'month', 10000, true, NULL),
  ('MOHAMED20', 60, 'month', 10000, true, NULL),
  ('SAHAR60', 60, 'month', 10000, true, NULL),
  ('SAHAR20', 60, 'week', 10000, true, NULL),
  ('WELCOME2026', 60, 'week', 10000, true, '2026-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;