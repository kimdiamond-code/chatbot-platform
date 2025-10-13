-- STEP 1: Add authentication columns to agents table
-- Run each ALTER TABLE separately if needed

ALTER TABLE agents ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token TEXT;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;

ALTER TABLE agents ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- STEP 2: Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- STEP 4: Insert admin user (admin@chatbot.com / admin123)
INSERT INTO agents (
  organization_id, 
  email, 
  name, 
  role, 
  password_hash,
  is_active
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@chatbot.com',
  'Admin User',
  'admin',
  'admin123',
  true
) 
ON CONFLICT (organization_id, email) 
DO UPDATE SET 
  password_hash = 'admin123',
  role = 'admin',
  is_active = true;

-- STEP 5: Insert test user (user@chatbot.com / user123)
INSERT INTO agents (
  organization_id, 
  email, 
  name, 
  role, 
  password_hash,
  is_active
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'user@chatbot.com',
  'Test User',
  'agent',
  'user123',
  true
) 
ON CONFLICT (organization_id, email) 
DO UPDATE SET 
  password_hash = 'user123',
  role = 'agent',
  is_active = true;

-- STEP 6: Verify setup
SELECT 'Setup complete!' as status;

SELECT email, name, role, is_active 
FROM agents 
WHERE email IN ('admin@chatbot.com', 'user@chatbot.com');
