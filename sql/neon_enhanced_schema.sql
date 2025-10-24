-- ============================================================================
-- ENHANCED NEON SCHEMA - FORMS, SCENARIOS & ANALYTICS
-- ============================================================================
-- Run this AFTER your existing neon_schema.sql
-- Or run standalone if base schema already exists
-- ============================================================================

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: CUSTOM FORMS SYSTEM
-- ============================================================================

-- Custom forms table
CREATE TABLE IF NOT EXISTS custom_forms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID REFERENCES custom_forms(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
