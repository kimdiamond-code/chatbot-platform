-- SHOPIFY MULTI-TENANT CLEANUP SCRIPT
-- Run this in your Neon Database SQL console to reset Shopify connections
-- After running this, each user will need to reconnect their own store

-- 1. Backup existing connections (optional, for safety)
CREATE TABLE IF NOT EXISTS integrations_backup_20241217 AS 
SELECT * FROM integrations WHERE integration_id = 'shopify';

-- 2. View current Shopify connections
SELECT 
  id,
  organization_id,
  integration_id,
  status,
  created_at,
  SUBSTRING(credentials_encrypted::text, 1, 50) as credentials_preview
FROM integrations 
WHERE integration_id = 'shopify';

-- 3. Delete ALL existing Shopify connections
-- This forces all users to reconnect with their proper organization_id
DELETE FROM integrations 
WHERE integration_id = 'shopify';

-- 4. Verify all Shopify connections are removed
SELECT COUNT(*) as remaining_shopify_connections 
FROM integrations 
WHERE integration_id = 'shopify';
-- Should return 0

-- 5. Check agents table has organization_id for all users
SELECT 
  id,
  email,
  name,
  organization_id,
  role
FROM agents
ORDER BY created_at DESC;

-- If any users are missing organization_id, update them:
-- UPDATE agents 
-- SET organization_id = gen_random_uuid() 
-- WHERE organization_id IS NULL;

-- Now have each user:
-- 1. Logout
-- 2. Login 
-- 3. Go to Integrations
-- 4. Connect their Shopify store
-- Each connection will now be properly isolated by organization_id
