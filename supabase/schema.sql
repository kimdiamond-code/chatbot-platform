-- ChatBot Platform Database Schema
-- Run this in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    sender_type VARCHAR(50) NOT NULL, -- 'customer', 'agent', 'bot'
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (for user management)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'agent',
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bot_configs_org ON bot_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_bot_configs_active ON bot_configs(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

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
    knowledge_base,
    settings,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ChatBot Assistant',
    'You are a helpful customer service assistant. You are professional, friendly, and concise.',
    jsonb_build_object(
        'avatar', 'robot',
        'greeting', 'Hello! How can I help you today?',
        'fallback', 'I''m not sure about that. Let me connect you with a human agent.',
        'tone', 'friendly',
        'traits', jsonb_build_array('professional', 'empathetic')
    ),
    jsonb_build_array(
        jsonb_build_object(
            'id', 'qa1',
            'question', 'What are your business hours?',
            'answer', 'We are open Monday through Friday from 9 AM to 6 PM EST. Our customer support team is available during these hours to assist you.',
            'keywords', jsonb_build_array('hours', 'open', 'business', 'time', 'when'),
            'enabled', true,
            'category', 'general'
        ),
        jsonb_build_object(
            'id', 'qa2',
            'question', 'How can I contact support?',
            'answer', 'You can contact our support team through this chat, email us at support@example.com, or call us at (555) 123-4567 during business hours.',
            'keywords', jsonb_build_array('contact', 'support', 'help', 'phone', 'email'),
            'enabled', true,
            'category', 'support'
        )
    ),
    jsonb_build_array(),
    jsonb_build_object(
        'responseDelay', 1500,
        'maxRetries', 3,
        'operatingHours', jsonb_build_object('enabled', false),
        'escalationKeywords', jsonb_build_array('human', 'agent', 'manager', 'speak to someone')
    ),
    true
) ON CONFLICT DO NOTHING;

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
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

-- Create index for integrations
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(organization_id, status);

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Simple policies for demo (you may want to customize these)
CREATE POLICY "Enable read access for all users" ON organizations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON bot_configs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON widget_configs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON conversations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON messages FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON organization_members FOR SELECT USING (true);

-- Enable insert/update for authenticated users
CREATE POLICY "Enable insert for authenticated users" ON bot_configs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON bot_configs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON customers FOR INSERT WITH CHECK (true);

-- Integrations policies
CREATE POLICY "Enable read access for all users" ON integrations FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON integrations FOR UPDATE USING (true);