-- Kustomer User Connections Table
-- Run this in Supabase SQL Editor to enable Kustomer OAuth/Manual connections

CREATE TABLE IF NOT EXISTS user_kustomer_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  kustomer_user_id VARCHAR(255),
  kustomer_user_email VARCHAR(255),
  kustomer_user_name VARCHAR(255),
  subdomain VARCHAR(100) NOT NULL,
  organization_id VARCHAR(255),
  encrypted_api_key TEXT,
  connection_type VARCHAR(50) DEFAULT 'manual',
  permissions TEXT,
  status VARCHAR(50) DEFAULT 'connected',
  last_sync TIMESTAMP WITH TIME ZONE,
  disconnected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_kustomer_connections_user ON user_kustomer_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_kustomer_connections_status ON user_kustomer_connections(status);

-- Enable RLS
ALTER TABLE user_kustomer_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Allow all user_kustomer_connections" ON user_kustomer_connections;
CREATE POLICY "Allow all user_kustomer_connections" ON user_kustomer_connections FOR ALL USING (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_user_kustomer_connections_updated_at ON user_kustomer_connections;
CREATE TRIGGER update_user_kustomer_connections_updated_at 
BEFORE UPDATE ON user_kustomer_connections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();