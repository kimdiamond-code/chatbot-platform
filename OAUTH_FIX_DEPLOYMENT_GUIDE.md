# OAUTH MULTI-TENANT FIX - DEPLOYMENT GUIDE
**Date:** December 16, 2024

## ✅ Changes Completed

### 1. Database Schema Migration (SQL)
**File:** `sql/oauth_schema_migration.sql`

Added OAuth-specific columns to `integrations` table:
- `provider` VARCHAR(50) - Integration provider name
- `access_token` TEXT - Encrypted OAuth access token
- `refresh_token` TEXT - Encrypted OAuth refresh token  
- `account_identifier` JSONB - Store/account details
- `token_scope` TEXT - OAuth permission scopes
- `last_synced_at` TIMESTAMP - Last sync timestamp
- `sync_status` VARCHAR(50) - Sync status

### 2. Frontend Fix
**File:** `src/components/ShopifyOAuthConfiguration.jsx`

**Changed:**
- Removed incorrect API call to `consolidated` endpoint
- Now redirects directly to `/api/shopify-oauth` handler
- Properly sanitizes shop domain
- Improved loading state detection for OAuth vs manual config

**Before:**
```javascript
const response = await fetch('/api/consolidated', {
  body: JSON.stringify({
    action: 'shopify_oauth_initiate', // ❌ Doesn't exist
    shop: shopDomain
  })
});
```

**After:**
```javascript
const cleanShop = shopDomain.replace('.myshopify.com', '').trim();
const oauthUrl = `/api/shopify-oauth?organization_id=${organizationId}&shop=${cleanShop}`;
window.location.href = oauthUrl; // ✅ Direct redirect
```

### 3. Vercel Routing
**File:** `vercel.json` (ALREADY CORRECT - No changes needed)

Verified rewrites properly route OAuth endpoints:
- `/api/oauth/shopify/*` → `/api/shopify-oauth.js` ✅
- `/api/oauth/klaviyo/*` → `/api/klaviyo-oauth.js` ✅
- `/api/oauth/messenger/*` → `/api/messenger-oauth.js` ✅
- `/api/oauth/kustomer/*` → `/api/kustomer-oauth.js` ✅

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Run Database Migration
**IMPORTANT:** Do this BEFORE deploying frontend changes

1. Log into your Neon dashboard: https://console.neon.tech
2. Select your database: `agentstack_ai_chatbot`
3. Open SQL Editor
4. Copy contents of `sql/oauth_schema_migration.sql`
5. Execute the script
6. Verify success message appears

**Expected output:**
```
✅ OAuth schema migration complete! All columns added successfully.
```

### Step 2: Verify Database Schema
Run this query to confirm columns exist:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'integrations' 
AND column_name IN ('provider', 'access_token', 'refresh_token', 'account_identifier')
ORDER BY column_name;
```

You should see all 4 columns listed.

### Step 3: Deploy Frontend to Vercel
Run this PowerShell command:

```powershell
vercel --prod
```

Wait for deployment to complete (~2-3 minutes).

### Step 4: Test OAuth Flow
1. Go to: https://chatbot-platform-v2.vercel.app/dashboard/integrations
2. Click on Shopify integration
3. Click "Connect with OAuth"
4. Enter your store domain (e.g., "truecitrus2")
5. Click "Connect with OAuth" button
6. You should be redirected to Shopify authorization page
7. Approve permissions
8. You should be redirected back to integrations page with success message

### Step 5: Verify Database Storage
After OAuth completes, run this query:
```sql
SELECT 
    organization_id,
    provider,
    status,
    account_identifier,
    connected_at
FROM integrations
WHERE provider = 'shopify'
ORDER BY connected_at DESC;
```

You should see your Shopify connection with:
- `provider` = 'shopify'
- `status` = 'connected'
- `account_identifier` contains shop details
- `access_token` is encrypted (not visible in query)

---

## 🧪 TESTING CHECKLIST

### Database Tests
- [ ] Run migration script successfully
- [ ] Verify new columns exist
- [ ] Check indexes created
- [ ] Confirm UNIQUE constraint on (organization_id, provider)

### Frontend Tests  
- [ ] Shopify OAuth button works
- [ ] Redirects to Shopify authorization
- [ ] Callback returns to platform
- [ ] Success message displays
- [ ] Connected status shows in UI

### Integration Tests
- [ ] Test with new organization (fresh OAuth)
- [ ] Test with existing organization (re-auth)
- [ ] Verify multi-tenant isolation (different orgs see only their integrations)
- [ ] Test disconnect functionality
- [ ] Verify tokens are encrypted in database

### OAuth Handler Tests
Each integration should follow same flow:
- [ ] Shopify OAuth flow works end-to-end
- [ ] Klaviyo OAuth flow works end-to-end
- [ ] Messenger OAuth flow works end-to-end
- [ ] Kustomer OAuth flow works end-to-end

---

## 🔧 TROUBLESHOOTING

### Problem: "Column provider does not exist"
**Solution:** Database migration not run yet. Complete Step 1 first.

### Problem: OAuth redirect fails (404)
**Solution:** Verify vercel.json rewrites are deployed. Redeploy with `vercel --prod`.

### Problem: OAuth callback saves but tokens missing
**Solution:** Check if OAuth handlers are using correct column names:
- Use `provider` not `integration_id` in WHERE clauses
- Use `access_token`, `refresh_token`, `account_identifier` columns

### Problem: Multi-tenant isolation broken
**Solution:** Verify all OAuth handlers include organization_id in:
1. State parameter during redirect
2. WHERE clauses during INSERT/UPDATE
3. All database queries

---

## 📋 ENVIRONMENT VARIABLES

Verify these are set in Vercel:

```env
# Database
DATABASE_URL=<your-neon-connection-string>

# Shopify OAuth
VITE_SHOPIFY_API_KEY=<shopify-client-id>
VITE_SHOPIFY_API_SECRET=<shopify-client-secret>
SHOPIFY_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback

# Klaviyo OAuth
VITE_KLAVIYO_API_KEY=<klaviyo-client-id>
VITE_KLAVIYO_API_SECRET=<klaviyo-client-secret>
KLAVIYO_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/klaviyo/callback

# Messenger OAuth
VITE_MESSENGER_APP_ID=<facebook-app-id>
VITE_MESSENGER_APP_SECRET=<facebook-app-secret>
MESSENGER_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback

# Kustomer OAuth
VITE_KUSTOMER_CLIENT_ID=<kustomer-client-id>
VITE_KUSTOMER_CLIENT_SECRET=<kustomer-client-secret>
KUSTOMER_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/kustomer/callback

# Encryption
ENCRYPTION_KEY=<your-32-byte-encryption-key>
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

Run through this checklist after deployment:

1. **Database Check:**
   ```sql
   -- Should return 7 columns including new OAuth columns
   SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'integrations' 
   AND column_name IN ('provider', 'access_token', 'refresh_token', 'account_identifier', 'token_scope', 'last_synced_at', 'sync_status');
   ```
   Expected: `7`

2. **Frontend Check:**
   - Visit: https://chatbot-platform-v2.vercel.app/dashboard/integrations
   - Click Shopify → "Connect with OAuth"
   - Should redirect (not show error)

3. **OAuth Flow Check:**
   - Complete OAuth authorization on Shopify
   - Should redirect back with success
   - Check database for new integration record

4. **Multi-Tenant Check:**
   - Create second test organization
   - Connect different Shopify store
   - Verify first org can't see second org's integration

---

## 🎯 SUCCESS CRITERIA

✅ All integrations are ready for production when:

1. Database schema matches OAuth handler expectations
2. Frontend OAuth buttons initiate correct flow
3. OAuth callbacks successfully save tokens
4. Tokens are encrypted in database
5. Multi-tenant isolation works (org A can't see org B's tokens)
6. All 4 integrations (Shopify, Klaviyo, Messenger, Kustomer) work
7. Disconnect functionality works
8. Re-authentication works (updating existing records)

---

## 📞 NEED HELP?

If issues persist after following this guide:

1. Check browser console for errors
2. Check Vercel function logs
3. Check Neon database query logs
4. Review `MULTI_TENANT_OAUTH_AUDIT_REPORT.md` for detailed analysis

---

## 🎉 DEPLOYMENT COMPLETE

Once all tests pass, your multi-tenant OAuth system is production-ready!

**Next Steps:**
1. Monitor first real OAuth connections
2. Set up error logging/alerting
3. Document OAuth setup process for end users
4. Consider adding token refresh automation
