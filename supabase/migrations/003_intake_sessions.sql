-- Consulting intake funnel tables
-- Stores intake sessions, individual answers, and generated business plans.
-- Pattern: service_role full access, deny all public/anon access (matches project RLS pattern).

-- ── Tables ─────────────────────────────────────────────────────────

CREATE TABLE intake_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'plan_generated', 'booked', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  plan_generated_at TIMESTAMPTZ,
  booked_at TIMESTAMPTZ
);

CREATE TABLE intake_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  answer_display TEXT NOT NULL,
  sequence_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE intake_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
  plan_json JSONB NOT NULL,
  recommended_service TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(session_id)
);

-- ── Indexes ────────────────────────────────────────────────────────

CREATE INDEX idx_intake_sessions_email ON intake_sessions(email);
CREATE INDEX idx_intake_sessions_status ON intake_sessions(status);
CREATE INDEX idx_intake_answers_session ON intake_answers(session_id);

-- ── Row Level Security ─────────────────────────────────────────────

ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_plans ENABLE ROW LEVEL SECURITY;

-- Service role full access (matches project pattern from 001/002 migrations)
CREATE POLICY "Service role intake_sessions" ON intake_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role intake_answers" ON intake_answers
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role intake_plans" ON intake_plans
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Deny all public/anon access
CREATE POLICY "Deny public intake_sessions" ON intake_sessions
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public intake_answers" ON intake_answers
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public intake_plans" ON intake_plans
  FOR ALL TO anon USING (false);
