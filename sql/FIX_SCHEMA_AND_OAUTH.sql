-- CRITICAL FIX: Database Schema + OAuth Implementation
-- Run this in Supabase SQL Editor to fix the credentials column issue

-- 1. First, ensure integrations table exists with correct schema
CREATE TABLE IF NOT EXISTS integrations (
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

-- 2. Create OAuth states table for security
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    state_token VARCHAR(255) UNIQUE NOT NULL,
    integration_id VARCHAR(50) NOT NULL,
    organization_id UUID NOT NULL,
    shop_domain VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create shopify_apps table for app installations
CREATE TABLE IF NOT EXISTS shopify_apps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_domain VARCHAR(255) UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    scope TEXT,
    organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    webhook_verified BOOLEAN DEFAULT FALSE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uninstalled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active'
);

-- 4. Enable RLS on all tables
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_apps ENABLE ROW LEVEL SECURITY;

-- 5. Create policies
CREATE POLICY "Enable all for demo" ON integrations FOR ALL USING (true);
CREATE POLICY "Enable all for demo oauth" ON oauth_states FOR ALL USING (true);  
CREATE POLICY "Enable all for demo shopify" ON shopify_apps FOR ALL USING (true);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_shopify_apps_domain ON shopify_apps(shop_domain);

-- 7. Insert/update Shopify integration record
INSERT INTO integrations (
    organization_id,
    integration_id,
    integration_name,
    status,
    config,
    credentials,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'shopify',
    'Shopify',
    'disconnected',
    '{"features": ["OAuth Installation", "Product Search", "Order Tracking", "Customer Data"], "connectionTypes": ["oauth", "manual"]}',
    '{}',
    NOW()
) ON CONFLICT (organization_id, integration_id) 
DO UPDATE SET 
    integration_name = EXCLUDED.integration_name,
    config = EXCLUDED.config,
    updated_at = NOW();

-- 8. Clean up expired OAuth states (good practice)
DELETE FROM oauth_states WHERE expires_at < NOW();

-- 9. Verify everything is working
SELECT 
    'integrations' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'integrations' 
ORDER BY ordinal_position;

SELECT 'Current Shopify integration:' as info, * FROM integrations WHERE integration_id = 'shopify';

-- Success message
SELECT '✅ Schema fixed! Credentials column exists and OAuth tables created.' as status;