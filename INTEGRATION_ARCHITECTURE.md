# CENTRALIZED INTEGRATION ARCHITECTURE

## Overview
This platform uses a centralized integration model where:
- **Admin** configures API keys/credentials once in environment variables
- **Users** only provide their account-specific information (store name, subdomain, etc.)
- Backend handles all API calls using admin credentials on behalf of users

---

## Integration Model

### Current Setup Issues
- ❌ Each user stores their own API keys (security risk)
- ❌ OAuth flows require per-user token management
- ❌ Complex user onboarding

### New Centralized Setup
- ✅ Single admin API key for each service
- ✅ Users provide only account identifiers
- ✅ Backend proxies all requests
- ✅ Simple user onboarding

---

## Integration List & Required Admin Credentials

### 1. **SHOPIFY** (E-commerce)

**Admin Setup Required:**
```env
SHOPIFY_ADMIN_API_KEY=your_admin_api_key
SHOPIFY_ADMIN_API_SECRET=your_admin_secret
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_access_token
```

**User Provides:**
- Store Name (e.g., `mystore` from `mystore.myshopify.com`)

**How to Obtain Admin Credentials:**
1. Go to Shopify Partner Dashboard: https://partners.shopify.com/
2. Create a Partner Account (free)
3. Create a new "Custom App" or "Public App"
4. Select required scopes:
   - `read_products, write_products`
   - `read_orders, write_orders`
   - `read_customers, write_customers`
   - `read_inventory, write_inventory`
   - `read_locations`
   - `read_draft_orders, write_draft_orders`
5. Install app and retrieve:
   - API Key
   - API Secret
   - Admin API Access Token

**Features:**
- Product lookup
- Order tracking
- Customer information
- Inventory checks
- Draft orders
- Add to cart links

---

### 2. **KLAVIYO** (Email Marketing)

**Admin Setup Required:**
```env
KLAVIYO_PRIVATE_API_KEY=your_private_api_key
```

**User Provides:**
- Company ID (found in Klaviyo account settings)

**How to Obtain Admin Credentials:**
1. Log in to Klaviyo: https://www.klaviyo.com/
2. Go to Account → Settings → API Keys
3. Create a "Private API Key"
4. Select required scopes:
   - `Lists:Read`
   - `Lists:Write`
   - `Profiles:Read`
   - `Profiles:Write`
   - `Campaigns:Read`
   - `Flows:Read`
5. Copy the Private Key

**Features:**
- Subscribe to lists
- Trigger flows
- Customer profile sync
- Campaign tracking
- Segment management

---

### 3. **KUSTOMER** (Customer Service CRM)

**Admin Setup Required:**
```env
KUSTOMER_API_KEY=your_api_key
```

**User Provides:**
- Organization Subdomain (e.g., `mycompany` from `mycompany.kustomerapp.com`)

**How to Obtain Admin Credentials:**
1. Log in to Kustomer: https://app.kustomer.com/
2. Go to Settings → API Keys
3. Create a new API Key
4. Select permissions:
   - `org.user.customer.read`
   - `org.user.customer.write`
   - `org.user.conversation.read`
   - `org.user.conversation.write`
   - `org.admin.message.write`
5. Copy the API Key (starts with `eyJhbG...`)

**Features:**
- Create conversations
- Add customer notes
- View conversation history
- Ticket creation
- Customer lookup

---

### 4. **FACEBOOK MESSENGER** (Messaging)

**Admin Setup Required:**
```env
MESSENGER_APP_ID=your_facebook_app_id
MESSENGER_APP_SECRET=your_facebook_app_secret
MESSENGER_PAGE_ACCESS_TOKEN=your_page_access_token
MESSENGER_VERIFY_TOKEN=your_custom_verify_token_for_webhooks
```

**User Provides:**
- Page ID (Facebook Page they want to connect)

**How to Obtain Admin Credentials:**
1. Go to Facebook Developers: https://developers.facebook.com/
2. Create a new App (choose "Business" type)
3. Add "Messenger" product
4. Generate Page Access Token:
   - Select the Facebook Page
   - Copy the Page Access Token (never expires recommended)
5. Set up webhook:
   - Callback URL: `https://yourdomain.com/api/webhooks/messenger`
   - Verify Token: Create a random string (save to env)
6. Subscribe to webhook events:
   - `messages`
   - `messaging_postbacks`
   - `message_reads`

**Features:**
- Send/receive messages
- Rich media (images, buttons)
- Quick replies
- Postback handling
- Read receipts

---

### 5. **OPENAI** (AI Responses)

**Admin Setup Required:**
```env
VITE_OPENAI_API_KEY=sk-proj-...
VITE_OPENAI_ORG_ID=org-...
```

**User Provides:**
- Nothing (uses admin AI for all users)

**How to Obtain:**
1. Go to: https://platform.openai.com/api-keys
2. Create new API key
3. Copy Organization ID from settings

**Usage:**
- Already configured ✅
- Used for all AI responses across platform

---

### 6. **WHATSAPP** (via Twilio)

**Admin Setup Required:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**User Provides:**
- Business WhatsApp Number (if they have one approved)

**How to Obtain Admin Credentials:**
1. Sign up at: https://www.twilio.com/
2. Go to Console Dashboard
3. Copy Account SID and Auth Token
4. Go to Messaging → Try it Out → Send a WhatsApp Message
5. For production: Apply for WhatsApp Business API access

**Features:**
- Send/receive WhatsApp messages
- Media support
- Template messages
- Business verification

---

### 7. **STRIPE** (Payments - Optional)

**Admin Setup Required:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**User Provides:**
- Nothing (platform handles billing)

**How to Obtain:**
1. Sign up at: https://stripe.com/
2. Go to Developers → API Keys
3. Copy Secret and Publishable keys
4. Set up webhook endpoint for subscription events

**Usage:**
- Platform subscription billing
- Usage-based pricing
- Payment processing

---

## Database Schema Changes

### New `integrations` Table

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'shopify', 'klaviyo', 'kustomer', 'messenger'
  status VARCHAR(20) DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
  
  -- User-provided account identifiers (NOT API keys)
  account_identifier JSONB, -- Store-specific data like storeName, subdomain, pageId
  
  -- Metadata
  connected_at TIMESTAMP,
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(50),
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, provider)
);
```

### Example Data

```json
{
  "provider": "shopify",
  "organization_id": "org-123",
  "status": "connected",
  "account_identifier": {
    "storeName": "mystore"
  }
}

{
  "provider": "klaviyo",
  "organization_id": "org-123",
  "status": "connected",
  "account_identifier": {
    "companyId": "ABC123"
  }
}

{
  "provider": "kustomer",
  "organization_id": "org-123",
  "status": "connected",
  "account_identifier": {
    "subdomain": "mycompany"
  }
}
```

---

## Implementation Steps

### Phase 1: Backend Service Layer
1. Create centralized integration service
2. Implement connection management
3. Add proxy endpoints for each provider

### Phase 2: Frontend UI
1. Integration management page
2. Simple connection forms (just account identifiers)
3. Status indicators
4. Test connection buttons

### Phase 3: API Consolidation
1. Add integration endpoints to consolidated API
2. Implement provider-specific logic
3. Add error handling and retries

### Phase 4: Migration
1. Remove OAuth flows
2. Remove user token storage
3. Update all service calls to use new architecture

---

## Security Considerations

1. **Admin credentials** stored in Vercel env variables (encrypted)
2. **Rate limiting** per organization to prevent abuse
3. **Request validation** to ensure users only access their own data
4. **Audit logging** for all integration actions
5. **Scope limitation** - minimal permissions for each integration

---

## Benefits

✅ **Simplified Onboarding** - Users enter 1 field instead of OAuth flow
✅ **Better Security** - One set of credentials to manage
✅ **Easier Support** - Admin can troubleshoot integration issues
✅ **Cost Effective** - Single API keys often have higher rate limits
✅ **Faster Setup** - No OAuth callbacks, no token refresh logic

---

## Next Steps

1. **Review this document** - Confirm architecture approach
2. **Obtain API credentials** - Get all admin keys from each provider
3. **Update environment variables** - Add to Vercel
4. **Implement backend services** - Create integration proxy layer
5. **Build frontend UI** - Simple connection management
6. **Test each integration** - Verify with test accounts
7. **Deploy to production** - Roll out new architecture
