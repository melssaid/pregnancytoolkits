CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE public.article_daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  language TEXT NOT NULL,
  title_override TEXT,
  excerpt_override TEXT,
  intro_override TEXT,
  markdown_body TEXT NOT NULL,
  seo_description TEXT,
  reading_minutes INTEGER,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT article_daily_content_slug_language_date_key UNIQUE (slug, language, effective_date)
);

CREATE INDEX idx_article_daily_content_lookup
  ON public.article_daily_content (slug, language, effective_date DESC);

CREATE INDEX idx_article_daily_content_published
  ON public.article_daily_content (language, is_published, effective_date DESC);

CREATE TABLE public.article_refresh_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'started',
  source_model TEXT,
  languages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  processed_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_article_refresh_runs_date
  ON public.article_refresh_runs (run_date DESC, started_at DESC);

ALTER TABLE public.article_daily_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_refresh_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published daily article content"
ON public.article_daily_content
FOR SELECT
USING (
  is_published = true
  AND effective_date <= CURRENT_DATE
  AND (expires_at IS NULL OR expires_at > now())
);

CREATE POLICY "No public access to article refresh runs"
ON public.article_refresh_runs
FOR SELECT
USING (false);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_article_daily_content_updated_at ON public.article_daily_content;
CREATE TRIGGER update_article_daily_content_updated_at
BEFORE UPDATE ON public.article_daily_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_article_refresh_runs_updated_at ON public.article_refresh_runs;
CREATE TRIGGER update_article_refresh_runs_updated_at
BEFORE UPDATE ON public.article_refresh_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();