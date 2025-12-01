# 🚀 MULTI-TENANT REFACTOR - DEPLOYMENT GUIDE

## ✅ **WHAT'S BEEN BUILT:**

### **1. OAuth Infrastructure**
- ✅ Shopify OAuth flow (`api/shopify-oauth.js`)
- ✅ Messenger OAuth flow (`api/messenger-oauth.js`)
- ✅ Token encryption service (`api/tokenEncryptionService.js`)
- ✅ Database schema for token storage (`sql/add_oauth_token_storage.sql`)

### **2. Hardcoded Credentials Removed**
- ✅ Removed True Citrus Shopify token
- ✅ Removed True Citrus Kustomer credentials
- ✅ Removed YOUR Messenger page token
- ✅ Kept only OAuth app credentials

### **3. Routing Updated**
- ✅ Added `/api/oauth/shopify/*` routes
- ✅ Added `/api/oauth/messenger/*` routes

---

## 📋 **DEPLOYMENT STEPS:**

### **Step 1: Run Database Migration**

```powershell
# Connect to Neon
psql "postgresql://neondb_owner:npg_oO90iBtIxymP@ep-super-snow-addw8m42-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Run migration
\i sql/add_oauth_token_storage.sql
\q
```

---

### **Step 2: Generate Encryption Key**

```powershell
# Generate a random 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to `.env`:
```env
TOKEN_ENCRYPTION_KEY=paste_your_generated_key_here
```

---

### **Step 3: Update Environment Variables in Vercel**

```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

# Add new environment variables
vercel env add TOKEN_ENCRYPTION_KEY production
# Paste your generated encryption key

vercel env add FRONTEND_URL production
# Type: https://chatbot-platform-v2.vercel.app

vercel env add SHOPIFY_REDIRECT_URI production
# Type: https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback

vercel env add MESSENGER_REDIRECT_URI production
# Type: https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback

# Remove old hardcoded credentials
vercel env rm VITE_SHOPIFY_STORE_NAME production
vercel env rm VITE_SHOPIFY_ACCESS_TOKEN production
vercel env rm VITE_KUSTOMER_SUBDOMAIN production
vercel env rm VITE_KUSTOMER_API_KEY production
vercel env rm VITE_MESSENGER_PAGE_ACCESS_TOKEN production
```

---

### **Step 4: Deploy**

```powershell
git add .
git commit -m "Refactor to multi-tenant OAuth architecture - remove hardcoded credentials"
git push
vercel --prod
```

---

## 🧪 **TESTING THE OAUTH FLOWS:**

### **Test Shopify OAuth:**

1. User goes to integrations page
2. Clicks "Connect Shopify"
3. Frontend redirects to:
   ```
   https://chatbot-platform-v2.vercel.app/api/oauth/shopify/redirect?organization_id=USER_ORG_ID&shop=their-store-name
   ```
4. User authorizes on Shopify
5. Redirected back with token saved
6. Success! User's Shopify connected

### **Test Messenger OAuth:**

1. User clicks "Connect Facebook Page"
2. Frontend redirects to:
   ```
   https://chatbot-platform-v2.vercel.app/api/oauth/messenger/redirect?organization_id=USER_ORG_ID
   ```
3. User logs into Facebook
4. Selects their page
5. Redirected back with token saved
6. Success! User's page connected

---

## 🎯 **WHAT HAPPENS TO TRUE CITRUS:**

### **Old Way (Hardcoded):**
- True Citrus credentials in environment variables
- Everyone used True Citrus Shopify/Kustomer
- Single Messenger page for everyone

### **New Way (Multi-Tenant):**
1. True Citrus creates an account
2. Gets their own organization_id
3. Clicks "Connect Shopify" → Goes through OAuth
4. Clicks "Connect Messenger" → Goes through OAuth
5. Clicks "Connect Kustomer" → Goes through OAuth
6. Their tokens stored in database
7. **They're just another user!** ✅

---

## 🔧 **NEXT STEPS - WHAT STILL NEEDS TO BE DONE:**

### **1. Update Frontend Components**

Create OAuth trigger buttons in the Integrations page:

```jsx
// In CentralizedIntegrations.jsx
const handleConnectShopify = () => {
  const shopName = prompt("Enter your Shopify store name (e.g., mystore):");
  if (shopName) {
    window.location.href = 
      `/api/oauth/shopify/redirect?organization_id=${organizationId}&shop=${shopName}`;
  }
};

const handleConnectMessenger = () => {
  window.location.href = 
    `/api/oauth/messenger/redirect?organization_id=${organizationId}`;
};
```

### **2. Update Integration Services**

Modify services to load tokens from database:

```javascript
// Instead of: const token = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
// Use: const token = await getOrgToken(organizationId, 'shopify');

async function getOrgToken(organizationId, provider) {
  const integration = await fetch('/api/consolidated', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: 'integrations',
      action: 'getIntegration',
      organization_id: organizationId,
      provider: provider
    })
  });
  
  const data = await integration.json();
  return data.integration?.access_token; // Already decrypted by backend
}
```

### **3. Update Webhook Routing**

Modify webhooks to route by organization:

```javascript
// Messenger webhook - identify org by page_id
const pageId = webhookEvent.recipient.id;
const org = await findOrgByPageId(pageId);

// Shopify webhook - identify org by shop domain
const shop = webhookHeaders['x-shopify-shop-domain'];
const org = await findOrgByShop(shop);
```

### **4. Kustomer OAuth** (TODO)

Kustomer doesn't have public OAuth - need to implement API key entry or check if they support OAuth.

---

## 📊 **ARCHITECTURE COMPARISON:**

### **BEFORE (Single Tenant):**
```
Environment Variables
├── SHOPIFY_ACCESS_TOKEN (True Citrus only)
├── KUSTOMER_API_KEY (True Citrus only)
└── MESSENGER_PAGE_TOKEN (Your page only)

All users → Use same tokens → ❌ WRONG!
```

### **AFTER (Multi-Tenant):**
```
Environment Variables
├── SHOPIFY_CLIENT_ID (OAuth app)
├── SHOPIFY_CLIENT_SECRET (OAuth app)
├── MESSENGER_APP_ID (OAuth app)
└── MESSENGER_APP_SECRET (OAuth app)

Database (per organization)
├── Org 1 → Shopify Token (encrypted)
├── Org 1 → Messenger Token (encrypted)
├── Org 2 → Shopify Token (encrypted)
├── Org 2 → Messenger Token (encrypted)
└── ... → ✅ CORRECT!
```

---

## ⚠️ **IMPORTANT NOTES:**

1. **Breaking Change:** Existing connections will break temporarily
2. **Migration Required:** True Citrus needs to reconnect via OAuth
3. **Security:** Tokens are encrypted in database
4. **Facebook Review:** Messenger OAuth requires app review for production
5. **Shopify Partner:** Need Shopify Partner account for OAuth

---

## 🎉 **SUCCESS CRITERIA:**

You'll know it's working when:
- ✅ Multiple users can connect their own Shopify stores
- ✅ Multiple users can connect their own Facebook Pages
- ✅ Each user sees only their own integration data
- ✅ Webhooks route to correct organization
- ✅ True Citrus is just another user (no hardcoding)

---

**Ready to deploy? Run the commands above!** 🚀
