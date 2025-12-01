-- Migration: Create or update a platform global admin account
-- Email: agentstack.ai@gmail.com
-- WARNING: adjust organization_id and temporary password to match your security policy.

-- TEMPORARY PASSWORD: ChangeMe@2025!
-- After running this migration, immediately log in with the account and change the password.

INSERT INTO agents (organization_id, email, name, role, password_hash, is_active, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'agentstack.ai@gmail.com',
  'Platform Admin',
  'admin',
  'ChangeMe@2025!',
  true,
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  name = EXCLUDED.name,
  role = 'admin',
  password_hash = EXCLUDED.password_hash,
  is_active = true,
  updated_at = NOW();

-- Optional: grant explicit permissions or insert into a super_admins table if you use one.
