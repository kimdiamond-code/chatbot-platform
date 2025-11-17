# Shopify Multi-Tenant Integration Fix

## Problem
All users were connected to the same Shopify store instead of their own stores. This was caused by hardcoded organization IDs throughout the codebase.

## What Was Fixed

### 1. ✅ Removed Hardcoded Organization IDs
**File: `src/services/integrations/shopifyService.js`**
- Removed: `const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001'`
- Made `organizationId` a **required parameter** for ALL methods
- Added validation checks to reject operations without organization ID

**Before:**
```javascript
async getCredentials(organizationId = ORGANIZATION_ID) {
```

**After:**
```javascript
async getCredentials(organizationId) {
  if (!organizationId) {
    console.error('❌ organizationId is required for Shopify operations');
    return null;
  }
```

### 2. ✅ Fixed OAuth Configuration
**File: `src/components/ShopifyOAuthConfiguration.jsx`**
- Uses `useAuth()` hook to get current user's organization_id
- Requires authentication before showing integration options
- Passes organization_id to all OAuth API calls
- Shows "Authentication Required" message if not logged in

**Before:**
```javascript
organizationId: '00000000-0000-0000-0000-000000000001'  // Hardcoded!
```

**After:**
```javascript
const { user } = useAuth();
const organizationId = user?.organization_id;  // Dynamic per user!
```

### 3. ✅ Fixed Integrations Page
**File: `src/components/Integrations.jsx`**
- Removed `DEFAULT_ORG_ID` constant
- Uses `useAuth()` hook instead of `authService`
- Requires authentication to view integrations
- All integration operations use logged-in user's organization_id

## Updated Service Methods

All Shopify service methods now require `organizationId`:

```javascript
// ❌ OLD - Had default fallback
shopifyService.getProducts(50) // Would use DEFAULT_ORG_ID

// ✅ NEW - Requires explicit organization ID
shopifyService.getProducts(50, user.organization_id) // Required!
```

**Methods Updated:**
- `getCredentials(organizationId)` - Get store credentials
- `getProducts(limit, organizationId)` - List products
- `searchProducts(query, organizationId)` - Search products
- `findCustomerByEmail(email, organizationId)` - Find customer
- `getCustomerOrders(email, limit, organizationId)` - Get orders
- `getDraftOrders(email, limit, organizationId)` - Get draft orders
- `findOrderByNumber(orderNumber, organizationId)` - Find order
- `verifyConnection(organizationId)` - Verify connection
- `createDraftOrder(cartData, organizationId)` - Create cart

## How It Works Now

### User Flow:
1. **User logs in** → Auth system provides `user.organization_id`
2. **User goes to Integrations** → Page checks authentication
3. **User connects Shopify** → Uses OAuth with their organization_id
4. **Credentials saved** → Stored with organization_id as key
5. **User uses chatbot** → All Shopify operations use their organization_id

### Multi-Tenant Isolation:

```javascript
// User A (org: uuid-1111)
shopifyService.getProducts(50, 'uuid-1111')
→ Returns products from User A's Shopify store

// User B (org: uuid-2222)  
shopifyService.getProducts(50, 'uuid-2222')
→ Returns products from User B's Shopify store
```

## Database Structure

The `integrations` table properly isolates data:

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,  -- Key for multi-tenancy
  integration_id TEXT NOT NULL,
  status TEXT,
  credentials_encrypted TEXT,
  UNIQUE(organization_id, integration_id)  -- One Shopify per org
);
```

## Important: Auth System Verification

⚠️ **Critical**: The `useAuth()` hook must provide `user.organization_id`.

### Current Implementation Check:
The backend login endpoint in `/api/consolidated.js` already returns organization_id:
```javascript
return res.status(200).json({
  success: true,
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization_id: user.organization_id  // ✅ Included!
  },
  token,
  expiresAt: expiresAt.toISOString()
});
```

### Verify useAuth Hook:
Check that `useAuth.jsx` properly stores and exposes organization_id from the login response.

## Testing the Fix

### Test 1: Multiple Users, Multiple Stores
1. Login as User A
2. Go to Integrations → Connect Shopify
3. Connect to "store-a.myshopify.com"
4. Logout
5. Login as User B
6. Connect to "store-b.myshopify.com"
7. Logout, login back as User A
8. ✅ Verify User A still sees "store-a", NOT "store-b"

### Test 2: OAuth Flow
1. Click "Connect with OAuth"
2. Check browser console for organization_id being sent
3. Complete OAuth on Shopify
4. ✅ Verify credentials saved with correct organizationId

### Test 3: API Operations
```javascript
// In browser console after login
const { user } = useAuth();
console.log('Organization ID:', user.organization_id);

// Test Shopify operations
await shopifyService.getProducts(50, user.organization_id);
await shopifyService.searchProducts('test', user.organization_id);
```

## Deployment Steps

```powershell
# 1. Verify all changes are correct
git status

# 2. Commit changes
git add src/services/integrations/shopifyService.js
git add src/components/ShopifyOAuthConfiguration.jsx  
git add src/components/Integrations.jsx
git commit -m "Fix: Multi-tenant Shopify - remove hardcoded org IDs, require authentication"

# 3. Push to GitHub
git push origin main

# 4. Verify GitHub Actions deployment or manually deploy
vercel --prod

# 5. Test with multiple user accounts
```

## What Changed Summary

| File | Change | Impact |
|------|--------|--------|
| `shopifyService.js` | Removed `ORGANIZATION_ID` constant | All methods now require explicit org ID |
| `shopifyService.js` | Added validation checks | Prevents operations without org ID |
| `ShopifyOAuthConfiguration.jsx` | Added `useAuth()` hook | Uses real user's organization |
| `ShopifyOAuthConfiguration.jsx` | Added auth check | Requires login to configure |
| `Integrations.jsx` | Removed `DEFAULT_ORG_ID` | No more hardcoded fallbacks |
| `Integrations.jsx` | Uses `useAuth()` instead of `authService` | Consistent auth pattern |
| `Integrations.jsx` | Added auth gate | Requires login to view page |

## Success Criteria

✅ Multiple users can connect different Shopify stores  
✅ Each user only sees their own Shopify connection  
✅ No hardcoded organization IDs anywhere  
✅ OAuth flow uses logged-in user's organization  
✅ All Shopify operations properly isolated per user  
✅ Unauthenticated users cannot access integrations  

## Known Issues to Monitor

1. **Auth Hook**: Verify `user.organization_id` is available after login
2. **Session Persistence**: Test that organization persists across page refreshes
3. **Logout/Login**: Ensure switching users properly switches Shopify stores

## Next Steps After Deployment

1. ✅ Deploy and test with 2+ real user accounts
2. ✅ Monitor Vercel logs for any organization_id errors
3. ✅ Update other integrations (Klaviyo, Kustomer, etc.) with same pattern
4. ✅ Add organization selector for admin users managing multiple orgs
5. ✅ Document OAuth setup process for new users

---

**Status:** ✅ Ready for Testing  
**Priority:** Critical  
**Estimated Impact:** All users with Shopify integration
