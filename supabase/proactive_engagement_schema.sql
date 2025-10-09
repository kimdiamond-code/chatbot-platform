-- Proactive Engagement Schema
-- Add this to your Supabase SQL Editor

-- Proactive triggers table
CREATE TABLE IF NOT EXISTS proactive_triggers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- 'exit_intent', 'scroll_percentage', 'time_on_page', 'cart_abandonment', 'utm_parameter', 'url_match'
    enabled BOOLEAN DEFAULT true,
    message TEXT NOT NULL,
    delay_seconds INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 5, -- 1-10, higher = more important
    conditions JSONB DEFAULT '{}', -- e.g., {"scrollPercentage": 50, "pageUrl": "/products/*", "utm_source": "facebook"}
    action_config JSONB DEFAULT '{}', -- e.g., {"showPopup": true, "playSound": false, "offerCode": "SAVE10"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proactive trigger events (tracking when triggers fire)
CREATE TABLE IF NOT EXISTS proactive_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trigger_id UUID REFERENCES proactive_triggers(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    page_url TEXT,
    user_agent TEXT,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    engaged BOOLEAN DEFAULT false, -- did user click/respond?
    converted BOOLEAN DEFAULT false, -- did they complete desired action?
    metadata JSONB DEFAULT '{}'
);

-- Proactive analytics aggregate table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_proactive_triggers_org ON proactive_triggers(organization_id);
CREATE INDEX IF NOT EXISTS idx_proactive_triggers_enabled ON proactive_triggers(organization_id, enabled);
CREATE INDEX IF NOT EXISTS idx_proactive_events_trigger ON proactive_events(trigger_id);
CREATE INDEX IF NOT EXISTS idx_proactive_events_org ON proactive_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_proactive_events_triggered ON proactive_events(triggered_at);
CREATE INDEX IF NOT EXISTS idx_proactive_analytics_date ON proactive_analytics(organization_id, date DESC);

-- RLS Policies
ALTER TABLE proactive_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON proactive_triggers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON proactive_triggers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON proactive_triggers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON proactive_triggers FOR DELETE USING (true);

CREATE POLICY "Enable all access for proactive events" ON proactive_events FOR ALL USING (true);
CREATE POLICY "Enable read access for analytics" ON proactive_analytics FOR SELECT USING (true);

-- Function to update analytics daily
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

-- Trigger to update analytics
CREATE TRIGGER trigger_update_proactive_analytics
    AFTER INSERT ON proactive_events
    FOR EACH ROW
    EXECUTE FUNCTION update_proactive_analytics();

-- Insert default proactive triggers
INSERT INTO proactive_triggers (organization_id, name, trigger_type, enabled, message, delay_seconds, priority, conditions, action_config)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Exit Intent Popup', 'exit_intent', true, 
     'Wait! Before you go, can we help you find something?', 0, 9,
     '{"minTimeOnSite": 10}', '{"showPopup": true, "playSound": false}'),
    
    ('00000000-0000-0000-0000-000000000001', '50% Scroll Engagement', 'scroll_percentage', true,
     'You''re halfway through! Need any assistance?', 0, 5,
     '{"scrollPercentage": 50, "pageUrl": "*"}', '{"showPopup": true}'),
    
    ('00000000-0000-0000-0000-000000000001', 'Time on Page - 60s', 'time_on_page', false,
     'Been browsing for a while? Let''s chat!', 60, 4,
     '{"pageUrl": "/products/*", "timeOnPage": 60}', '{"showPopup": true}'),
    
    ('00000000-0000-0000-0000-000000000001', 'Cart Abandonment', 'cart_abandonment', true,
     'Still thinking about your cart? Get 10% off if you complete your purchase now! Use code SAVE10', 30, 10,
     '{"hasCartItems": true, "cartValue": 50}', '{"showPopup": true, "offerCode": "SAVE10"}'),
    
    ('00000000-0000-0000-0000-000000000001', 'UTM Campaign Welcome', 'utm_parameter', true,
     'Welcome! Thanks for visiting from our campaign. Here''s an exclusive offer just for you!', 5, 7,
     '{"utm_source": "*", "utm_campaign": "summer_sale"}', '{"showPopup": true}'),
    
    ('00000000-0000-0000-0000-000000000001', 'Specific URL - Pricing Page', 'url_match', true,
     'Questions about pricing? Our team is here to help you find the perfect plan!', 10, 6,
     '{"pageUrl": "/pricing*"}', '{"showPopup": true}')
ON CONFLICT DO NOTHING;
