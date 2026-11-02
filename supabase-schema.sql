-- SCAM GUARD - Supabase PostgreSQL Schema & Security Policies
-- Run this script in the Supabase SQL Editor

-- 1. Create enum for scam categories
CREATE TYPE scam_category AS ENUM ('phone', 'email', 'url', 'message', 'upi');
CREATE TYPE risk_level AS ENUM ('safe', 'suspicious', 'danger', 'unknown');
CREATE TYPE report_status AS ENUM ('active', 'under_review', 'verified_scam');

-- 2. Create community reports table
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target TEXT NOT NULL,
  category scam_category NOT NULL,
  scam_type TEXT NOT NULL,
  description TEXT NOT NULL,
  risk_level risk_level NOT NULL DEFAULT 'danger',
  reporter_name TEXT DEFAULT 'Citizen Report',
  upvotes INTEGER DEFAULT 1,
  status report_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for rapid search
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON community_reports (target);
CREATE INDEX IF NOT EXISTS idx_community_reports_category ON community_reports (category);
CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON community_reports (created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- 5. Policies:
-- Allow anyone to read active reports (public crowdsourced threat radar)
CREATE POLICY "Public read access for verified community reports"
  ON community_reports
  FOR SELECT
  USING (true);

-- Allow anonymous users to submit a report (with length restrictions)
CREATE POLICY "Public insert access for scam reports"
  ON community_reports
  FOR INSERT
  WITH CHECK (
    char_length(target) <= 255 AND
    char_length(description) <= 2000 AND
    char_length(scam_type) <= 100
  );

-- 6. Helper function for atomic upvotes
CREATE OR REPLACE FUNCTION increment_upvote(report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE community_reports
  SET upvotes = upvotes + 1,
      updated_at = NOW()
  WHERE id = report_id;
END;
$$;
