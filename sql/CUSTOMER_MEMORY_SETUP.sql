-- Customer Memory & Personalization Setup
-- Run this in your Neon SQL Editor to enable persistent customer memory

-- Ensure customers table has proper structure
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_org_email ON customers(organization_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN (tags);

-- Customer visit tracking table (for detailed analytics)
CREATE TABLE IF NOT EXISTS customer_visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  channel VARCHAR(50) DEFAULT 'web',
  page_url TEXT,
  utm_source VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_medium VARCHAR(255),
  session_duration INTEGER, -- seconds
  pages_visited INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_customer_visits_customer ON customer_visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_visits_date ON customer_visits(visit_date);

-- Proactive triggers (already exists, ensure it's there)
CREATE TABLE IF NOT EXISTS proactive_triggers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(100) NOT NULL, -- 'exit_intent', 'time_on_page', 'scroll_depth', 'returning_visitor', 'cart_abandonment'
  conditions JSONB DEFAULT '{}'::jsonb,
  message TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  delay_seconds INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  action_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proactive_triggers_org ON proactive_triggers(organization_id);
CREATE INDEX IF NOT EXISTS idx_proactive_triggers_type ON proactive_triggers(trigger_type);

-- Proactive trigger statistics
CREATE TABLE IF NOT EXISTS proactive_trigger_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trigger_id UUID REFERENCES proactive_triggers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_responded BOOLEAN DEFAULT false,
  resulted_in_conversion BOOLEAN DEFAULT false,
  conversation_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_trigger_stats_trigger ON proactive_trigger_stats(trigger_id);
CREATE INDEX IF NOT EXISTS idx_trigger_stats_date ON proactive_trigger_stats(triggered_at);

-- Insert sample proactive triggers
INSERT INTO proactive_triggers (organization_id, name, trigger_type, message, conditions, priority, delay_seconds)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Welcome Back Message',
    'returning_visitor',
    'Welcome back! 👋 Last time we talked about your order. Need help with anything else?',
    '{"min_visits": 2, "days_since_last_visit": 1}'::jsonb,
    8,
    3
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Exit Intent - Order Help',
    'exit_intent',
    'Wait! 👀 Need help finding something or tracking your order?',
    '{"pages_visited": 2}'::jsonb,
    7,
    0
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Time on Page - Engaged Visitor',
    'time_on_page',
    'I see you're browsing! 🛍️ Can I help you find the perfect product?',
    '{"min_seconds": 45, "max_triggers_per_session": 1}'::jsonb,
    6,
    45
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'First Time Visitor Welcome',
    'first_visit',
    'Hi there! 👋 Welcome to our store! I'm here to help if you need anything.',
    '{"visit_count": 1}'::jsonb,
    5,
    10
  )
ON CONFLICT DO NOTHING;

-- Function to get customer insights
CREATE OR REPLACE FUNCTION get_customer_insights(p_customer_id UUID)
RETURNS TABLE (
  total_conversations BIGINT,
  total_messages BIGINT,
  avg_response_time INTERVAL,
  last_conversation_date TIMESTAMP WITH TIME ZONE,
  favorite_topics TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::BIGINT as total_conversations,
    COUNT(m.id)::BIGINT as total_messages,
    AVG(m.created_at - LAG(m.created_at) OVER (PARTITION BY c.id ORDER BY m.created_at)) as avg_response_time,
    MAX(c.created_at) as last_conversation_date,
    ARRAY_AGG(DISTINCT (c.metadata->>'topic')) FILTER (WHERE c.metadata->>'topic' IS NOT NULL) as favorite_topics
  FROM conversations c
  LEFT JOIN messages m ON m.conversation_id = c.id
  WHERE c.customer_email = (SELECT email FROM customers WHERE id = p_customer_id)
  GROUP BY c.customer_email;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Customer memory and personalization setup complete!';
  RAISE NOTICE '📊 Tables ready: customers, customer_visits, proactive_triggers, proactive_trigger_stats';
  RAISE NOTICE '🚀 Sample proactive triggers have been inserted';
  RAISE NOTICE '💡 Your bot will now remember customers across sessions!';
END $$;
