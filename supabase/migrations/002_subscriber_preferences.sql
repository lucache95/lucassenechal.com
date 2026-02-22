-- 002_subscriber_preferences.sql
-- Phase 2: Extend subscribers with preferences, topics, and sources
-- Depends on: 001_subscribers.sql (subscribers table)

-- ============================================================
-- Topics catalog (seeded with default categories)
-- ============================================================

CREATE TABLE topic_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  is_popular BOOLEAN DEFAULT false
);

CREATE TABLE topic_subtopics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES topic_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  UNIQUE(category_id, name)
);

-- ============================================================
-- Subscriber topic selections (junction table)
-- ============================================================

CREATE TABLE subscriber_topics (
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES topic_subtopics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (subscriber_id, subtopic_id)
);

-- ============================================================
-- Subscriber preferences (one-to-one with subscribers)
-- ============================================================

CREATE TABLE subscriber_preferences (
  subscriber_id UUID PRIMARY KEY REFERENCES subscribers(id) ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'digest' CHECK (format IN ('digest', 'briefing', 'mixed')),
  delivery_time TEXT NOT NULL DEFAULT 'morning' CHECK (delivery_time IN ('morning', 'afternoon', 'evening')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  city TEXT DEFAULT '',
  sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- Custom topics (freeform text per subscriber)
-- ============================================================

CREATE TABLE subscriber_custom_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- Subscriber RSS/Atom feed sources
-- ============================================================

CREATE TABLE subscriber_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  feed_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(subscriber_id, feed_url)
);

-- ============================================================
-- Indexes for common queries
-- ============================================================

CREATE INDEX idx_subscriber_topics_subscriber ON subscriber_topics(subscriber_id);
CREATE INDEX idx_subscriber_sources_subscriber ON subscriber_sources(subscriber_id);
CREATE INDEX idx_subscriber_custom_topics_subscriber ON subscriber_custom_topics(subscriber_id);
CREATE INDEX idx_topic_subtopics_category ON topic_subtopics(category_id);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE topic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_custom_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_sources ENABLE ROW LEVEL SECURITY;

-- Public can read topic catalog (for signup form)
CREATE POLICY "Allow public read topics" ON topic_categories
  FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read subtopics" ON topic_subtopics
  FOR SELECT TO anon USING (true);

-- Deny all other public access
CREATE POLICY "Deny public write categories" ON topic_categories
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny public write subtopics" ON topic_subtopics
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny public access subscriber_topics" ON subscriber_topics
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public access subscriber_preferences" ON subscriber_preferences
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public access subscriber_custom_topics" ON subscriber_custom_topics
  FOR ALL TO anon USING (false);
CREATE POLICY "Deny public access subscriber_sources" ON subscriber_sources
  FOR ALL TO anon USING (false);

-- Service role full access for all preference tables
CREATE POLICY "Service role categories" ON topic_categories
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subtopics" ON topic_subtopics
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_topics" ON subscriber_topics
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_preferences" ON subscriber_preferences
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_custom_topics" ON subscriber_custom_topics
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role subscriber_sources" ON subscriber_sources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- Seed data: Topic categories
-- ============================================================

INSERT INTO topic_categories (name, display_order, is_popular) VALUES
  ('Technology & AI', 1, true),
  ('Business & Finance', 2, true),
  ('Health & Wellness', 3, false),
  ('Local & Community', 4, false),
  ('Entertainment', 5, true),
  ('Science & Innovation', 6, false),
  ('Lifestyle', 7, false),
  ('Sports', 8, false);

-- ============================================================
-- Seed data: Subtopics per category
-- ============================================================

-- Technology & AI
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('AI Tools & Assistants', 1),
  ('Software Development', 2),
  ('Cybersecurity', 3),
  ('Gadgets & Hardware', 4),
  ('Cloud & Infrastructure', 5),
  ('Startups', 6)
) AS s(name, display_order)
WHERE c.name = 'Technology & AI';

-- Business & Finance
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('Markets & Investing', 1),
  ('Entrepreneurship', 2),
  ('Real Estate', 3),
  ('Personal Finance', 4),
  ('Crypto & Web3', 5)
) AS s(name, display_order)
WHERE c.name = 'Business & Finance';

-- Health & Wellness
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('Fitness & Exercise', 1),
  ('Nutrition & Diet', 2),
  ('Mental Health', 3),
  ('Sleep Science', 4),
  ('Longevity', 5)
) AS s(name, display_order)
WHERE c.name = 'Health & Wellness';

-- Local & Community
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('Local Events', 1),
  ('Restaurant & Food Scene', 2),
  ('Community News', 3),
  ('Real Estate Market', 4),
  ('Local Business', 5)
) AS s(name, display_order)
WHERE c.name = 'Local & Community';

-- Entertainment
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('Movies & TV', 1),
  ('Music', 2),
  ('Gaming', 3),
  ('Books & Podcasts', 4),
  ('Celebrity & Culture', 5)
) AS s(name, display_order)
WHERE c.name = 'Entertainment';

-- Science & Innovation
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('Space & Astronomy', 1),
  ('Climate & Environment', 2),
  ('Biotechnology', 3),
  ('Physics & Engineering', 4),
  ('Emerging Tech', 5)
) AS s(name, display_order)
WHERE c.name = 'Science & Innovation';

-- Lifestyle
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('Travel', 1),
  ('Food & Cooking', 2),
  ('Home & Garden', 3),
  ('Fashion', 4),
  ('Parenting', 5)
) AS s(name, display_order)
WHERE c.name = 'Lifestyle';

-- Sports
INSERT INTO topic_subtopics (category_id, name, display_order)
SELECT c.id, s.name, s.display_order
FROM topic_categories c
CROSS JOIN (VALUES
  ('NFL & College Football', 1),
  ('NBA & Basketball', 2),
  ('Soccer', 3),
  ('Fantasy Sports', 4),
  ('Combat Sports', 5)
) AS s(name, display_order)
WHERE c.name = 'Sports';
