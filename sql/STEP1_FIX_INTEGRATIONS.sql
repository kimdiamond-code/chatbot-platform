-- STEP 1: Fix the basic integrations table first
-- Run this FIRST in Supabase SQL Editor

-- Drop and recreate integrations table with correct schema
DROP TABLE IF EXISTS integrations CASCADE;

CREATE TABLE integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    integration_id VARCHAR(50) NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'disconnected',
    config JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, integration_id)
);

-- Enable RLS and create policy
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for integrations" ON integrations FOR ALL USING (true);

-- Insert Shopify integration record
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
);

-- Verify the table was created correctly
SELECT 'integrations table created successfully' as status;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'integrations' ORDER BY ordinal_position;