-- Phase 4: Research pipeline database schema
-- 5 tables: research_queries, research_cache, research_results, sent_url_hashes, research_runs
-- Depends on: 001_subscribers.sql (subscribers table)

-- ============================================================
-- research_queries: Generated search queries from NLP topic parsing
-- ============================================================

CREATE TABLE research_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN ('news', 'analysis', 'tools', 'events', 'general')),
  keywords TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE INDEX idx_research_queries_subscriber ON research_queries(subscriber_id);
CREATE INDEX idx_research_queries_expires ON research_queries(expires_at);

-- ============================================================
-- research_cache: Shared results cache keyed by normalized query hash (24h TTL)
-- ============================================================

CREATE TABLE research_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash TEXT NOT NULL UNIQUE,
  query TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE INDEX idx_research_cache_hash ON research_cache(query_hash);
CREATE INDEX idx_research_cache_expires ON research_cache(expires_at);

-- ============================================================
-- research_results: Per-subscriber results after dedup + scoring
-- ============================================================

CREATE TABLE research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  title TEXT NOT NULL,
  snippet TEXT,
  source_name TEXT NOT NULL CHECK (source_name IN ('brave', 'gdelt', 'rss', 'scrape', 'custom_rss')),
  source_url TEXT,
  published_at TIMESTAMPTZ,
  relevance_score FLOAT NOT NULL DEFAULT 0,
  query_id UUID REFERENCES research_queries(id) ON DELETE SET NULL,
  research_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_results_subscriber_date ON research_results(subscriber_id, research_date);
CREATE INDEX idx_results_url_hash ON research_results(url_hash);

-- ============================================================
-- sent_url_hashes: 30-day deduplication tracking
-- ============================================================

CREATE TABLE sent_url_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  url_hash TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX idx_sent_dedup ON sent_url_hashes(subscriber_id, url_hash);
CREATE INDEX idx_sent_cleanup ON sent_url_hashes(sent_at);

-- ============================================================
-- research_runs: Per-run logging for observability
-- ============================================================

CREATE TABLE research_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  queries_run INTEGER DEFAULT 0,
  sources_queried TEXT[] DEFAULT '{}',
  results_found INTEGER DEFAULT 0,
  results_stored INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  cost_estimate_usd NUMERIC(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_runs_subscriber ON research_runs(subscriber_id, started_at DESC);

-- ============================================================
-- Row Level Security: service_role full access, deny anon on all 5 tables
-- ============================================================

ALTER TABLE research_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_url_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_runs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role research_queries" ON research_queries
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role research_cache" ON research_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role research_results" ON research_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role sent_url_hashes" ON sent_url_hashes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role research_runs" ON research_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Deny all public/anon access
CREATE POLICY "Deny public research_queries" ON research_queries
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public research_cache" ON research_cache
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public research_results" ON research_results
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public sent_url_hashes" ON sent_url_hashes
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public research_runs" ON research_runs
  FOR ALL TO anon USING (false);

-- ============================================================
-- Cleanup function: auto-delete expired cache, queries, and old dedup hashes
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_research_data()
RETURNS void AS $$
BEGIN
  DELETE FROM research_cache WHERE expires_at < now();
  DELETE FROM research_queries WHERE expires_at < now();
  DELETE FROM sent_url_hashes WHERE sent_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
