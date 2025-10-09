-- COMPLETE DATABASE SETUP FOR CHATBOT PLATFORM
-- Run this entire script in Supabase SQL Editor
-- This will set up ALL tables needed for the platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE TABLES
-- ========================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot configurations table
CREATE TABLE IF NOT EXISTS bot_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'ChatBot',
    system_prompt TEXT,
    personality JSONB DEFAULT '{}',
    qa_database JSONB DEFAULT '[]',
    knowledge_base JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget configurations table
CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    bot_config_id UUID REFERENCES bot_configs(id) ON DELETE CASCADE,
    widget_settings JSONB DEFAULT '{}',
    embed_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    assigned_to UUID,
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(50) DEFAULT 'normal',
    metadata JSONB DEFAULT '{}',
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_id UUID,
    sender_type VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INTEGRATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
    integration_id VARCHAR(50) NOT NULL,
    integration_name VARCHAR(255) NOT NULL,
    store_identifier VARCHAR(255),
    status VARCHAR(50) DEFAULT 'disconnected',
    config JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, integration_id)
);

-- ========================================
-- ANALYTICS TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_summary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, date)
);

-- ========================================
-- PROACTIVE ENGAGEMENT TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS proactive_triggers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    message TEXT NOT NULL,
    delay_seconds INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 5,
    conditions JSONB DEFAULT '{}',
    action_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proactive_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trigger_id UUID REFERENCES proactive_triggers(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    page_url TEXT,
    user_agent TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    engaged BOOLEAN DEFAULT false,
    converted BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS proactive_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    trigger_id UUID REFERENCES proactive_triggers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_triggers INTEGER DEFAULT 0,
    total_engagements INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, trigger_id, date)
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_bot_configs_org ON bot_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_bot_configs_active ON bot_configs(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_conv ON analytics_events(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_proactive_triggers_org ON proactive_triggers(organization_id);
CREATE INDEX IF NOT EXISTS idx_proactive_triggers_enabled ON proactive_triggers(organization_id, enabled);
CREATE INDEX IF NOT EXISTS idx_proactive_events_trigger ON proactive_events(trigger_id);
CREATE INDEX IF NOT EXISTS idx_proactive_events_org ON proactive_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_proactive_events_triggered ON proactive_events(triggered_at);
CREATE INDEX IF NOT EXISTS idx_proactive_analytics_date ON proactive_analytics(organization_id, date DESC);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_analytics ENABLE ROW LEVEL SECURITY;

-- Simple policies (for demo - customize for production)
CREATE POLICY "Enable read access for all users" ON organizations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON bot_configs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON widget_configs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON conversations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON messages FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON integrations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON analytics_events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON analytics_summary FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON proactive_triggers FOR SELECT USING (true);
CREATE POLICY "Enable all access for proactive events" ON proactive_events FOR ALL USING (true);
CREATE POLICY "Enable read access for analytics" ON proactive_analytics FOR SELECT USING (true);

-- Enable insert/update
CREATE POLICY "Enable insert for all users" ON bot_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON bot_configs FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON conversations FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON integrations FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON analytics_summary FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON analytics_summary FOR UPDATE USING (true);
CREATE POLICY "Enable insert for authenticated users" ON proactive_triggers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON proactive_triggers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON proactive_triggers FOR DELETE USING (true);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update analytics
CREATE OR REPLACE FUNCTION update_proactive_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO proactive_analytics (
        organization_id, 
        trigger_id, 
        date, 
        total_triggers,
        total_engagements,
        total_conversions,
        engagement_rate,
        conversion_rate
    )
    SELECT 
        organization_id,
        trigger_id,
        DATE(triggered_at) as date,
        COUNT(*) as total_triggers,
        SUM(CASE WHEN engaged THEN 1 ELSE 0 END) as total_engagements,
        SUM(CASE WHEN converted THEN 1 ELSE 0 END) as total_conversions,
        ROUND(100.0 * SUM(CASE WHEN engaged THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as engagement_rate,
        ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as conversion_rate
    FROM proactive_events
    WHERE id = NEW.id
    GROUP BY organization_id, trigger_id, DATE(triggered_at)
    ON CONFLICT (organization_id, trigger_id, date) 
    DO UPDATE SET
        total_triggers = proactive_analytics.total_triggers + EXCLUDED.total_triggers,
        total_engagements = proactive_analytics.total_engagements + EXCLUDED.total_engagements,
        total_conversions = proactive_analytics.total_conversions + EXCLUDED.total_conversions,
        engagement_rate = ROUND(100.0 * (proactive_analytics.total_engagements + EXCLUDED.total_engagements) / 
            NULLIF(proactive_analytics.total_triggers + EXCLUDED.total_triggers, 0), 2),
        conversion_rate = ROUND(100.0 * (proactive_analytics.total_conversions + EXCLUDED.total_conversions) / 
            NULLIF(proactive_analytics.total_triggers + EXCLUDED.total_triggers, 0), 2);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for proactive analytics
DROP TRIGGER IF EXISTS trigger_update_proactive_analytics ON proactive_events;
CREATE TRIGGER trigger_update_proactive_analytics
    AFTER INSERT ON proactive_events
    FOR EACH ROW
    EXECUTE FUNCTION update_proactive_analytics();

-- ========================================
-- DEFAULT DATA
-- ========================================

-- Insert default organization
INSERT INTO organizations (id, name, settings) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Organization', '{}')
ON CONFLICT (id) DO NOTHING;

-- Insert default bot configuration
INSERT INTO bot_configs (
    organization_id, 
    name, 
    system_prompt,
    personality,
    qa_database,
    settings,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ChatBot Assistant',
    'You are a helpful customer service assistant. You are professional, friendly, and concise.',
    '{"avatar": "robot", "greeting": "Hello! How can I help you today?", "tone": "friendly"}',
    '[
        {"id": "qa1", "question": "What are your business hours?", "answer": "We are open Monday through Friday from 9 AM to 6 PM EST.", "keywords": ["hours", "open", "business"], "enabled": true},
        {"id": "qa2", "question": "How can I contact support?", "answer": "You can contact our support team through this chat, email us at support@example.com, or call us at (555) 123-4567.", "keywords": ["contact", "support", "help"], "enabled": true}
    ]',
    '{"responseDelay": 1500, "maxRetries": 3}',
    true
) ON CONFLICT DO NOTHING;

-- Insert default proactive triggers
INSERT INTO proactive_triggers (organization_id, name, trigger_type, enabled, message, delay_seconds, priority, conditions, action_config)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Exit Intent Popup', 'exit_intent', true, 
     'Wait! Before you go, can we help you find something?', 0, 9,
     '{"minTimeOnSite": 10}', '{"showPopup": true}'),
    
    ('00000000-0000-0000-0000-000000000001', '50% Scroll Engagement', 'scroll_percentage', true,
     'You''re halfway through! Need any assistance?', 0, 5,
     '{"scrollPercentage": 50, "pageUrl": "*"}', '{"showPopup": true}'),
    
    ('00000000-0000-0000-0000-000000000001', 'Cart Abandonment', 'cart_abandonment', true,
     'Still thinking about your cart? Get 10% off if you complete your purchase now! Use code SAVE10', 30, 10,
     '{"hasCartItems": true, "cartValue": 50}', '{"showPopup": true, "offerCode": "SAVE10"}')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Complete database setup finished successfully!';
    RAISE NOTICE '📊 All tables created and configured';
    RAISE NOTICE '🎯 Default data inserted';
    RAISE NOTICE '🚀 Platform ready for testing!';
END $$;
