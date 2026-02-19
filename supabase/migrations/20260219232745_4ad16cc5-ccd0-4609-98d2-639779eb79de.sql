-- Drop unused tables that were created in initial migration but are not used by the application
-- These tables had USING(true) policies which would allow unrestricted access if ever populated

DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.health_tracking CASCADE;
DROP TABLE IF EXISTS public.vitamin_logs CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.nutrition_logs CASCADE;
DROP TABLE IF EXISTS public.kick_sessions CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.ai_analysis_cache CASCADE;
DROP TABLE IF EXISTS public.favorite_videos CASCADE;
DROP TABLE IF EXISTS public.workout_progress CASCADE;