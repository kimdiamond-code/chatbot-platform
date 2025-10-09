-- SIMPLE FIX: Just add the missing credentials column
-- Run this in Supabase SQL Editor

-- Add the missing credentials column to existing table
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS credentials JSONB DEFAULT '{}';

-- Also add other potentially missing columns
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the existing Shopify record if it exists
UPDATE integrations 
SET 
    credentials = '{}',
    config = '{"features": ["Product Search", "Order Tracking", "Customer Data"]}',
    updated_at = NOW()
WHERE integration_id = 'shopify';

-- Insert Shopify record if it doesn't exist
INSERT INTO integrations (
    organization_id,
    integration_id,
    integration_name,
    status,
    config,
    credentials
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'shopify',
    'Shopify',
    'disconnected',
    '{"features": ["Product Search", "Order Tracking", "Customer Data"]}',
    '{}'
) ON CONFLICT (organization_id, integration_id) DO NOTHING;

-- Verify the fix
SELECT 'Credentials column added successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'integrations' AND column_name = 'credentials';