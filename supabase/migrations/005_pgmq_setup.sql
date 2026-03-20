-- Phase 4: pgmq queue infrastructure, RPC wrappers, and pg_cron scheduling
-- Depends on: 004_research_schema.sql

-- ============================================================
-- Enable extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgmq;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- Create research jobs queue
-- ============================================================

SELECT pgmq.create('research_jobs');

-- ============================================================
-- RPC wrapper functions (Edge Functions access pgmq via supabase.rpc())
-- ============================================================

CREATE OR REPLACE FUNCTION pgmq_send(queue_name TEXT, msg JSONB)
RETURNS BIGINT AS $$
  SELECT pgmq.send(queue_name, msg);
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION pgmq_read(queue_name TEXT, vt INTEGER, qty INTEGER)
RETURNS SETOF pgmq.message_record AS $$
  SELECT * FROM pgmq.read(queue_name, vt, qty);
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION pgmq_archive(queue_name TEXT, msg_id BIGINT)
RETURNS BOOLEAN AS $$
  SELECT pgmq.archive(queue_name, msg_id);
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION pgmq_delete(queue_name TEXT, msg_id BIGINT)
RETURNS BOOLEAN AS $$
  SELECT pgmq.delete(queue_name, msg_id);
$$ LANGUAGE SQL;

-- ============================================================
-- Enqueue function: creates one pgmq message per active subscriber
-- ============================================================

CREATE OR REPLACE FUNCTION enqueue_daily_research()
RETURNS void AS $$
DECLARE
  sub RECORD;
BEGIN
  FOR sub IN SELECT id FROM subscribers WHERE status = 'active' LOOP
    PERFORM pgmq.send('research_jobs', jsonb_build_object(
      'subscriber_id', sub.id,
      'enqueued_at', now(),
      'retry_count', 0
    ));
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Store secrets in Vault for cron job access
-- NOTE: Replace <project-ref> and <anon-key> with actual values
-- before running this migration
-- ============================================================

-- IMPORTANT: Uncomment and fill these with your actual Supabase project values:
-- SELECT vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
-- SELECT vault.create_secret('<anon-key>', 'anon_key');

-- ============================================================
-- pg_cron job: 6am UTC daily
-- Enqueues all active subscribers, then triggers Edge Function
-- NOTE: Vault secrets must be set before this job runs successfully
-- ============================================================

SELECT cron.schedule(
  'daily-research-enqueue',
  '0 6 * * *',
  $$
    -- Step 1: Enqueue all active subscribers
    SELECT enqueue_daily_research();

    -- Step 2: Cleanup expired cache and old dedup hashes
    SELECT cleanup_research_data();

    -- Step 3: Trigger Edge Function to process queue
    -- NOTE: Uncomment after setting Vault secrets above
    -- SELECT net.http_post(
    --   url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
    --          || '/functions/v1/research-pipeline',
    --   headers := jsonb_build_object(
    --     'Content-Type', 'application/json',
    --     'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    --   ),
    --   body := '{"trigger": "cron"}'::jsonb
    -- ) AS request_id;
  $$
);
