# IMMEDIATE FIX: Multi-Tenant Shopify Setup

## Current Issue
Your users don't have agent records in the Neon database, so `organization_id` is `undefined`.

## Quick Fix Steps

### Step 1: Deploy Updated Code First

```powershell
# Commit and deploy
git add .
git commit -m "Fix: Enhanced auth with better error messages for missing agent records"
git push origin main
vercel --prod
```

### Step 2: Check Who Needs Agent Records

After deployment, each user should:

1. **Go to the site** (after it finishes deploying)
2. **Login** with their credentials
3. **Try to open Integrations page**
4. **Check browser console** (F12 → Console tab)

You'll see one of these messages:

#### ✅ Good - User has agent record:
```
✅ Loaded full user: { email: 'user@email.com', organization_id: 'uuid-xxxx', role: 'admin' }
```

#### ❌ Bad - User missing agent record:
```
⚠️ No agent record found in Neon database for: user@email.com
🛠️ This user needs an agent record created in the database
📝 Run this SQL in Neon:
INSERT INTO agents (organization_id, email, name, role, is_active) VALUES (gen_random_uuid(), 'user@email.com', 'user', 'admin', true);
```

**Plus the page will show a yellow error box with the exact SQL to run.**

### Step 3: Create Missing Agent Records

For each user that shows the error:

1. **Copy the SQL from the console or yellow error box**
2. **Go to Neon Dashboard**: https://console.neon.tech
3. **Select your database**: aidefvxiaaekzwflxqtd
4. **Go to SQL Editor**
5. **Paste and run the SQL**

Example SQL for multiple users:
```sql
-- User A
INSERT INTO agents (organization_id, email, name, role, is_active) 
VALUES (gen_random_uuid(), 'usera@email.com', 'User A', 'admin', true);

-- User B
INSERT INTO agents (organization_id, email, name, role, is_active) 
VALUES (gen_random_uuid(), 'userb@email.com', 'User B', 'admin', true);

-- Verify they were created
SELECT id, email, organization_id, role FROM agents;
```

### Step 4: Clean Old Shopify Connections

```sql
-- Delete ALL old Shopify connections (they used hardcoded org IDs)
DELETE FROM integrations WHERE integration_id = 'shopify';

-- Verify deletion
SELECT COUNT(*) FROM integrations WHERE integration_id = 'shopify';
-- Should show: 0
```

### Step 5: Have Users Reconnect

**For each user:**

1. **Refresh the page** (or click "Retry After Database Update")
2. **Check console again** - should now show:
   ```
   ✅ Loaded full user: { email: 'user@email.com', organization_id: 'uuid-xxxx', role: 'admin' }
   ```
3. **Go to Integrations page** - should work now!
4. **Click Shopify → Configure**
5. **Connect their own Shopify store**

## Verification Checklist

- [ ] Code deployed to Vercel
- [ ] User A has agent record with unique organization_id
- [ ] User B has agent record with unique organization_id  
- [ ] Old Shopify connections deleted from database
- [ ] User A can login and see their organization_id in console
- [ ] User B can login and see their organization_id in console
- [ ] User A connects their Shopify store
- [ ] User B connects their different Shopify store
- [ ] User A still sees only their store (not B's)
- [ ] User B still sees only their store (not A's)

## Quick Test Commands

### In Browser Console:
```javascript
// After logging in, run this:
const { user } = await (async () => {
  // Get from React DevTools or localStorage
  const supabaseKey = Object.keys(localStorage).find(k => k.includes('supabase'));
  const session = JSON.parse(localStorage.getItem(supabaseKey));
  
  const response = await fetch('/api/consolidated', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'auth',
      action: 'get_user_by_email',
      email: session.user.email
    })
  });
  
  return await response.json();
})();

console.log('Organization ID:', user?.agent?.organization_id);
```

### In Neon SQL Editor:
```sql
-- Check all users
SELECT 
  email, 
  organization_id, 
  role,
  is_active,
  created_at
FROM agents
ORDER BY created_at DESC;

-- Check Shopify connections
SELECT 
  organization_id,
  integration_id,
  status,
  created_at
FROM integrations
WHERE integration_id = 'shopify';
```

## What the Fix Does

### Before:
- User logs in with Supabase
- No agent record in Neon
- `user.organization_id` = `undefined`
- Can't use integrations

### After:
- User logs in with Supabase
- Auth hook fetches agent record from Neon via API
- `user.organization_id` = `uuid-xxxx` (unique per user)
- Can use integrations properly
- Each user's Shopify connection is isolated

## Troubleshooting

### Issue: "organization_id is still undefined"
**Solution:** Make sure you:
1. Deployed the new code
2. Created the agent record in Neon
3. Refreshed the page completely (Ctrl+Shift+R)

### Issue: "Still seeing other user's Shopify store"
**Solution:** 
1. Run the cleanup SQL to delete old connections
2. Have each user reconnect with their credentials

### Issue: "Can't connect Shopify - button grayed out"
**Solution:**
1. Check console for organization_id
2. If undefined, create agent record
3. Refresh and try again

## Support

If you still have issues:
1. Check browser console for error messages
2. Check Vercel deployment logs
3. Verify agent records exist in Neon
4. Verify old Shopify connections were deleted

---

**Next:** After all users have connected successfully, test by switching between accounts and confirming each sees only their own store.
