-- 009_google_ads_actions.sql
-- Google Ads AI optimizer action log

CREATE TABLE google_ads_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE INDEX idx_google_ads_actions_status ON google_ads_actions(status);
CREATE INDEX idx_google_ads_actions_created ON google_ads_actions(created_at DESC);
