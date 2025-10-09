-- Add Proactive Triggers Table to Complete Schema
-- Run this after the main schema setup

-- Proactive Triggers table
CREATE TABLE IF NOT EXISTS proactive_triggers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL, -- 'exit_intent', 'scroll_percentage', 'time_on_page', 'cart_abandonment', 'utm_parameter', 'url_match'
  message TEXT NOT NULL,
  delay_seconds INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 5,
  conditions JSONB DEFAULT '{}'::jsonb,
  action_config JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proactive Trigger Stats
CREATE TABLE IF NOT EXISTS proactive_trigger_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trigger_id UUID REFERENCES proactive_triggers(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  resulted_in_conversion BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proactive_triggers_org ON proactive_triggers(organization_id);
CREATE INDEX IF NOT EXISTS idx_proactive_triggers_enabled ON proactive_triggers(enabled);
CREATE INDEX IF NOT EXISTS idx_proactive_trigger_stats_trigger ON proactive_trigger_stats(trigger_id);
CREATE INDEX IF NOT EXISTS idx_proactive_trigger_stats_date ON proactive_trigger_stats(triggered_at);

-- Enable RLS
ALTER TABLE proactive_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_trigger_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on proactive_triggers" ON proactive_triggers FOR ALL USING (true);
CREATE POLICY "Allow all operations on proactive_trigger_stats" ON proactive_trigger_stats FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_proactive_triggers_updated_at BEFORE UPDATE ON proactive_triggers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Proactive triggers tables added successfully!';
END $$;
