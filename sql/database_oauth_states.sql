-- Create OAuth States table for secure OAuth flows
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS oauth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_token TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL, -- 'shopify', 'kustomer', etc.
  shop_domain TEXT,
  organization_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- Add RLS policies
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on oauth_states" ON oauth_states
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Clean up expired states (run this periodically or add as a cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE oauth_states IS 'Stores temporary OAuth state tokens for security verification';
COMMENT ON FUNCTION cleanup_expired_oauth_states IS 'Removes expired OAuth state tokens';

-- Create Shopify Apps table for storing OAuth installations
CREATE TABLE IF NOT EXISTS shopify_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  organization_id UUID,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'uninstalled'
  shop_info JSONB DEFAULT '{}'::jsonb,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_shopify_apps_shop ON shopify_apps(shop_domain);
CREATE INDEX IF NOT EXISTS idx_shopify_apps_org ON shopify_apps(organization_id);
CREATE INDEX IF NOT EXISTS idx_shopify_apps_status ON shopify_apps(status);

-- Add RLS policies
ALTER TABLE shopify_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on shopify_apps" ON shopify_apps
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shopify_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS shopify_apps_updated_at ON shopify_apps;
CREATE TRIGGER shopify_apps_updated_at
  BEFORE UPDATE ON shopify_apps
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_apps_updated_at();

COMMENT ON TABLE shopify_apps IS 'Stores Shopify app installations and OAuth tokens per organization';
