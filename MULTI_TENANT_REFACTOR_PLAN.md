# 🚨 CRITICAL: MULTI-TENANT ARCHITECTURE FIX

## ❌ **CURRENT PROBLEMS:**

Your platform has **TRUE CITRUS hardcoded** in several places, making it single-tenant instead of multi-tenant SaaS.

---

## 🔍 **HARDCODED ISSUES FOUND:**

### **1. Environment Variables (.env)**
```env
# ❌ WRONG - These are True Citrus specific!
VITE_SHOPIFY_STORE_NAME=true-citrus
VITE_SHOPIFY_ACCESS_TOKEN=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
VITE_KUSTOMER_SUBDOMAIN=true-citrus
VITE_KUSTOMER_API_KEY=eyJhbGci... (True Citrus token)
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAK... (Your personal page token)
```

**Problem:** These credentials are for True Citrus only. Other users can't connect their own accounts.

### **2. Integration Services**
The services we built (centralizedShopifyService, etc.) were designed to use admin credentials, but we need **per-user OAuth tokens** instead.

---

## ✅ **CORRECT MULTI-TENANT ARCHITECTURE:**

### **What Should Happen:**

1. **User signs up** → Gets organization_id
2. **User clicks "Connect Shopify"** → OAuth flow starts
3. **User authorizes** → Tokens stored in database (encrypted)
4. **User's chatbot** → Uses THEIR tokens, not admin tokens

---

## 🏗️ **REQUIRED CHANGES:**

### **Phase 1: Remove Hardcoded Credentials**

**Delete from .env:**
```env
# DELETE THESE - They belong to True Citrus, not the platform
VITE_SHOPIFY_STORE_NAME=true-citrus
VITE_SHOPIFY_ACCESS_TOKEN=shpat_...
VITE_KUSTOMER_SUBDOMAIN=true-citrus
VITE_KUSTOMER_API_KEY=eyJhbGci...
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAK...
```

**Keep only OAuth app credentials:**
```env
# ✅ KEEP - These are your platform's OAuth app credentials
VITE_SHOPIFY_API_KEY=1209816bfe4d73b67e9d90c19dc984d9
VITE_SHOPIFY_API_SECRET=749dc6236bfa6f6948ee4c39e0d52c37
VITE_MESSENGER_APP_ID=722364090371811
VITE_MESSENGER_APP_SECRET=f3547df34db0eae406ddc80b4f0dfb41
VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_2025
```

---

### **Phase 2: Database Schema for OAuth Tokens**

We already created the `integrations` table, but we need to add encrypted token storage:

```sql
-- Add encrypted token columns
ALTER TABLE integrations 
ADD COLUMN access_token TEXT,
ADD COLUMN refresh_token TEXT,
ADD COLUMN token_expires_at TIMESTAMP;

-- These will store encrypted per-user tokens
```

---

### **Phase 3: OAuth Flows (Per Integration)**

#### **A. Shopify OAuth Flow**

**User clicks "Connect Shopify":**
1. Frontend → `/api/oauth/shopify/redirect?organization_id={id}`
2. Backend builds OAuth URL with user's org ID in state
3. Redirects to Shopify authorization page
4. User approves
5. Shopify redirects to `/api/oauth/shopify/callback?code={code}&state={state}`
6. Backend exchanges code for access token
7. Store token in database with organization_id

**Database stores:**
```json
{
  "organization_id": "org-abc123",
  "provider": "shopify",
  "account_identifier": {
    "storeName": "user-store-name",
    "shop": "user-store-name.myshopify.com"
  },
  "access_token": "encrypted_token_here",
  "status": "connected"
}
```

#### **B. Messenger OAuth Flow**

**User clicks "Connect Facebook Page":**
1. Frontend → `/api/oauth/messenger/redirect?organization_id={id}`
2. Backend builds Facebook OAuth URL
3. User selects THEIR Facebook page
4. Gets page-specific access token
5. Store in database with organization_id and page_id

**Database stores:**
```json
{
  "organization_id": "org-xyz789",
  "provider": "messenger",
  "account_identifier": {
    "pageId": "user_page_id",
    "pageName": "User's Business Page"
  },
  "access_token": "encrypted_page_token",
  "status": "connected"
}
```

#### **C. Kustomer OAuth Flow**

Similar pattern - each user connects their own Kustomer account.

---

### **Phase 4: Update Integration Services**

**Old way (WRONG):**
```javascript
// Uses hardcoded credentials from .env
const token = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
```

**New way (CORRECT):**
```javascript
// Loads user-specific token from database
async function getUserToken(organizationId, provider) {
  const integration = await sql`
    SELECT access_token FROM integrations
    WHERE organization_id = ${organizationId} 
    AND provider = ${provider}
    AND status = 'connected'
  `;
  
  return decrypt(integration.access_token);
}

// Then use it
const token = await getUserToken(orgId, 'shopify');
```

---

### **Phase 5: Webhook Routing**

**Shopify Webhooks:**
```javascript
// Webhook receives event
// Extract shop domain from webhook
// Look up which organization owns that shop
// Route message to correct organization
```

**Messenger Webhooks:**
```javascript
// Webhook receives message
// Extract page_id from webhook
// Look up which organization owns that page
// Route message to correct organization
```

---

## 📋 **IMPLEMENTATION CHECKLIST:**

### **Immediate Actions:**

- [ ] **Remove True Citrus credentials from .env**
- [ ] **Add token encryption columns to integrations table**
- [ ] **Build Shopify OAuth endpoints**
  - [ ] `/api/oauth/shopify/redirect`
  - [ ] `/api/oauth/shopify/callback`
- [ ] **Build Messenger OAuth endpoints**
  - [ ] `/api/oauth/messenger/redirect`
  - [ ] `/api/oauth/messenger/callback`
- [ ] **Build Kustomer OAuth endpoints**
- [ ] **Update webhook handlers to route by organization**
- [ ] **Update integration services to load user tokens**
- [ ] **Update frontend to trigger OAuth flows**
- [ ] **Test with multiple test organizations**

---

## 🎯 **TRUE CITRUS AS A USER:**

After these changes, True Citrus will:

1. **Sign up** as a regular user
2. **Get their own organization ID**
3. **Connect their Shopify store** via OAuth
4. **Connect their Kustomer** via OAuth
5. **Connect their Facebook Page** via OAuth
6. **Use the platform** like any other customer

**No special treatment. No hardcoded credentials.**

---

## ⚠️ **BREAKING CHANGES:**

This refactor will **temporarily break** existing connections because:
- Environment variables will be removed
- Code will look for database tokens instead

**Migration path for True Citrus:**
1. Remove hardcoded credentials
2. Deploy OAuth flows
3. True Citrus goes through OAuth like a new user
4. Reconnects all services

---

## 🚀 **NEXT STEPS:**

1. **Review this document** - Make sure you understand the changes
2. **Confirm approach** - This is the correct multi-tenant architecture
3. **Start implementation** - I'll build the OAuth flows
4. **Test thoroughly** - With multiple test accounts
5. **Migrate True Citrus** - As a regular user

---

**Ready to start the refactor? This is the RIGHT way to build a multi-tenant SaaS platform.**

Type "START REFACTOR" and I'll begin removing hardcoded credentials and building proper OAuth flows!
