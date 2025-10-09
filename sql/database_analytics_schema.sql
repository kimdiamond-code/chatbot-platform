-- Analytics Database Schema
-- Add this to your Supabase database

-- Add analytics metadata to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create analytics_events table for detailed tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_analytics_events_conversation (conversation_id),
  INDEX idx_analytics_events_type (event_type),
  INDEX idx_analytics_events_created (created_at)
);

-- Create analytics_summary table for aggregated data
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, metric_type)
);

-- Create function to update analytics summary
CREATE OR REPLACE FUNCTION update_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily conversation count
  INSERT INTO analytics_summary (date, metric_type, metric_value, metadata)
  VALUES (
    CURRENT_DATE,
    'total_conversations',
    1,
    '{}'::jsonb
  )
  ON CONFLICT (date, metric_type)
  DO UPDATE SET 
    metric_value = analytics_summary.metric_value + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics summary
DROP TRIGGER IF EXISTS analytics_summary_trigger ON conversations;
CREATE TRIGGER analytics_summary_trigger
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_summary();

-- Create function to track events
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_conversation_id UUID,
  p_event_type VARCHAR(100),
  p_event_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO analytics_events (conversation_id, event_type, event_data)
  VALUES (p_conversation_id, p_event_type, p_event_data)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON analytics_events TO authenticated;
GRANT ALL ON analytics_summary TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_metadata ON conversations USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date DESC);

-- Comment on tables
COMMENT ON TABLE analytics_events IS 'Stores individual analytics events for detailed tracking';
COMMENT ON TABLE analytics_summary IS 'Stores aggregated analytics data for faster querying';
COMMENT ON COLUMN conversations.metadata IS 'Stores additional analytics metadata like orderPlaced, addedToCart, customerType, etc.';

-- Example metadata structure for conversations:
-- {
--   "orderPlaced": true,
--   "orderValue": 150.00,
--   "addedToCart": true,
--   "redirectedToPDP": true,
--   "viewedProduct": true,
--   "customerType": "returning",
--   "isProactive": false,
--   "productsDiscussed": ["product-1", "product-2"],
--   "categoriesDiscussed": ["electronics", "accessories"],
--   "missingInfo": ["shipping-cost", "return-policy"]
-- }

-- Example event types:
-- 'conversation_started'
-- 'message_sent'
-- 'product_viewed'
-- 'product_added_to_cart'
-- 'order_placed'
-- 'redirected_to_pdp'
-- 'engagement_achieved'
-- 'proactive_trigger'
-- 'customer_type_identified'
