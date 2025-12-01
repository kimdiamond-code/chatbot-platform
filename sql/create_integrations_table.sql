-- ===================================================================
-- CENTRALIZED INTEGRATIONS TABLE
-- Stores user's account identifiers (NOT API keys)
-- Admin credentials stored in environment variables
-- ===================================================================

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'disconnected',
  
  -- User-provided account identifiers only (NO API KEYS)
  account_identifier JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  connected_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50),
  error_message TEXT,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- One integration per provider per organization
  UNIQUE(organization_id, provider)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_integrations_org_provider 
  ON integrations(organization_id, provider);

CREATE INDEX IF NOT EXISTS idx_integrations_status 
  ON integrations(status);

-- ===================================================================
-- EXAMPLE DATA STRUCTURE
-- ===================================================================

-- Shopify Integration
-- {
--   "provider": "shopify",
--   "organization_id": "org-123",
--   "status": "connected",
--   "account_identifier": {
--     "storeName": "mystore"
--   }
-- }

-- Klaviyo Integration
-- {
--   "provider": "klaviyo",
--   "organization_id": "org-123",
--   "status": "connected",
--   "account_identifier": {
--     "companyId": "ABC123"
--   }
-- }

-- Kustomer Integration
-- {
--   "provider": "kustomer",
--   "organization_id": "org-123",
--   "status": "connected",
--   "account_identifier": {
--     "subdomain": "mycompany"
--   }
-- }

-- Messenger Integration
-- {
--   "provider": "messenger",
--   "organization_id": "org-123",
--   "status": "connected",
--   "account_identifier": {
--     "pageId": "123456789",
--     "pageName": "My Business Page"
--   }
-- }

-- WhatsApp Integration
-- {
--   "provider": "whatsapp",
--   "organization_id": "org-123",
--   "status": "connected",
--   "account_identifier": {
--     "phoneNumber": "+1234567890"
--   }
-- }

-- ===================================================================
-- HELPER FUNCTIONS
-- ===================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS trigger_update_integration_timestamp ON integrations;
CREATE TRIGGER trigger_update_integration_timestamp
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================
