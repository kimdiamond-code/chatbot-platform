-- ============================================================================
-- MULTI-TENANT OAUTH SCHEMA MIGRATION
-- Purpose: Align integrations table with OAuth handler expectations
-- Run this in your Neon database console
-- ============================================================================

-- Step 1: Add OAuth-specific columns to integrations table
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS account_identifier JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS token_scope TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50);

-- Step 2: Create indexes for OAuth queries
CREATE INDEX IF NOT EXISTS idx_integrations_org_provider 
ON integrations(organization_id, provider);

CREATE INDEX IF NOT EXISTS idx_integrations_provider_status
ON integrations(provider, status);

-- Step 3: Migrate existing data (set provider = integration_id)
UPDATE integrations 
SET provider = integration_id 
WHERE provider IS NULL;

-- Step 4: Add NOT NULL constraint after data migration
ALTER TABLE integrations 
ALTER COLUMN provider SET NOT NULL;

-- Step 5: Add UNIQUE constraint for proper multi-tenant isolation
CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_org_provider_unique
ON integrations(organization_id, provider);

-- Step 6: Drop old constraint if it exists
ALTER TABLE integrations 
DROP CONSTRAINT IF EXISTS integrations_organization_id_integration_id_key;

-- Step 7: Verify schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'integrations' 
AND column_name IN ('provider', 'access_token', 'refresh_token', 'account_identifier', 'token_scope', 'last_synced_at', 'sync_status')
ORDER BY ordinal_position;

-- Step 8: Show current integrations with new columns
SELECT 
    organization_id,
    provider,
    status,
    account_identifier,
    connected_at
FROM integrations
ORDER BY organization_id, provider;

-- Success message
SELECT '✅ OAuth schema migration complete! All columns added successfully.' as status;
