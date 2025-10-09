-- Multi-User Kustomer OAuth Integration Database Schema

-- Table to store individual user's Kustomer connections
CREATE TABLE IF NOT EXISTS user_kustomer_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Kustomer User Information
  kustomer_user_id VARCHAR(255) NOT NULL,
  kustomer_user_email VARCHAR(255) NOT NULL,
  kustomer_user_name VARCHAR(255),
  kustomer_organization_id VARCHAR(255) NOT NULL,
  subdomain VARCHAR(255) NOT NULL,
  
  -- Authentication Details
  connection_type VARCHAR(50) NOT NULL DEFAULT 'oauth', -- 'oauth' or 'manual'
  access_token_encrypted TEXT, -- OAuth access token (encrypted)
  refresh_token_encrypted TEXT, -- OAuth refresh token (encrypted)
  encrypted_api_key TEXT, -- For manual API key connections (encrypted)
  token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- OAuth Scopes and Permissions
  permissions TEXT[], -- Array of granted permissions
  scope VARCHAR(500), -- OAuth scope string
  
  -- Connection Status
  status VARCHAR(50) NOT NULL DEFAULT 'connected', -- 'connected', 'disconnected', 'expired', 'error'
  last_sync TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id, kustomer_user_id),
  UNIQUE(user_id, subdomain, kustomer_user_email)
);

-- Table to store OAuth state for security
CREATE TABLE IF NOT EXISTS kustomer_oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state_token VARCHAR(500) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Table to track Kustomer API usage per user
CREATE TABLE IF NOT EXISTS user_kustomer_api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES user_kustomer_connections(id) ON DELETE CASCADE,
  
  -- Usage Metrics
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  api_calls_count INTEGER DEFAULT 0,
  rate_limit_hits INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  
  -- API Endpoints Usage
  customers_calls INTEGER DEFAULT 0,
  conversations_calls INTEGER DEFAULT 0,
  messages_calls INTEGER DEFAULT 0,
  notes_calls INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, connection_id, date)
);

-- Table to store synced conversations per user
CREATE TABLE IF NOT EXISTS user_kustomer_synced_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES user_kustomer_connections(id) ON DELETE CASCADE,
  
  -- Local Chat Information
  local_conversation_id UUID NOT NULL,
  local_customer_email VARCHAR(255),
  
  -- Kustomer Information
  kustomer_conversation_id VARCHAR(255) NOT NULL,
  kustomer_customer_id VARCHAR(255) NOT NULL,
  
  -- Sync Status
  sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced', 'failed'
  message_count INTEGER DEFAULT 0,
  last_synced_message_id VARCHAR(255),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, local_conversation_id),
  UNIQUE(connection_id, kustomer_conversation_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_kustomer_connections_user_id ON user_kustomer_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_kustomer_connections_status ON user_kustomer_connections(status);
CREATE INDEX IF NOT EXISTS idx_user_kustomer_connections_subdomain ON user_kustomer_connections(subdomain);
CREATE INDEX IF NOT EXISTS idx_kustomer_oauth_states_token ON kustomer_oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_kustomer_oauth_states_expires ON kustomer_oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_kustomer_api_usage_date ON user_kustomer_api_usage(date);
CREATE INDEX IF NOT EXISTS idx_user_kustomer_synced_conversations_local ON user_kustomer_synced_conversations(local_conversation_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_kustomer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE kustomer_oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_kustomer_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_kustomer_synced_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own connections
CREATE POLICY "Users can manage their own Kustomer connections" ON user_kustomer_connections
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can only access their own OAuth states
CREATE POLICY "Users can manage their own OAuth states" ON kustomer_oauth_states
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can only access their own API usage data
CREATE POLICY "Users can view their own API usage" ON user_kustomer_api_usage
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can only access their own synced conversations
CREATE POLICY "Users can manage their own synced conversations" ON user_kustomer_synced_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_kustomer_connections_updated_at 
  BEFORE UPDATE ON user_kustomer_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_kustomer_api_usage_updated_at 
  BEFORE UPDATE ON user_kustomer_api_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_kustomer_synced_conversations_updated_at 
  BEFORE UPDATE ON user_kustomer_synced_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM kustomer_oauth_states 
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to encrypt sensitive data (placeholder - implement with your encryption method)
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder. In production, use proper encryption like pgcrypto
  -- RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
  RETURN encode(data::bytea, 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt sensitive data (placeholder)
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder. In production, use proper decryption
  -- RETURN pgp_sym_decrypt(encrypted_data, current_setting('app.encryption_key'));
  RETURN convert_from(decode(encrypted_data, 'base64'), 'UTF8');
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing (remove in production)
-- INSERT INTO user_kustomer_connections (
--   user_id,
--   kustomer_user_id,
--   kustomer_user_email,
--   kustomer_user_name,
--   kustomer_organization_id,
--   subdomain,
--   connection_type,
--   permissions,
--   scope,
--   status
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001', -- Replace with actual user ID
--   'user_123456789',
--   'john.doe@company.com',
--   'John Doe',
--   'org_987654321',
--   'company',
--   'oauth',
--   ARRAY['customers:read', 'customers:write', 'conversations:read', 'conversations:write'],
--   'customers:read customers:write conversations:read conversations:write',
--   'connected'
-- );

COMMENT ON TABLE user_kustomer_connections IS 'Stores individual user Kustomer account connections for multi-tenant OAuth integration';
COMMENT ON TABLE kustomer_oauth_states IS 'Tracks OAuth state tokens for security during authentication flow';
COMMENT ON TABLE user_kustomer_api_usage IS 'Monitors API usage per user for rate limiting and analytics';
COMMENT ON TABLE user_kustomer_synced_conversations IS 'Tracks which conversations have been synced to Kustomer per user';