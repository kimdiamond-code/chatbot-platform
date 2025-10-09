-- ============================================================================
-- INTEGRATIONS TABLE FOR SHOPIFY & OTHER INTEGRATIONS
-- ============================================================================
-- This table stores connection credentials for external integrations
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop existing table if it exists (be careful in production!)
DROP TABLE IF EXISTS integrations CASCADE;

-- Create integrations table
CREATE TABLE integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  integration_id TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  credentials JSONB DEFAULT '{}'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure only one integration per organization
  CONSTRAINT unique_org_integration UNIQUE (organization_id, integration_id)
);

-- Add indexes for performance
CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_org_status ON integrations(organization_id, status);

-- Enable Row Level Security
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - adjust based on your auth needs)
CREATE POLICY "Allow all operations on integrations"
  ON integrations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- Grant permissions
GRANT ALL ON integrations TO authenticated;
GRANT ALL ON integrations TO anon;

-- Add helpful comment
COMMENT ON TABLE integrations IS 'Stores external integration credentials and configuration for Shopify, Kustomer, etc.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ INTEGRATIONS TABLE CREATED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  ✅ integrations table with proper schema';
  RAISE NOTICE '  ✅ Indexes for performance';
  RAISE NOTICE '  ✅ Row-level security';
  RAISE NOTICE '  ✅ Auto-update trigger';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Refresh your browser';
  RAISE NOTICE '  2. Go to Integrations → Shopify';
  RAISE NOTICE '  3. Enter your credentials and connect!';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to connect Shopify!';
  RAISE NOTICE '============================================================================';
END $$;
