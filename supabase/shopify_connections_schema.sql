-- Multi-User Shopify Connections Table
-- Each user can connect their own Shopify store

CREATE TABLE IF NOT EXISTS shopify_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID,
  
  -- Store Details
  store_name TEXT NOT NULL,
  store_domain TEXT,
  
  -- Credentials
  access_token TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  
  -- Configuration
  scopes TEXT[],
  api_version TEXT DEFAULT '2024-10',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  connected_at TIMESTAMP DEFAULT NOW(),
  last_verified_at TIMESTAMP,
  last_error TEXT,
  
  -- Store Info (cached from Shopify)
  shop_name TEXT,
  shop_email TEXT,
  shop_currency TEXT,
  
  -- Settings
  enable_order_tracking BOOLEAN DEFAULT true,
  enable_product_search BOOLEAN DEFAULT true,
  enable_customer_sync BOOLEAN DEFAULT true,
  enable_inventory_alerts BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one active connection per user
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shopify_connections_user_id ON shopify_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_connections_status ON shopify_connections(status);
CREATE INDEX IF NOT EXISTS idx_shopify_connections_store_name ON shopify_connections(store_name);

-- Row Level Security
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own connections
CREATE POLICY shopify_connections_select_policy ON shopify_connections
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    user_id = '00000000-0000-0000-0000-000000000001' -- Demo user
  );

-- Policy: Users can insert their own connections
CREATE POLICY shopify_connections_insert_policy ON shopify_connections
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR 
    user_id = '00000000-0000-0000-0000-000000000001' -- Demo user
  );

-- Policy: Users can update their own connections
CREATE POLICY shopify_connections_update_policy ON shopify_connections
  FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    user_id = '00000000-0000-0000-0000-000000000001' -- Demo user
  );

-- Policy: Users can delete their own connections
CREATE POLICY shopify_connections_delete_policy ON shopify_connections
  FOR DELETE
  USING (
    user_id = auth.uid() OR 
    user_id = '00000000-0000-0000-0000-000000000001' -- Demo user
  );

-- Function: Update timestamp on update
CREATE OR REPLACE FUNCTION update_shopify_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
DROP TRIGGER IF EXISTS shopify_connections_updated_at_trigger ON shopify_connections;
CREATE TRIGGER shopify_connections_updated_at_trigger
  BEFORE UPDATE ON shopify_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_connections_updated_at();

-- Grant permissions
GRANT ALL ON shopify_connections TO authenticated;
GRANT ALL ON shopify_connections TO anon;

-- Comments
COMMENT ON TABLE shopify_connections IS 'Stores user-specific Shopify store connections for multi-tenant platform';
COMMENT ON COLUMN shopify_connections.user_id IS 'User who owns this connection';
COMMENT ON COLUMN shopify_connections.store_name IS 'Shopify store subdomain (e.g., "truecitrus2")';
COMMENT ON COLUMN shopify_connections.access_token IS 'Shopify Admin API access token';
COMMENT ON COLUMN shopify_connections.status IS 'Connection status: active, inactive, error';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Shopify connections table created successfully!';
  RAISE NOTICE 'Users can now connect their own Shopify stores.';
END $$;
