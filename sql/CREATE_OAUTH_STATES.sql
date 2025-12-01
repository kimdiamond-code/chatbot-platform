-- Migration: Create oauth_states table used to map OAuth state tokens to organizations
-- Run this on your database before testing OAuth flows

CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  state_token TEXT UNIQUE NOT NULL,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON oauth_states(state_token);

-- Optional: cleanup function to remove expired states (run as cron/job)
-- DELETE FROM oauth_states WHERE expires_at < NOW() - INTERVAL '7 days';
