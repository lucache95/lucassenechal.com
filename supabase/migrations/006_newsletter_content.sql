-- Phase 5: Newsletter content storage
-- Stores generated content per subscriber per day for Phase 6 email rendering
-- Depends on: 001_subscribers.sql (subscribers table)

CREATE TABLE newsletter_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('digest', 'briefing', 'mixed')),
  subject TEXT NOT NULL,
  content_json JSONB NOT NULL,
  research_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_partial BOOLEAN NOT NULL DEFAULT false,
  result_count INTEGER NOT NULL DEFAULT 0,
  token_usage_input INTEGER DEFAULT 0,
  token_usage_output INTEGER DEFAULT 0,
  cost_estimate_usd NUMERIC(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_newsletter_content_subscriber_date
  ON newsletter_content(subscriber_id, research_date);
CREATE UNIQUE INDEX idx_newsletter_content_unique
  ON newsletter_content(subscriber_id, research_date);

-- RLS: service_role full access, deny anon
ALTER TABLE newsletter_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role newsletter_content" ON newsletter_content
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Deny public newsletter_content" ON newsletter_content
  FOR ALL TO anon USING (false);
