-- ===================================================================
-- ADD OAUTH TOKEN STORAGE TO INTEGRATIONS TABLE
-- Stores encrypted per-user access tokens and refresh tokens
-- ===================================================================

-- Add token columns for OAuth storage
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS token_scope TEXT;

-- Add encryption key column (references encryption key used)
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS encryption_key_version VARCHAR(50) DEFAULT 'v1';

-- Index for token expiration checks
CREATE INDEX IF NOT EXISTS idx_integrations_token_expiry 
  ON integrations(token_expires_at) 
  WHERE status = 'connected';

-- ===================================================================
-- ENCRYPTION FUNCTIONS
-- ===================================================================

-- Function to encrypt sensitive data (placeholder - implement with actual encryption)
CREATE OR REPLACE FUNCTION encrypt_token(token TEXT) 
RETURNS TEXT AS $$
BEGIN
  -- TODO: Implement actual encryption using pgcrypto
  -- For now, just store as-is (MUST implement encryption in production!)
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token TEXT) 
RETURNS TEXT AS $$
BEGIN
  -- TODO: Implement actual decryption using pgcrypto
  -- For now, just return as-is
  RETURN encrypted_token;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'integrations' 
  AND column_name IN ('access_token', 'refresh_token', 'token_expires_at', 'token_scope');
