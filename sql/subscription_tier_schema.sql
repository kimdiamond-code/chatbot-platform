-- ============================================================================
-- SUBSCRIPTION TIER SYSTEM
-- ============================================================================
-- Add this to your Neon database for subscription-based feature gating
-- ============================================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization subscriptions table
CREATE TABLE IF NOT EXISTS organization_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired, trial
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Feature add-ons table (for separate purchases like CRM)
CREATE TABLE IF NOT EXISTS feature_addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization add-ons (purchased separately)
CREATE TABLE IF NOT EXISTS organization_addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES feature_addons(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, addon_id)
);

-- Feature usage tracking
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INSERT DEFAULT PLANS
-- ============================================================================

-- Starter Plan (Free/Basic)
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits, sort_order)
VALUES (
    'starter',
    'Starter',
    'Perfect for small businesses getting started',
    0,
    0,
    '["chat_widget", "basic_analytics", "email_support", "knowledge_base", "custom_forms", "scenarios"]'::jsonb,
    '{"conversations_per_month": 500, "knowledge_base_items": 50, "custom_forms": 3, "scenarios": 5}'::jsonb,
    1
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- Professional Plan
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits, sort_order)
VALUES (
    'professional',
    'Professional',
    'Advanced features for growing businesses',
    99,
    990,
    '["chat_widget", "advanced_analytics", "priority_support", "knowledge_base", "custom_forms", "scenarios", "integrations", "custom_branding", "api_access"]'::jsonb,
    '{"conversations_per_month": 5000, "knowledge_base_items": 500, "custom_forms": 20, "scenarios": 50, "team_members": 5}'::jsonb,
    2
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- Business Plan
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits, sort_order)
VALUES (
    'business',
    'Business',
    'Full-featured solution for larger teams',
    299,
    2990,
    '["chat_widget", "advanced_analytics", "priority_support", "knowledge_base", "custom_forms", "scenarios", "integrations", "custom_branding", "api_access", "white_label", "advanced_security", "sla"]'::jsonb,
    '{"conversations_per_month": 50000, "knowledge_base_items": -1, "custom_forms": -1, "scenarios": -1, "team_members": 25}'::jsonb,
    3
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;

-- ============================================================================
-- INSERT FEATURE ADD-ONS
-- ============================================================================

-- CRM Add-on
INSERT INTO feature_addons (name, display_name, description, price_monthly, price_yearly, features)
VALUES (
    'crm',
    'CRM Integration',
    'Full CRM with contact management, notes, tags, and customer segmentation',
    49,
    490,
    '["crm_dashboard", "contact_management", "customer_notes", "tags_segments", "customer_history", "crm_reports"]'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features;

-- Phone Support Add-on
INSERT INTO feature_addons (name, display_name, description, price_monthly, price_yearly, features)
VALUES (
    'phone',
    'Phone Support',
    'Enable phone channel support with call routing and IVR',
    79,
    790,
    '["phone_channel", "call_routing", "ivr_system", "call_recording", "call_analytics"]'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features;

-- SMS Add-on
INSERT INTO feature_addons (name, display_name, description, price_monthly, price_yearly, features)
VALUES (
    'sms',
    'SMS Messaging',
    'Send and receive SMS messages with two-way conversations',
    39,
    390,
    '["sms_channel", "sms_campaigns", "sms_templates", "sms_analytics"]'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features;

-- Proactive Engagement Add-on
INSERT INTO feature_addons (name, display_name, description, price_monthly, price_yearly, features)
VALUES (
    'proactive',
    'Proactive Engagement',
    'Trigger messages based on user behavior, exit intent, and custom events',
    59,
    590,
    '["exit_intent", "scroll_triggers", "time_triggers", "url_triggers", "utm_triggers", "cart_abandonment", "custom_popups"]'::jsonb
) ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features;

-- ============================================================================
-- ASSIGN DEFAULT PLAN TO EXISTING ORGANIZATIONS
-- ============================================================================

INSERT INTO organization_subscriptions (organization_id, plan_id, status, trial_ends_at)
SELECT 
    o.id,
    (SELECT id FROM subscription_plans WHERE name = 'starter' LIMIT 1),
    'active',
    NOW() + INTERVAL '30 days'
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM organization_subscriptions WHERE organization_id = o.id
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org ON organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status ON organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_org_addons_org ON organization_addons(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_addons_addon ON organization_addons(addon_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_org ON feature_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON feature_usage(feature_key);

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if organization has access to a feature
CREATE OR REPLACE FUNCTION has_feature_access(
    p_organization_id UUID,
    p_feature_key TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN := FALSE;
BEGIN
    -- Check if feature is in subscription plan
    SELECT EXISTS (
        SELECT 1
        FROM organization_subscriptions os
        JOIN subscription_plans sp ON os.plan_id = sp.id
        WHERE os.organization_id = p_organization_id
        AND os.status = 'active'
        AND sp.features @> to_jsonb(p_feature_key)
    ) INTO v_has_access;
    
    -- If not in plan, check if it's an active add-on
    IF NOT v_has_access THEN
        SELECT EXISTS (
            SELECT 1
            FROM organization_addons oa
            JOIN feature_addons fa ON oa.addon_id = fa.id
            WHERE oa.organization_id = p_organization_id
            AND oa.status = 'active'
            AND (oa.expires_at IS NULL OR oa.expires_at > NOW())
            AND fa.features @> to_jsonb(p_feature_key)
        ) INTO v_has_access;
    END IF;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_organization_id UUID,
    p_feature_key TEXT
) RETURNS JSONB AS $$
DECLARE
    v_limit INTEGER;
    v_usage INTEGER;
    v_result JSONB;
BEGIN
    -- Get limit from subscription plan
    SELECT 
        (sp.limits->p_feature_key)::INTEGER
    INTO v_limit
    FROM organization_subscriptions os
    JOIN subscription_plans sp ON os.plan_id = sp.id
    WHERE os.organization_id = p_organization_id
    AND os.status = 'active';
    
    -- Get current usage
    SELECT COALESCE(usage_count, 0)
    INTO v_usage
    FROM feature_usage
    WHERE organization_id = p_organization_id
    AND feature_key = p_feature_key
    AND period_end > NOW();
    
    -- -1 means unlimited
    IF v_limit = -1 THEN
        v_result := jsonb_build_object(
            'allowed', true,
            'usage', v_usage,
            'limit', null,
            'unlimited', true
        );
    ELSE
        v_result := jsonb_build_object(
            'allowed', v_usage < v_limit,
            'usage', v_usage,
            'limit', v_limit,
            'unlimited', false
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Subscription tier system created successfully!';
    RAISE NOTICE 'Tables: subscription_plans, organization_subscriptions, feature_addons, organization_addons, feature_usage';
    RAISE NOTICE 'Default plans: Starter (Free), Professional ($99/mo), Business ($299/mo)';
    RAISE NOTICE 'Add-ons: CRM ($49), Phone ($79), SMS ($39), Proactive ($59)';
    RAISE NOTICE 'Helper functions: has_feature_access(), check_usage_limit()';
END $$;
