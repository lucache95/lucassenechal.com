-- Subscribers table for email capture
-- Phase 1: minimal schema for landing page email collection
-- Phase 2 will extend with topics, preferences, format choice, etc.

CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

-- Indexes for common lookups
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert for email capture from landing page
CREATE POLICY "Allow public insert" ON subscribers
  FOR INSERT TO anon WITH CHECK (true);

-- Deny all other anonymous access
CREATE POLICY "Deny public read" ON subscribers
  FOR SELECT TO anon USING (false);

CREATE POLICY "Deny public update" ON subscribers
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Deny public delete" ON subscribers
  FOR DELETE TO anon USING (false);

-- Allow service_role full access (for server-side operations)
CREATE POLICY "Service role full access" ON subscribers
  FOR ALL TO service_role USING (true) WITH CHECK (true);
