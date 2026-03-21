-- Phase 6: Email delivery infrastructure
-- Tables: send_log, subscriber_feedback, warm_up_config
-- Queue: email_delivery (pgmq)
-- Functions: enqueue_email_delivery, increment_warm_up
-- Cron: 3 delivery windows + 1 warm-up increment
-- Depends on: 001_subscribers.sql, 002_subscriber_preferences.sql, 005_pgmq_setup.sql

-- ============================================================
-- Send log: tracks every email sent via Resend
-- ============================================================

CREATE TABLE send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  resend_id TEXT,
  subject TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('digest', 'briefing', 'mixed', 'fallback')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed', 'complained', 'skipped')),
  error TEXT,
  opened_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_send_log_subscriber ON send_log(subscriber_id, sent_at DESC);
CREATE INDEX idx_send_log_resend_id ON send_log(resend_id);
CREATE INDEX idx_send_log_status ON send_log(status, sent_at);

-- ============================================================
-- Subscriber feedback: more/less signals on individual items
-- ============================================================

CREATE TABLE subscriber_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  item_url TEXT NOT NULL,
  signal TEXT NOT NULL CHECK (signal IN ('more', 'less')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_feedback_subscriber ON subscriber_feedback(subscriber_id, created_at DESC);

-- ============================================================
-- Warm-up config: graduated volume control for domain reputation
-- ============================================================

CREATE TABLE warm_up_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_send_limit INTEGER NOT NULL DEFAULT 50,
  max_daily_limit INTEGER NOT NULL DEFAULT 500,
  current_day INTEGER NOT NULL DEFAULT 1,
  last_adjusted_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- Row Level Security for all three tables
-- ============================================================

ALTER TABLE send_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role send_log" ON send_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public send_log" ON send_log
  FOR ALL TO anon USING (false);

ALTER TABLE subscriber_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role subscriber_feedback" ON subscriber_feedback
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public subscriber_feedback" ON subscriber_feedback
  FOR ALL TO anon USING (false);

ALTER TABLE warm_up_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role warm_up_config" ON warm_up_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public warm_up_config" ON warm_up_config
  FOR ALL TO anon USING (false);

-- ============================================================
-- Create email delivery queue (pgmq)
-- ============================================================

SELECT pgmq.create('email_delivery');

-- ============================================================
-- Enqueue function: creates one pgmq message per active subscriber
-- matching the given delivery_time window
-- ============================================================

CREATE OR REPLACE FUNCTION enqueue_email_delivery(time_window TEXT)
RETURNS void AS $$
DECLARE
  sub RECORD;
BEGIN
  FOR sub IN
    SELECT s.id
    FROM subscribers s
    JOIN subscriber_preferences sp ON sp.subscriber_id = s.id
    WHERE s.status = 'active'
    AND sp.delivery_time = time_window
  LOOP
    PERFORM pgmq.send('email_delivery', jsonb_build_object(
      'subscriber_id', sub.id,
      'research_date', CURRENT_DATE::text,
      'enqueued_at', now(),
      'retry_count', 0
    ));
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Warm-up auto-increment function (MAIL-06)
-- Increments current_day daily; every 3rd day increases
-- daily_send_limit by 50%, capped at max_daily_limit
--
-- Progression: 50 -> 75 -> 113 -> 170 -> 255 -> 383 -> 500
-- Reaches 500 cap around day 19 (~3 weeks)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_warm_up()
RETURNS void AS $$
BEGIN
  UPDATE warm_up_config
  SET
    current_day = current_day + 1,
    daily_send_limit = CASE
      WHEN (current_day + 1) % 3 = 0
      THEN LEAST(CEIL(daily_send_limit * 1.5)::integer, max_daily_limit)
      ELSE daily_send_limit
    END,
    last_adjusted_at = CASE
      WHEN (current_day + 1) % 3 = 0 THEN now()
      ELSE last_adjusted_at
    END
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- pg_cron jobs: 3 delivery windows + 1 warm-up increment
-- ============================================================

SELECT cron.schedule('email-delivery-morning', '0 6 * * *', $$ SELECT enqueue_email_delivery('morning'); $$);
SELECT cron.schedule('email-delivery-afternoon', '0 12 * * *', $$ SELECT enqueue_email_delivery('afternoon'); $$);
SELECT cron.schedule('email-delivery-evening', '0 18 * * *', $$ SELECT enqueue_email_delivery('evening'); $$);
SELECT cron.schedule('warm-up-increment', '1 0 * * *', $$ SELECT increment_warm_up(); $$);

-- ============================================================
-- Seed warm-up config with initial row
-- ============================================================

INSERT INTO warm_up_config (daily_send_limit, max_daily_limit, current_day, is_active)
VALUES (50, 500, 1, true);
