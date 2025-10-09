-- STEP 2: Add OAuth tables (run this AFTER Step 1 works)
-- Only run this after the basic integration is working

-- Create OAuth states table for security
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    state_token VARCHAR(255) UNIQUE NOT NULL,
    integration_id VARCHAR(50) NOT NULL,
    organization_id UUID NOT NULL,
    shop_domain VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopify_apps table for app installations
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

-- Enable RLS
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_apps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all for oauth_states" ON oauth_states FOR ALL USING (true);
CREATE POLICY "Enable all for shopify_apps" ON shopify_apps FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_states_token ON oauth_states(state_token);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_shopify_apps_domain ON shopify_apps(shop_domain);

-- Clean up expired states
DELETE FROM oauth_states WHERE expires_at < NOW();

-- Verify tables created
SELECT 'OAuth tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('oauth_states', 'shopify_apps');