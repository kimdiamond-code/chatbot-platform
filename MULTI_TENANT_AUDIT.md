# Multi-Tenant Architecture Audit & Fix Plan

## Date: 2025-01-21
## Current Status: CRITICAL ISSUES IDENTIFIED

---

## 🚨 CRITICAL FINDINGS

### 1. **Hardcoded Default Organization ID**
**Location**: Multiple files
**Issue**: Default org ID `00000000-0000-0000-0000-000000000001` used as fallback
**Impact**: Users without proper organization_id will see default org's data

**Files Affected**:
- `/src/services/shopifyService.js` - Line 6
- `/api/consolidated.js` - Line 91 (create_conversation)
- Various other service files

**Fix Required**: Remove all default org ID fallbacks. Require organizationId or fail gracefully.

---

### 2. **Missing Organization Filtering in OAuth Flows**

#### Shopify OAuth
**Current State**: OAuth initiate and callback need organization_id tracking
**Missing**:
- OAuth state parameter doesn't include organization_id
- No tenant routing in callback handler
- Credentials saved without proper organization isolation

**Required Routes** (from TENANT_ROUTING_ARCHITECTURE.docx):
```
✅ GET /api/oauth/shopify/redirect - Needs tenant_id in state
✅ GET /api/oauth/shopify/callback - Needs to extract tenant_id from state
✅ POST /api/integrations/shopify/status - Needs organizationId filter
```

---

### 3. **Database Queries Missing Organization Filter**

**High Priority Queries to Fix**:

```sql
-- CONVERSATIONS - Has org filter ✅ (but fallback to default ❌)
SELECT * FROM conversations 
WHERE organization_id = ${orgId} -- Good but has default fallback

-- INTEGRATIONS - Needs consistent filtering
SELECT * FROM integrations 
WHERE organization_id = ${organizationId} 
AND integration_id = 'shopify'

-- BOT CONFIGS - Already filtered ✅
SELECT * FROM bot_configs 
WHERE organization_id = ${orgId}

-- MESSAGES - Indirect filter via conversation_id ⚠️
-- Need to validate conversation belongs to user's org
```

---

### 4. **Authentication Context Issues**

**AuthContext.jsx** - Good foundation but needs enhancement:
```javascript
// Current (Line 52):
organizationId: user?.organizationId || null  // ✅ Good - no fallback

// But service layer uses defaults:
const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001'; // ❌ BAD
```

---

### 5. **API Endpoint Consolidation Gaps**

**Missing in `/api/consolidated.js`**:
- Shopify OAuth initiate endpoint
- Shopify OAuth callback endpoint  
- Shopify integration service calls (products, orders, cart)
- Kustomer OAuth endpoints
- Klaviyo OAuth endpoints

**Current Coverage**:
✅ Database operations
✅ Auth (login/signup/logout)
✅ Conversations/Messages
✅ Bot configs
✅ Proactive triggers
✅ Analytics events
❌ OAuth flows
❌ Integration service calls

---

## 📋 REQUIRED ARCHITECTURE (From TENANT_ROUTING_ARCHITECTURE.docx)

### Frontend Routes
```
/auth/login → /api/auth/callback → /dashboard
/dashboard/integrations
/dashboard/integrations/{provider}/connect → /api/oauth/{provider}/redirect
```

### Backend OAuth Routes (MISSING/INCOMPLETE)
```
GET  /api/oauth/{provider}/redirect      ❌ NOT IN CONSOLIDATED.JS
     - Reads tenant_id from session
     - Builds provider OAuth URL
     - Sets state param with tenant_id
     - Redirects to provider login

GET  /api/oauth/{provider}/callback      ❌ NOT IN CONSOLIDATED.JS
     - Provider sends auth_code + state
     - Extract tenant_id from state
     - Exchange code → tokens
     - Store in oauth_credentials table
     - Redirect to /dashboard/integrations
```

### Backend Token Management Routes
```
GET    /api/integrations/{provider}/status     ⚠️ PARTIAL (in consolidated.js)
POST   /api/integrations/{provider}/refresh    ❌ MISSING
DELETE /api/integrations/{provider}/disconnect ❌ MISSING
```

### Backend Integration Service Routes (MISSING)
```
POST /api/integrations/shopify/order-status   ❌ NOT IMPLEMENTED
POST /api/integrations/shopify/products       ❌ NOT IMPLEMENTED
POST /api/integrations/klaviyo/subscribe      ❌ NOT IMPLEMENTED
POST /api/integrations/kustomer/create-ticket ❌ NOT IMPLEMENTED
```

---

## 🔧 FIX PLAN - PRIORITY ORDER

### Phase 1: Critical Security Fixes (TODAY)
**Priority**: 🔴 CRITICAL

1. **Remove all hardcoded organization IDs**
   - File: `/src/services/shopifyService.js`
   - Remove: `const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001'`
   - Change: Always require organizationId parameter
   - Add: Proper error handling when organizationId is missing

2. **Fix conversation creation fallback**
   - File: `/api/consolidated.js` line 91
   - Remove: `const orgId = organization_id || '00000000-0000-0000-0000-000000000001'`
   - Change: Require organization_id or return 400 error
   
3. **Add organization validation middleware**
   - Create: `/api/middleware/validateOrganization.js`
   - Purpose: Verify user belongs to organization they're accessing
   - Apply to: All database queries

### Phase 2: OAuth Flow Implementation (NEXT)
**Priority**: 🟡 HIGH

4. **Add OAuth routes to consolidated.js**
   ```javascript
   // Add to consolidated.js:
   if (endpoint === 'oauth') {
     if (action === 'shopify_initiate') {
       // Build OAuth URL with state parameter containing organizationId
     }
     if (action === 'shopify_callback') {
       // Extract organizationId from state
       // Exchange code for tokens
       // Save to integrations table with organizationId
     }
   }
   ```

5. **Update ShopifyOAuthConfiguration.jsx**
   - Ensure organizationId is passed in OAuth initiate call
   - Handle OAuth callback with organization context

### Phase 3: Integration Service Consolidation (LATER)
**Priority**: 🟢 MEDIUM

6. **Add integration service endpoints**
   ```javascript
   if (endpoint === 'integrations') {
     if (action === 'shopify_products') {
       // Load credentials for organizationId
       // Call Shopify API
       // Return products
     }
     if (action === 'shopify_order_status') {
       // Load credentials for organizationId
       // Call Shopify API
       // Return order status
     }
   }
   ```

### Phase 4: Database Schema Validation (ONGOING)
**Priority**: 🟢 MEDIUM

7. **Add database constraints**
   ```sql
   -- Ensure organization_id is NOT NULL where critical
   ALTER TABLE integrations 
   ALTER COLUMN organization_id SET NOT NULL;
   
   ALTER TABLE conversations 
   ALTER COLUMN organization_id SET NOT NULL;
   
   ALTER TABLE bot_configs 
   ALTER COLUMN organization_id SET NOT NULL;
   ```

---

## 🧪 TESTING CHECKLIST

After implementing fixes, test:

- [ ] Create two test accounts with different emails
- [ ] Each creates their own Shopify connection
- [ ] Verify Account A cannot see Account B's:
  - [ ] Integrations
  - [ ] Conversations
  - [ ] Bot configs
  - [ ] Products
  - [ ] Orders
- [ ] Test OAuth flow maintains organization context
- [ ] Test all API endpoints require valid organizationId
- [ ] Test error handling when organizationId is missing

---

## 📊 COMPLIANCE WITH ARCHITECTURE SPEC

From `API_Specification_SaaS_Chatbot_Platform.docx`:

### ✅ Implemented Correctly
- User management endpoints
- Integration listing
- Token storage in database

### ⚠️ Partially Implemented
- OAuth flow (missing state parameter with tenant_id)
- Webhook handlers (structure exists, needs tenant routing)

### ❌ Not Implemented
- Per-provider OAuth redirect endpoints
- Token refresh logic
- Integration service proxy endpoints

---

## 🔐 SECURITY NOTES

From specification:
- ✅ Tokens stored in database (integrations.credentials_encrypted)
- ⚠️ Field-level encryption needed (currently JSON strings)
- ✅ OAuth scoped to minimum permissions
- ❌ HMAC verification for webhooks not implemented

---

## IMMEDIATE ACTION REQUIRED

**Start with**: Phase 1, Item #1 - Remove hardcoded organization IDs

This is the most critical security issue. Users from different organizations could potentially see each other's data if authentication fails to set organizationId properly.

**Next**: Implement OAuth routes in consolidated.js to complete multi-tenant OAuth flow.
