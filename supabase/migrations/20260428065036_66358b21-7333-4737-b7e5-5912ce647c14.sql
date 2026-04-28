DO $$
DECLARE
  existing_jobid bigint;
BEGIN
  SELECT jobid INTO existing_jobid FROM cron.job WHERE jobname = 'daily-article-refresh-job';
  IF existing_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(existing_jobid);
  END IF;
END $$;

SELECT cron.schedule(
  'daily-article-refresh-job',
  '15 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://frlrngdogjzqpqpjhjvq.supabase.co/functions/v1/daily-article-refresh',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybHJuZ2RvZ2p6cXBxcGpoanZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTMzOTUsImV4cCI6MjA4NjkyOTM5NX0.mR1PQoK5WhLt2Had26Y-PWVe5JwebQCU_ad7v8gTaIY"}'::jsonb,
    body := jsonb_build_object('triggeredBy', 'cron', 'effectiveDate', to_char(now() AT TIME ZONE 'utc', 'YYYY-MM-DD'))
  ) AS request_id;
  $$
);