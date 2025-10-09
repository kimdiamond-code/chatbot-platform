-- Database update script for Shopify Integration
-- Run this in your Supabase SQL Editor to add the integrations table

-- Drop existing integrations table if it exists (to handle any schema conflicts)
DROP TABLE IF EXISTS integrations;

-- Create integrations table with proper constraints
CREATE TABLE integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(organization_id, status);

-- Enable Row Level Security
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for integrations
CREATE POLICY "Enable read access for all users" ON integrations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON integrations FOR UPDATE USING (true);

-- Insert initial Shopify integration record
INSERT INTO integrations (
    organization_id,
    integration_id,
    integration_name,
    status,
    config,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'shopify',
    'Shopify',
    'disconnected',
    '{"description": "True Citrus Shopify Store Integration", "features": ["Product Search", "Order Tracking", "Customer Data", "Vegan Information"]}',
    NOW()
) ON CONFLICT (organization_id, integration_id) 
DO UPDATE SET 
    integration_name = EXCLUDED.integration_name,
    config = EXCLUDED.config,
    updated_at = NOW();

-- Verify the table was created correctly
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'integrations' 
ORDER BY ordinal_position;

-- Show initial data
SELECT * FROM integrations WHERE integration_id = 'shopify';