# Multi-Tenant Architecture Audit Report

**Date**: November 24, 2025  
**Platform**: AgenStack.ai Chatbot Platform  
**Status**: ⚠️ Partially Compliant - Critical Issues Identified

---

## Executive Summary

The platform has the foundational structure for multi-tenancy but has several critical gaps in tenant isolation that need immediate attention. The authentication system correctly captures `organizationId`, but many integration and service calls either hardcode organization IDs or fail to properly propagate tenant context.

**Critical Risk**: Current implementation allows potential data leakage between tenants due to inconsistent organization ID handling.

---

## ✅ What's Working Correctly

### 1. Authentication Flow
- **Location**: `src/services/authService.js`
- **Status**: ✅ CORRECT
- Login/signup properly returns `organizationId` from database
- Session tokens include organization context
- AuthContext properly exposes `organizationId` via `useAuth()` hook

```javascript
// ✅ GOOD - Auth returns organization_id
const authData = {
  id: data.user.id,
  email: data.user.email,
  name: data.user.name,
  role: data.user.role,
  organizationId: data.user.organization_id,  // ✅ Properly captured
  token: data.token,
  expiresAt: data.expiresAt
};
```

### 2. Database Schema
- **Status**: ✅ CORRECT
- All tables have `organization_id` columns
- Foreign key constraints properly enforce tenant boundaries
- Integration credentials stored with tenant binding

### 3. Bot Builder
- **Location**: `src/components/BotBuilder.jsx`
- **Status**: ✅ CORRECT
- Properly reads `organizationId` from auth context
- Loads bot configuration scoped to organization
- Saves configurations with correct tenant binding

```javascript
// ✅ GOOD - Bot Builder uses auth context
const currentUser = authService.getCurrentUser();
const organizationId = currentUser?.organizationId || DEFAULT_ORG_ID;
```

### 4. OAuth State Management
- **Location**: `api/consolidated.js` - `shopify_oauth_callback`
- **Status**: ✅ CORRECT
- Uses cryptographically secure state tokens
- Stores state → organization mapping in `oauth_states` table
- Verifies state before completing OAuth flow

```javascript
// ✅ GOOD - OAuth properly verifies state
const rows = await sql`
  SELECT * FROM oauth_states
  WHERE state_token = ${state}
  AND used_at IS NULL
  AND expires_at > NOW()
  LIMIT 1
`;
orgId = rows[0].organization_id;
```

---

## ❌ Critical Issues Identified

### Issue #1: Hardcoded Organization ID in Shopify Integration
**Location**: `src/components/integrations/ShopifyIntegration.jsx:89`  
**Severity**: 🔴 CRITICAL

```javascript
// ❌ BAD - Hardcoded organization ID
organizationId: user?.organizationId || '00000000-0000-0000-0000-000000000001',
```

**Impact**: If `user` or `user.organizationId` is undefined, falls back to default organization, causing all users to share the same Shopify connection.

**Fix Required**:
```javascript
// ✅ GOOD - Validate organization ID exists
if (!user?.organizationId) {
  throw new Error('User organization not found. Please log out and log back in.');
}

organizationId: user.organizationId,  // No fallback allowed
```

---

### Issue #2: Missing Organization Context in Shopify Service
**Location**: `src/services/shopifyService.js`  
**Severity**: 🔴 CRITICAL

While the service correctly requires `organizationId` as a parameter, there's no validation that it exists:

```javascript
// ❌ RISKY - No validation if organizationId is undefined
async getProducts(options = {}) {
  const { limit = 50, organizationId } = options;
  
  if (!organizationId) {
    throw new Error('organizationId is required for getProducts');
  }
  // ... continues
}
```

**Issue**: The error is thrown, but calling code might not handle it properly.

**Fix Required**:
```javascript
// ✅ GOOD - Validate at service initialization
constructor(organizationId) {
  if (!organizationId) {
    throw new Error('ShopifyService requires organizationId');
  }
  this.organizationId = organizationId;
}
```

---

### Issue #3: Authentication Context Loading Race Condition
**Location**: Various components using `useAuth()`  
**Severity**: 🟡 HIGH

Components may render before auth context is fully loaded, causing `organizationId` to be `null` or `undefined` initially.

**Observed Pattern**:
```javascript
// ❌ RISKY - Auth may not be loaded yet
const { user } = useAuth();
const organizationId = user?.organizationId;  // Could be undefined during init
```

**Fix Required**:
```javascript
// ✅ GOOD - Wait for auth to load
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!user?.organizationId) {
  return <ErrorMessage>Please log in to continue</ErrorMessage>;
}

const organizationId = user.organizationId;
```

---

### Issue #4: Missing Organization ID Propagation in API Calls
**Location**: Multiple service files  
**Severity**: 🟡 HIGH

Some API endpoints don't consistently receive `organizationId`:

```javascript
// ❌ BAD - Missing organizationId in some calls
const response = await fetch('/api/consolidated', {
  method: 'POST',
  body: JSON.stringify({
    endpoint: 'database',
    action: 'get_conversations',
    // ❌ Missing: organizationId
  })
});
```

**Fix Required**: All database operations should include organization context.

---

## 📋 Compliance Checklist

### Authentication & Session Management
- [x] Login returns `organization_id` from database
- [x] Session tokens include organization context
- [x] AuthContext exposes `organizationId` via hook
- [ ] All components validate auth is loaded before using `organizationId`
- [ ] No fallback to default organization ID anywhere in codebase

### OAuth Integration Flow
- [x] OAuth initiation stores state → organization mapping
- [x] OAuth callback verifies state token
- [x] Integration credentials saved with correct `organization_id`
- [ ] Frontend properly waits for auth context before initiating OAuth
- [ ] No race conditions in OAuth flow

### Service Layer
- [x] Shopify service requires `organizationId` parameter
- [ ] Shopify service validates `organizationId` exists (not just checks)
- [ ] All Shopify API calls include organization context
- [ ] Database service validates organization ownership of resources

### Database Operations
- [x] All tables have `organization_id` column
- [x] Foreign key constraints enforce tenant boundaries
- [x] API endpoints validate organization ownership
- [ ] Queries consistently filter by `organization_id`
- [ ] No shared data between tenants

### Frontend Components
- [x] BotBuilder loads config scoped to organization
- [ ] All integrations validate `user.organizationId` exists
- [ ] No hardcoded fallback organization IDs
- [ ] Components handle auth loading state
- [ ] Error messages guide user to proper authentication

---

## 🔧 Required Fixes

### Priority 1: Immediate (Critical Security)

1. **Remove all hardcoded organization ID fallbacks**
   - Files: `ShopifyIntegration.jsx`, `BotBuilder.jsx`, all service files
   - Replace with proper error handling

2. **Add organization ID validation in ShopifyIntegration**
   ```javascript
   if (!user?.organizationId) {
     setErrorMessage('Authentication required. Please log out and log back in.');
     setIsConnecting(false);
     return;
   }
   ```

3. **Add loading state checks in components**
   - Wait for auth context to fully load
   - Show loading spinner during initialization
   - Validate `organizationId` exists before any API calls

### Priority 2: High (Data Integrity)

4. **Add organizationId to all database queries**
   - Review every `sql` query in `consolidated.js`
   - Ensure all SELECT/UPDATE/DELETE operations filter by `organization_id`

5. **Add organization ownership validation**
   - Before updating/deleting any resource, verify it belongs to the requesting organization

6. **Remove demo/fallback modes that bypass organization checks**
   - Services should fail gracefully with clear error messages
   - Don't serve fake data when organization context is missing

### Priority 3: Medium (Code Quality)

7. **Centralize organization ID access**
   - Create `useOrganizationId()` hook that handles loading state
   - Returns `{ organizationId, loading, error }`

8. **Add TypeScript or JSDoc validation**
   - Enforce `organizationId` as required parameter
   - Compile-time checks for missing tenant context

9. **Add integration tests**
   - Test multi-tenant isolation
   - Verify users can't access other organizations' data

---

## 🎯 Implementation Plan

### Phase 1: Critical Security Fixes (1-2 hours)
1. Remove hardcoded organization ID fallbacks
2. Add validation in ShopifyIntegration
3. Add auth loading checks in key components

### Phase 2: Data Integrity (2-3 hours)
4. Audit all database queries
5. Add organization ownership validation
6. Remove unsafe fallback modes

### Phase 3: Code Quality (3-4 hours)
7. Create `useOrganizationId()` hook
8. Add type checking
9. Write integration tests

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER LOGIN                            │
│  ┌────────────┐                                          │
│  │ Login Form │ → /api/auth/login                        │
│  └────────────┘                                          │
│         ↓                                                 │
│  Returns: { organizationId, token, user }                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              AUTH CONTEXT (React)                        │
│  ┌─────────────────────────────────────┐                │
│  │ AuthProvider                        │                │
│  │  - Stores: user.organizationId     │                │
│  │  - Exposes: useAuth() hook         │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         COMPONENT LAYER (Must validate)                  │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ BotBuilder       │  │ ShopifyIntegration│             │
│  │ ✅ Uses orgId    │  │ ⚠️ Has fallback   │             │
│  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          SERVICE LAYER (Requires orgId)                  │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ shopifyService   │  │ dbService         │             │
│  │ ✅ Validates     │  │ ✅ Scopes queries │             │
│  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          API LAYER (Enforces isolation)                  │
│  /api/consolidated.js                                    │
│   - All DB queries filter by organization_id             │
│   - OAuth state verifies organization                    │
│   - Integration credentials scoped to tenant             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          DATABASE (Neon PostgreSQL)                      │
│  ┌─────────────────────────────────────────┐            │
│  │ All tables have organization_id column  │            │
│  │ Foreign keys enforce boundaries         │            │
│  │ Indexes optimize tenant queries         │            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Recommendations

1. **Never trust client-supplied organization IDs** - Always derive from authenticated session
2. **Validate organization ownership** - Before any UPDATE/DELETE operation
3. **Use database constraints** - Foreign keys and row-level security
4. **Audit tenant isolation** - Regular security reviews of multi-tenant logic
5. **Monitor for anomalies** - Track cross-tenant access attempts
6. **Encrypt credentials** - Integration tokens stored with proper encryption
7. **Rate limit per tenant** - Prevent resource exhaustion attacks

---

## 📝 Testing Checklist

- [ ] User A cannot see User B's conversations
- [ ] User A cannot access User B's Shopify integration
- [ ] User A cannot modify User B's bot configuration
- [ ] OAuth flow correctly maps to initiating organization
- [ ] Token refresh maintains organization context
- [ ] API calls without organizationId are rejected
- [ ] Database queries filter by organization_id
- [ ] Integration webhooks route to correct tenant

---

## 🚀 Next Steps

1. **Review this audit with team**
2. **Prioritize critical security fixes**
3. **Create tickets for each fix**
4. **Implement fixes in priority order**
5. **Add automated tests for tenant isolation**
6. **Schedule regular security audits**

---

## Contact

For questions about this audit:
- Review project memory for context
- Check TENANT_ROUTING_ARCHITECTURE.docx for original design
- Reference API_Specification_SaaS_Chatbot_Platform.docx for specs

**Last Updated**: November 24, 2025
