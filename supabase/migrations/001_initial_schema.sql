-- =====================================================
-- 🗄️ COMPLETE DATABASE SCHEMA FOR PREGNANCY TOOLS
-- Run this in Supabase SQL Editor if not already done
-- =====================================================

-- 1. جدول المستخدمين
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  due_date DATE,
  pregnancy_week INT DEFAULT 1,
  last_period_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول التتبع الصحي
CREATE TABLE IF NOT EXISTS health_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  weight DECIMAL(5,2),
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  temperature DECIMAL(4,1),
  symptoms JSONB DEFAULT '[]',
  mood TEXT,
  notes TEXT,
  week INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول صور البطن
CREATE TABLE IF NOT EXISTS bump_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  week INT NOT NULL,
  public_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  caption TEXT,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول الفيتامينات
CREATE TABLE IF NOT EXISTS vitamin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  vitamin_name TEXT NOT NULL,
  dosage TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  week INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول المواعيد
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  doctor_name TEXT,
  location TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  questions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول التغذية
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  foods JSONB NOT NULL,
  calories INT,
  nutrients JSONB,
  ai_suggestions TEXT,
  week INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول حركات الجنين
CREATE TABLE IF NOT EXISTS kick_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  kicks JSONB NOT NULL DEFAULT '[]',
  total_kicks INT DEFAULT 0,
  duration_minutes INT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  week INT,
  notes TEXT
);

-- 8. جدول محادثات AI
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. جدول Cache للـ AI
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  sources JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. جدول الفيديوهات المفضلة
CREATE TABLE IF NOT EXISTS favorite_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- 11. جدول التمارين
CREATE TABLE IF NOT EXISTS workout_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  duration_minutes INT,
  calories_burned INT,
  exercises JSONB DEFAULT '[]',
  week INT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 📦 STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('bump-photos', 'bump-photos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 🔐 ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE bump_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitamin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kick_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_progress ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
DO $$ BEGIN
  CREATE POLICY "Allow all user_profiles" ON user_profiles FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all health_tracking" ON health_tracking FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all bump_photos" ON bump_photos FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all vitamin_logs" ON vitamin_logs FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all appointments" ON appointments FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all nutrition_logs" ON nutrition_logs FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all kick_sessions" ON kick_sessions FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all ai_conversations" ON ai_conversations FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all ai_analysis_cache" ON ai_analysis_cache FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all favorite_videos" ON favorite_videos FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow all workout_progress" ON workout_progress FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Storage policies
DO $$ BEGIN
  CREATE POLICY "Public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'bump-photos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bump-photos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'bump-photos');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 📊 INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_health_user ON health_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_bump_user ON bump_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_vitamins_user ON vitamin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_user ON nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_kicks_user ON kick_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_analysis_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_workouts_user ON workout_progress(user_id);
