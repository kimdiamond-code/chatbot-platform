-- Multi-Store SaaS Chatbot Platform Database Schema
-- Supports unlimited Shopify stores from different customers

-- 1. Organizations table (each customer/business)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Store integrations (each org can have multiple stores)
DROP TABLE IF EXISTS integrations CASCADE;
CREATE TABLE integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    integration_id VARCHAR(50) NOT NULL, -- shopify, woocommerce, etc
    integration_name VARCHAR(255) NOT NULL,
    store_identifier VARCHAR(255), -- store domain/name
    status VARCHAR(50) DEFAULT 'disconnected',
    config JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    connected_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, integration_id, store_identifier)
);

-- 3. Chat conversations (linked to organizations)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    customer_data JSONB DEFAULT '{}',
    conversation_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Chat messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'bot', 'agent'
    sender_id VARCHAR(255),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bot configurations (each org can customize their bot)
CREATE TABLE IF NOT EXISTS bot_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    system_prompt TEXT,
    personality JSONB DEFAULT '{}',
    knowledge_base JSONB DEFAULT '{}',
    integrations_enabled JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for easier multi-tenant management
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_org ON messages(organization_id);

-- Insert default demo organization
INSERT INTO organizations (id, name, slug, email, plan, status, settings) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Demo Organization',
    'demo',
    'demo@chatbot.com',
    'enterprise',
    'active',
    '{"features": ["unlimited_stores", "custom_branding", "priority_support"]}'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    updated_at = NOW();

-- Insert sample organizations for testing
INSERT INTO organizations (name, slug, email, plan, status) VALUES
('True Citrus', 'true-citrus', 'support@truecitrus.com', 'pro', 'active'),
('Coffee Shop Co', 'coffee-shop', 'hello@coffeeshop.com', 'starter', 'active'),
('Fashion Boutique', 'fashion-boutique', 'info@fashionboutique.com', 'pro', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert default bot configs for each org
INSERT INTO bot_configs (organization_id, name, system_prompt, personality, integrations_enabled, is_active)
SELECT 
    o.id,
    'Default Assistant',
    'You are a helpful customer service assistant for ' || o.name || '. Be professional, friendly, and helpful.',
    '{"tone": "professional", "style": "helpful", "personality": "friendly"}',
    '{"shopify": true, "email": true, "live_chat": true}',
    true
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM bot_configs bc WHERE bc.organization_id = o.id
);

-- Verify setup
SELECT 'Multi-store SaaS platform database ready!' as result;
SELECT 
    o.name as organization,
    o.slug,
    o.plan,
    COUNT(i.id) as connected_stores
FROM organizations o
LEFT JOIN integrations i ON o.id = i.organization_id AND i.status = 'connected'
GROUP BY o.id, o.name, o.slug, o.plan
ORDER BY o.created_at;