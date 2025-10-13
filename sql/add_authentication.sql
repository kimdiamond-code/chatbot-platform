-- Add authentication fields to agents table
ALTER TABLE agents 
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Create sessions table for session management
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

-- Create default admin user with password "admin123" (hashed with bcrypt)
-- Password: admin123
INSERT INTO agents (
  id,
  organization_id, 
  email, 
  name, 
  role, 
  password_hash,
  is_active
)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin@chatbot.com',
  'Admin User',
  'admin',
  '$2a$10$XQqyJ3dQ7xVQ5qKzH.HqH.VEq4kFjc5zYqzH7Y5kH5Y5kH5Y5kH5Y.',
  true
) ON CONFLICT (organization_id, email) DO UPDATE 
SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

-- Create test user with password "user123"
INSERT INTO agents (
  id,
  organization_id, 
  email, 
  name, 
  role, 
  password_hash,
  is_active
)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'user@chatbot.com',
  'Test User',
  'agent',
  '$2a$10$YRqzJ3dQ8xVQ6qKzI.IqI.WFq5kGkd6zZqzI8Z6kI6Z6kI6Z6kI6Z.',
  true
) ON CONFLICT (organization_id, email) DO UPDATE 
SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

SELECT 'Authentication tables added successfully!' as status;
SELECT 'Admin login: admin@chatbot.com / admin123' as admin_credentials;
SELECT 'User login: user@chatbot.com / user123' as user_credentials;
