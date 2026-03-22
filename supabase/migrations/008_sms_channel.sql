-- Phase 8: SMS channel infrastructure
-- Tables: sms_send_log, sms_conversations
-- Consent columns on subscriber_preferences
-- Queue: sms_delivery (pgmq)
-- Functions: enqueue_sms_delivery
-- Cron: 3 delivery windows (5 min after email)
-- Depends on: 001_subscribers.sql, 002_subscriber_preferences.sql, 005_pgmq_setup.sql

-- ============================================================
-- SMS send log: tracks every SMS sent/received via Twilio
-- ============================================================

CREATE TABLE sms_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  twilio_sid TEXT,
  message_body TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('outbound', 'inbound')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'undelivered')),
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_sms_send_log_subscriber ON sms_send_log(subscriber_id, sent_at DESC);

-- Enforces 1 outbound SMS per subscriber per day
CREATE UNIQUE INDEX idx_sms_daily_outbound
  ON sms_send_log(subscriber_id, (sent_at::date))
  WHERE direction = 'outbound';

-- ============================================================
-- SMS conversations: last 5 messages per daily session
-- ============================================================

CREATE TABLE sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_sms_conversations_session ON sms_conversations(subscriber_id, session_date, created_at);

-- ============================================================
-- TCPA consent columns on subscriber_preferences
-- ============================================================

ALTER TABLE subscriber_preferences
  ADD COLUMN IF NOT EXISTS sms_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_consent_ip TEXT;

-- ============================================================
-- Row Level Security for both SMS tables
-- ============================================================

ALTER TABLE sms_send_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role sms_send_log" ON sms_send_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public sms_send_log" ON sms_send_log
  FOR ALL TO anon USING (false);

ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role sms_conversations" ON sms_conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public sms_conversations" ON sms_conversations
  FOR ALL TO anon USING (false);

-- ============================================================
-- Create SMS delivery queue (pgmq)
-- ============================================================

SELECT pgmq.create('sms_delivery');

-- ============================================================
-- Enqueue function: creates one pgmq message per active
-- SMS-opted-in subscriber matching the given delivery_time window
-- ============================================================

CREATE OR REPLACE FUNCTION enqueue_sms_delivery(time_window TEXT)
RETURNS void AS $$
DECLARE
  sub RECORD;
BEGIN
  FOR sub IN
    SELECT s.id
    FROM subscribers s
    JOIN subscriber_preferences sp ON sp.subscriber_id = s.id
    WHERE s.status = 'active'
    AND sp.sms_opt_in = true
    AND sp.phone IS NOT NULL
    AND sp.phone != ''
    AND sp.delivery_time = time_window
  LOOP
    PERFORM pgmq.send('sms_delivery', jsonb_build_object(
      'subscriber_id', sub.id,
      'research_date', CURRENT_DATE::text,
      'enqueued_at', now(),
      'retry_count', 0
    ));
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- pg_cron jobs: 3 SMS delivery windows (5 min after email)
-- Per locked decision: SMS fires 5 minutes after email delivery
-- ============================================================

SELECT cron.schedule('sms-delivery-morning', '5 6 * * *', $$ SELECT enqueue_sms_delivery('morning'); $$);
SELECT cron.schedule('sms-delivery-afternoon', '5 12 * * *', $$ SELECT enqueue_sms_delivery('afternoon'); $$);
SELECT cron.schedule('sms-delivery-evening', '5 18 * * *', $$ SELECT enqueue_sms_delivery('evening'); $$);
