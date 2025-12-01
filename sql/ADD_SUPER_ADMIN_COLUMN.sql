-- Migration: add is_super_admin column to agents and set default false
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_agents_is_super_admin ON agents(is_super_admin);

-- Make the platform admin a super-admin (adjust email as needed)
UPDATE agents
SET is_super_admin = TRUE
WHERE email = 'agentstack.ai@gmail.com';
