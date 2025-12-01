# OAuth Integration Flow - Complete Setup

## Overview
All integrations now use proper OAuth flows where users simply click "Connect" and authenticate through the provider's login page. No manual API key entry required.

## What Changed

### 1. **Fixed OAuth Redirect URLs**
- **Old**: Frontend was trying to use `/api/consolidated?endpoint=shopify-oauth-redirect`
- **New**: Correct OAuth endpoints at `/api/oauth/{provider}/redirect` and `/api/oauth/{provider}/callback`

### 2. **OAuth-Enabled Integrations**
All integrations now use OAuth:

#### Shopify
- User clicks "Connect" → prompted for store name
- Redirects to Shopify OAuth → user approves permissions
- Callback stores encrypted tokens in database
- **Endpoint**: `/api/oauth/shopify/redirect?organization_id=X&shop=mystore`

#### Facebook Messenger
- User clicks "Connect" → redirects immediately to Facebook
- User selects which Facebook Page to connect
- Callback stores page access token (long-lived)
- Automatically subscribes webhook
- **Endpoint**: `/api/oauth/messenger/redirect?organization_id=X`

#### Klaviyo (NEW)
- User clicks "Connect" → redirects to Klaviyo
- User approves permissions for their Klaviyo account
- Callback retrieves account info and stores tokens
- **Endpoint**: `/api/oauth/klaviyo/redirect?organization_id=X`

#### Kustomer (NEW)
- User clicks "Connect" → prompted for subdomain
- Redirects to Kustomer OAuth → user approves
- Callback stores tokens with subdomain info
- **Endpoint**: `/api/oauth/kustomer/redirect?organization_id=X&subdomain=mycompany`

### 3. **New API Files Created**
- `api/klaviyo-oauth.js` - Klaviyo OAuth handler
- `api/kustomer-oauth.js` - Kustomer OAuth handler

### 4. **Updated Files**
- `vercel.json` - Added OAuth routing for Klaviyo and Kustomer
- `src/components/CentralizedIntegrations.jsx` - Fixed OAuth redirect URLs, added callbacks for all providers

## How It Works

### User Flow
1. User goes to Integrations page
2. Clicks "Connect" on any provider
3. (For Shopify/Kustomer: enters store name/subdomain)
4. Redirected to provider's OAuth page
5. Approves permissions
6. Redirected back to platform
7. Success message shown, integration marked as "Connected"

### Technical Flow
```
Frontend (User clicks Connect)
  ↓
  Redirects to: /api/oauth/{provider}/redirect?organization_id=xxx
  ↓
OAuth Handler (Builds auth URL with state)
  ↓
  Redirects to: {provider}.com/oauth/authorize
  ↓
User approves on provider's site
  ↓
  Redirects to: /api/oauth/{provider}/callback?code=xxx&state=xxx
  ↓
OAuth Handler (Exchanges code for tokens)
  ↓
  Encrypts tokens using tokenEncryptionService
  ↓
  Stores in database: integrations table
  ↓
  Redirects to: /dashboard/integrations?{provider}=connected
  ↓
Frontend shows success message
```

### Database Storage
All tokens are stored in the `integrations` table:
```sql
{
  organization_id: UUID,
  provider: 'shopify' | 'messenger' | 'klaviyo' | 'kustomer',
  access_token: 'ENCRYPTED',
  refresh_token: 'ENCRYPTED',
  account_identifier: { storeName, pageId, companyId, subdomain, etc },
  token_scope: 'permissions',
  status: 'connected',
  connected_at: TIMESTAMP
}
```

## Multi-Tenant Isolation

### Critical Security Features
✅ Every OAuth flow requires `organization_id` parameter
✅ State parameter includes `organization_id` to prevent CSRF
✅ Tokens are scoped per organization in database
✅ No fallback organization IDs anywhere
✅ All database queries filter by organization_id

### State Token Structure
```javascript
{
  organization_id: "uuid-here",
  timestamp: Date.now(),
  random: crypto.randomBytes(16).toString('hex'),
  // Provider-specific data (e.g., subdomain for Kustomer)
}
```

## Environment Variables Required

Add these to Vercel environment variables:

### Shopify
```
VITE_SHOPIFY_API_KEY=your_client_id
VITE_SHOPIFY_API_SECRET=your_client_secret
SHOPIFY_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback
```

### Messenger
```
VITE_MESSENGER_APP_ID=your_app_id
VITE_MESSENGER_APP_SECRET=your_app_secret
MESSENGER_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback
VITE_MESSENGER_VERIFY_TOKEN=your_webhook_verify_token
```

### Klaviyo
```
VITE_KLAVIYO_API_KEY=your_client_id
VITE_KLAVIYO_API_SECRET=your_client_secret
KLAVIYO_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/klaviyo/callback
```

### Kustomer
```
VITE_KUSTOMER_CLIENT_ID=your_client_id
VITE_KUSTOMER_CLIENT_SECRET=your_client_secret
KUSTOMER_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/kustomer/callback
```

### General
```
FRONTEND_URL=https://chatbot-platform-v2.vercel.app
TOKEN_ENCRYPTION_KEY=your_32_character_encryption_key
```

## Provider OAuth Setup

### Shopify
1. Go to Shopify Partner Dashboard
2. Create a custom app
3. Set redirect URL: `https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback`
4. Request scopes: `read_products,read_orders,read_customers,read_inventory,read_locations,read_draft_orders`
5. Copy Client ID and Secret

### Facebook Messenger
1. Go to Facebook Developers
2. Create an app → Messenger product
3. Add redirect URL: `https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback`
4. Request permissions: `pages_messaging,pages_manage_metadata,pages_read_engagement`
5. Copy App ID and Secret

### Klaviyo
1. Go to Klaviyo account settings
2. Navigate to API Keys → OAuth
3. Create OAuth app
4. Set redirect URL: `https://chatbot-platform-v2.vercel.app/api/oauth/klaviyo/callback`
5. Request scopes: `lists:read,lists:write,profiles:read,profiles:write,metrics:read,events:write`

### Kustomer
1. Go to Kustomer Settings → API Keys
2. Create OAuth app
3. Set redirect URL: `https://chatbot-platform-v2.vercel.app/api/oauth/kustomer/callback`
4. Request scopes: `org.user.read,org.permission.customer.read,org.permission.customer.write`

## Testing OAuth Flows

### Test Shopify
1. Go to Integrations page
2. Click "Connect" on Shopify card
3. Enter store name (e.g., "truecitrus2")
4. Approve on Shopify page
5. Should redirect back with success message

### Test Messenger
1. Go to Integrations page
2. Click "Connect" on Facebook Messenger
3. Login to Facebook and select a Page
4. Approve permissions
5. Should redirect back with success message showing page name

### Test Klaviyo
1. Go to Integrations page
2. Click "Connect" on Klaviyo
3. Login to Klaviyo account
4. Approve permissions
5. Should redirect back with success message

### Test Kustomer
1. Go to Integrations page
2. Click "Connect" on Kustomer
3. Enter subdomain (e.g., "mycompany")
4. Login and approve
5. Should redirect back with success message

## Deployment Commands

```bash
# Commit changes
git add .
git commit -m "Complete OAuth integration setup for all providers"

# Push to trigger deployment
git push origin main
```

## Verification Checklist

After deployment:
- [ ] Shopify OAuth redirects correctly
- [ ] Messenger OAuth redirects correctly
- [ ] Klaviyo OAuth redirects correctly
- [ ] Kustomer OAuth redirects correctly
- [ ] Tokens are encrypted in database
- [ ] Organization ID is required for all flows
- [ ] Success messages appear after connection
- [ ] Integration status updates to "Connected"
- [ ] Test connection buttons work
- [ ] Disconnect functionality works

## Notes

- All OAuth providers now work the same way: click → authenticate → done
- No manual API key entry required (except for WhatsApp/Twilio which doesn't use OAuth)
- Tokens are automatically refreshed when needed (for providers that support it)
- All sensitive credentials are encrypted using AES-256
- State parameters prevent CSRF attacks
- Organization ID is embedded in state to ensure proper tenant routing
