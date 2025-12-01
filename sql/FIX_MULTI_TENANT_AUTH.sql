-- ============================================================================
-- FIX MULTI-TENANT AUTHENTICATION
-- This fixes the critical bug where all users are assigned to the same org
-- ============================================================================

-- 1. Add authentication columns to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 2. Create sessions table for token-based auth
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- 3. Add users table (separate from agents for proper multi-tenancy)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create organization_users junction table (many-to-many)
CREATE TABLE IF NOT EXISTS organization_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user', -- 'owner', 'admin', 'developer', 'manager', 'agent', 'user'
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE,
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_users_org ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_org_users_role ON organization_users(role);

-- 5. Add organization ownership tracking
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- 6. Migrate existing agents to new structure (if any exist)
-- This creates a user for each agent and links them to their org
DO $$
DECLARE
  agent_record RECORD;
  new_user_id UUID;
BEGIN
  FOR agent_record IN SELECT * FROM agents WHERE email NOT LIKE '%@agentstack.ai'
  LOOP
    -- Create user if not exists
    INSERT INTO users (email, name, password_hash)
    VALUES (agent_record.email, agent_record.name, COALESCE(agent_record.password_hash, 'NEEDS_RESET'))
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO new_user_id;
    
    -- If user already existed, get their ID
    IF new_user_id IS NULL THEN
      SELECT id INTO new_user_id FROM users WHERE email = agent_record.email;
    END IF;
    
    -- Link user to their organization
    INSERT INTO organization_users (organization_id, user_id, role, is_active)
    VALUES (agent_record.organization_id, new_user_id, agent_record.role, agent_record.is_active)
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;
  END LOOP;
END $$;

-- 7. Update first user in each org to be the owner
UPDATE organizations o
SET owner_user_id = (
  SELECT ou.user_id 
  FROM organization_users ou 
  WHERE ou.organization_id = o.id 
  ORDER BY ou.joined_at ASC 
  LIMIT 1
)
WHERE owner_user_id IS NULL;

-- 8. Create helper function to check user's org access
CREATE OR REPLACE FUNCTION user_has_org_access(p_user_id UUID, p_organization_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM organization_users
    WHERE user_id = p_user_id
    AND organization_id = p_organization_id
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- 9. Create helper function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id UUID)
RETURNS TABLE(
  organization_id UUID,
  organization_name VARCHAR(255),
  role VARCHAR(50),
  is_owner BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    ou.role,
    (o.owner_user_id = p_user_id) as is_owner
  FROM organizations o
  JOIN organization_users ou ON o.id = ou.organization_id
  WHERE ou.user_id = p_user_id
  AND ou.is_active = true
  ORDER BY ou.joined_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Multi-tenant authentication schema fixed!' as status,
       'Users table created' as step1,
       'Organization-users junction created' as step2,
       'Existing data migrated' as step3,
       'Helper functions added' as step4;
