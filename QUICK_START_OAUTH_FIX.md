# QUICK START - OAuth Multi-Tenant Fix
**Execute these commands in order**

## Step 1: Database Migration (Neon Console)
1. Go to: https://console.neon.tech
2. Select database: `agentstack_ai_chatbot`
3. Click "SQL Editor"
4. Copy and paste this entire SQL script:

```sql
-- Add OAuth columns to integrations table
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS account_identifier JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS token_scope TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_org_provider 
ON integrations(organization_id, provider);

CREATE INDEX IF NOT EXISTS idx_integrations_provider_status
ON integrations(provider, status);

-- Migrate existing data
UPDATE integrations 
SET provider = integration_id 
WHERE provider IS NULL;

-- Add NOT NULL constraint
ALTER TABLE integrations 
ALTER COLUMN provider SET NOT NULL;

-- Add UNIQUE constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_org_provider_unique
ON integrations(organization_id, provider);

-- Drop old constraint if exists
ALTER TABLE integrations 
DROP CONSTRAINT IF EXISTS integrations_organization_id_integration_id_key;

-- Verify
SELECT '✅ OAuth schema migration complete!' as status;
```

5. Click "Run" or press Ctrl+Enter
6. Verify you see: ✅ OAuth schema migration complete!

---

## Step 2: Deploy to Vercel (PowerShell)

Open PowerShell and run these commands ONE AT A TIME:

```powershell
# Navigate to project directory
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

# Option A: Use automated script (RECOMMENDED)
.\DEPLOY_OAUTH_FIX.ps1
```

**OR**

```powershell
# Option B: Manual deployment
vercel --prod
```

Wait for deployment to complete (~2-3 minutes).

---

## Step 3: Test OAuth Flow

1. Open browser
2. Go to: https://chatbot-platform-v2.vercel.app/dashboard/integrations
3. Click on **Shopify** integration card
4. Click **"🚀 Connect with OAuth"** tab
5. Enter your store domain (e.g., `truecitrus2`)
6. Click **"Connect with OAuth"** button
7. You should be redirected to Shopify
8. Click **"Install app"** on Shopify page
9. You should be redirected back to your platform
10. Verify success message shows

---

## Step 4: Verify Database

Back in Neon SQL Editor, run:

```sql
SELECT 
    organization_id,
    provider,
    status,
    account_identifier,
    connected_at
FROM integrations
WHERE provider = 'shopify'
ORDER BY connected_at DESC
LIMIT 5;
```

You should see your new Shopify connection with:
- ✅ `provider` = 'shopify'
- ✅ `status` = 'connected'
- ✅ `account_identifier` contains shop details
- ✅ `connected_at` shows recent timestamp

---

## ✅ Success Checklist

- [ ] Database migration ran without errors
- [ ] New columns exist in integrations table
- [ ] Frontend deployed to Vercel
- [ ] Shopify OAuth button works (redirects to Shopify)
- [ ] OAuth callback returns to platform
- [ ] Success message displays in UI
- [ ] Integration shows as "Connected"
- [ ] Database contains encrypted token
- [ ] No console errors in browser

---

## 🆘 Troubleshooting

### "Column 'provider' does not exist"
→ Database migration didn't run. Go back to Step 1.

### "Cannot access /api/shopify-oauth"
→ Vercel deployment didn't complete. Re-run Step 2.

### OAuth redirects but no success message
→ Check browser console for errors. Check Vercel function logs.

### Database shows no new record
→ OAuth callback might have failed. Check Vercel function logs for errors.

---

## 📞 Need Help?

See detailed documentation:
- **OAUTH_FIX_SUMMARY.md** - Quick overview
- **OAUTH_FIX_DEPLOYMENT_GUIDE.md** - Detailed steps
- **MULTI_TENANT_OAUTH_AUDIT_REPORT.md** - Technical details

---

**You're done! 🎉**

All OAuth integrations are now properly configured for multi-tenant use.
