# Multi-Tenant OAuth Integration Audit Report
**Date:** December 16, 2024  
**Status:** ⚠️ NEEDS UPDATES - Not fully multi-tenant ready

## Executive Summary
The platform has OAuth implementations for all 4 integrations (Shopify, Klaviyo, Messenger, Kustomer), but there are **critical gaps** in true multi-tenant isolation and database schema alignment.

### Current Status by Integration

| Integration | OAuth Implemented | Multi-Tenant Safe | Issues Found |
|------------|------------------|-------------------|--------------|
| **Shopify** | ✅ Yes | ⚠️ Partial | Schema mismatch, frontend uses wrong action |
| **Klaviyo** | ✅ Yes | ✅ Yes | Fully multi-tenant ready |
| **Messenger** | ✅ Yes | ✅ Yes | Fully multi-tenant ready |
| **Kustomer** | ✅ Yes | ✅ Yes | Fully multi-tenant ready |

---

## 🔴 CRITICAL ISSUES FOUND

### Issue #1: Database Schema Mismatch
**Severity:** HIGH  
**Impact:** OAuth callbacks will fail to store data properly

**Problem:**
- OAuth handlers expect: `provider`, `access_token`, `refresh_token`, `account_identifier`, `token_scope`
- Database schema has: `integration_id`, `integration_name`, `credentials`, `config`

**Evidence:**
```javascript
// shopify-oauth.js (line 95-112)
await sql`
  UPDATE integrations 
  SET 
    access_token = ${encryptedToken},              // ❌ Column doesn't exist
    account_identifier = ${JSON.stringify({...})},  // ❌ Column doesn't exist
    token_scope = ${scope},                         // ❌ Column doesn't exist
    status = 'connected',
    connected_at = NOW(),
    updated_at = NOW()
  WHERE organization_id = ${organization_id} AND provider = 'shopify'  // ❌ Uses 'provider' not 'integration_id'
`;
```

**Current Schema (database):**
```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    integration_id VARCHAR(50) NOT NULL,      -- ✅ Has this
    integration_name VARCHAR(255) NOT NULL,    -- ✅ Has this
    status VARCHAR(50) DEFAULT 'disconnected', -- ✅ Has this
    config JSONB DEFAULT '{}',                 -- ✅ Has this
    credentials JSONB DEFAULT '{}',            -- ✅ Has this (but OAuth doesn't use)
    -- ❌ MISSING: access_token, refresh_token, account_identifier, token_scope, provider
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Issue #2: Shopify Frontend Uses Wrong Database Action
**Severity:** MEDIUM  
**Impact:** OAuth flow won't initiate properly from frontend

**Problem:**
ShopifyOAuthConfiguration.jsx calls consolidated API with action `shopify_oauth_initiate`, but this action doesn't exist in consolidated.js

**Evidence:**
```javascript
// ShopifyOAuthConfiguration.jsx (line 21-33)
const response = await fetch('/api/consolidated', {
  method: 'POST',
  body: JSON.stringify({
    endpoint: 'database',
    action: 'shopify_oauth_initiate',  // ❌ This action doesn't exist
    shop: shopDomain,
    organizationId: organizationId
  })
});
```

**Reality:**
- The correct endpoint is `/api/shopify-oauth` with `/redirect` path
- Consolidated.js doesn't handle `shopify_oauth_initiate` action at all

---

### Issue #3: OAuth Flow Not Routed Through Vercel Properly
**Severity:** MEDIUM  
**Impact:** OAuth redirects may not work in production

**Current Setup:**
```javascript
// All OAuth files use hardcoded URLs
const REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI || 
  'https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback';
```

**Problem:**
- These are separate API files (shopify-oauth.js, klaviyo-oauth.js, etc.)
- Vercel routing expects them at `/api/[filename]` not `/api/oauth/[provider]/callback`
- Need to check vercel.json configuration

---

## ✅ WHAT'S WORKING CORRECTLY

### 1. OAuth Flow Logic (All Integrations)
All four OAuth handlers follow proper security patterns:
- ✅ State parameter for CSRF protection
- ✅ organization_id encoded in state
- ✅ Token encryption using tokenEncryptionService
- ✅ Error handling and redirects
- ✅ HMAC verification (Shopify)

### 2. Multi-Tenant Isolation (3/4 Integrations)
Klaviyo, Messenger, and Kustomer properly:
- ✅ Accept `organization_id` in query params
- ✅ Store organization_id in state during OAuth
- ✅ Filter by organization_id when saving tokens
- ✅ No hardcoded organization IDs

### 3. Token Security
- ✅ All tokens are encrypted before storage
- ✅ Using tokenEncryptionService consistently
- ✅ Refresh tokens stored when available

---

## 🔧 REQUIRED FIXES

### Fix #1: Align Database Schema with OAuth Handlers
**Priority:** HIGH  
**Timeline:** Immediate

**Option A: Update Database Schema (RECOMMENDED)**
```sql
-- Add missing columns to integrations table
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS account_identifier JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS token_scope TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50);

-- Create index on provider for faster queries
CREATE INDEX IF NOT EXISTS idx_integrations_org_provider 
ON integrations(organization_id, provider);

-- Migrate existing data
UPDATE integrations 
SET provider = integration_id 
WHERE provider IS NULL;
```

**Option B: Update All OAuth Handlers**
- Change all references from `provider` to `integration_id`
- Store encrypted tokens in `credentials` JSONB field
- Store metadata in `config` JSONB field
- Less secure, harder to query

**Recommendation:** Use Option A. Having dedicated columns for OAuth data is:
- More secure (encrypted text columns vs JSONB)
- Easier to query and index
- Standard practice for OAuth storage
- Matches what the OAuth handlers expect

---

### Fix #2: Update Shopify Frontend Component
**Priority:** HIGH  
**Timeline:** Immediate

**Current Code (ShopifyOAuthConfiguration.jsx, line 21):**
```javascript
const response = await fetch('/api/consolidated', {
  method: 'POST',
  body: JSON.stringify({
    endpoint: 'database',
    action: 'shopify_oauth_initiate',  // ❌ Wrong
    shop: shopDomain,
    organizationId: organizationId
  })
});
```

**Fixed Code:**
```javascript
// Build OAuth URL directly
const authUrl = `/api/shopify-oauth?action=redirect&organization_id=${organizationId}&shop=${shopDomain}`;
window.location.href = authUrl;
```

**OR create a proper action in consolidated.js:**
```javascript
// In consolidated.js, under database endpoint
if (action === 'shopify_oauth_initiate') {
  const { shop, organizationId } = body;
  const redirectUrl = `/api/shopify-oauth?action=redirect&organization_id=${organizationId}&shop=${shop}`;
  return res.status(200).json({ authUrl: redirectUrl });
}
```

---

### Fix #3: Verify Vercel Routing Configuration
**Priority:** MEDIUM  
**Timeline:** Before production launch

**Check vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/oauth/:provider/redirect",
      "destination": "/api/:provider-oauth"
    },
    {
      "source": "/api/oauth/:provider/callback",
      "destination": "/api/:provider-oauth"
    }
  ]
}
```

**Test URLs that need to work:**
- `/api/oauth/shopify/redirect` → shopify-oauth.js
- `/api/oauth/shopify/callback` → shopify-oauth.js
- `/api/oauth/klaviyo/redirect` → klaviyo-oauth.js
- `/api/oauth/klaviyo/callback` → klaviyo-oauth.js
- `/api/oauth/messenger/redirect` → messenger-oauth.js
- `/api/oauth/messenger/callback` → messenger-oauth.js
- `/api/oauth/kustomer/redirect` → kustomer-oauth.js
- `/api/oauth/kustomer/callback` → kustomer-oauth.js

---

## 📋 COMPLETE MIGRATION SQL SCRIPT

Run this in your Neon database console:

```sql
-- ============================================================================
-- MULTI-TENANT OAUTH SCHEMA MIGRATION
-- Aligns database with OAuth handler expectations
-- ============================================================================

-- Step 1: Add OAuth-specific columns to integrations table
ALTER TABLE integrations 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS account_identifier JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS token_scope TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50);

-- Step 2: Create indexes for OAuth queries
CREATE INDEX IF NOT EXISTS idx_integrations_org_provider 
ON integrations(organization_id, provider);

CREATE INDEX IF NOT EXISTS idx_integrations_provider_status
ON integrations(provider, status);

-- Step 3: Migrate existing data (set provider = integration_id)
UPDATE integrations 
SET provider = integration_id 
WHERE provider IS NULL;

-- Step 4: Add constraint to ensure provider is not null for new records
ALTER TABLE integrations 
ALTER COLUMN provider SET NOT NULL;

-- Step 5: Verify schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'integrations' 
ORDER BY ordinal_position;

-- Success message
SELECT '✅ OAuth schema migration complete!' as status;
```

---

## 📊 INTEGRATION STATUS MATRIX

| Feature | Shopify | Klaviyo | Messenger | Kustomer |
|---------|---------|---------|-----------|----------|
| OAuth Flow | ✅ | ✅ | ✅ | ✅ |
| State CSRF | ✅ | ✅ | ✅ | ✅ |
| Token Encryption | ✅ | ✅ | ✅ | ✅ |
| Refresh Token | ❌ | ✅ | ❌ | ✅ |
| Multi-Tenant | ✅ | ✅ | ✅ | ✅ |
| Schema Match | ❌ | ❌ | ❌ | ❌ |
| Frontend Ready | ⚠️ | ✅ | ✅ | ✅ |
| Production Ready | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

**Legend:**
- ✅ Fully Implemented
- ⚠️ Partially Ready (needs fixes)
- ❌ Not Implemented / Issue Found

---

## CONCLUSION

**Overall Assessment:** 🟡 YELLOW - Mostly Ready, Critical Fixes Needed

The OAuth infrastructure is **architecturally sound** but needs **database schema alignment** and **frontend updates** before production launch. The multi-tenant isolation logic is correct in the OAuth handlers, but the database schema doesn't match what the handlers expect.

**Estimated Time to Fix:** 2-4 hours
**Risk Level:** MEDIUM (existing implementations need updates)
**Blocking Production:** YES (must fix schema before going live)

---

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1: Critical Fixes (Do First)
1. **Run database migration** - Execute SQL script above in Neon
2. **Fix ShopifyOAuthConfiguration.jsx** - Update OAuth initiation
3. **Test locally** - Verify changes work

### Phase 2: Verification (Do Second)
4. **Test each OAuth flow** - Use real accounts/stores
5. **Verify multi-tenant isolation** - Test with multiple orgs
6. **Check encryption** - Confirm tokens are encrypted

### Phase 3: Production Deploy (Do Last)
7. **Deploy to Vercel** - Push changes to production
8. **Verify OAuth redirects** - Test all callback URLs
9. **Update documentation** - Document OAuth setup process

**Next Steps:**
Ready to implement fixes? Say "proceed with fixes" to start.
