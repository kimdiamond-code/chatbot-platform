# 📋 COMPLETE INTEGRATION SETUP TODO LIST

## 🎯 YOUR SITUATION:
- ❌ No registered business
- ❌ No accounts on integration platforms
- ✅ Building a SaaS platform for multiple customers

---

## 🚨 CRITICAL DECISION FIRST:

### **OPTION A: Test/Development Mode** (Recommended to start)
Set up basic OAuth apps for testing. Users can connect, but limited functionality.
- ⏱️ Time: 2-3 hours
- 💰 Cost: Free
- ⚠️ Limitations: Test mode only, limited users

### **OPTION B: Production Ready** (For real customers)
Full business setup, app reviews, production credentials.
- ⏱️ Time: 2-4 weeks (due to reviews)
- 💰 Cost: May require business registration
- ✅ Benefits: Full production access

**Recommended:** Start with Option A, upgrade to Option B later.

---

## 📝 OPTION A: TEST/DEVELOPMENT SETUP

---

### ☑️ **PHASE 1: IMMEDIATE - Deploy Current Code**

#### **Task 1.1: Run Database Migration**
```powershell
# Connect to your Neon database
psql "postgresql://neondb_owner:npg_oO90iBtIxymP@ep-super-snow-addw8m42-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Run the migration
\i sql/add_oauth_token_storage.sql

# Verify it worked
SELECT column_name FROM information_schema.columns WHERE table_name = 'integrations';

# Exit
\q
```
- [ ] Migration completed
- [ ] Verified columns: access_token, refresh_token, token_expires_at

---

#### **Task 1.2: Generate Encryption Key**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] Generated encryption key
- [ ] Saved key somewhere safe

---

#### **Task 1.3: Update Local .env**
Add to your `.env` file:
```env
TOKEN_ENCRYPTION_KEY=paste_your_generated_key_here
FRONTEND_URL=https://chatbot-platform-v2.vercel.app
SHOPIFY_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback
MESSENGER_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback
```
- [ ] Added TOKEN_ENCRYPTION_KEY
- [ ] Added FRONTEND_URL
- [ ] Added redirect URIs

---

#### **Task 1.4: Update Vercel Environment Variables**
```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

# Add new variables
vercel env add TOKEN_ENCRYPTION_KEY production
vercel env add FRONTEND_URL production
vercel env add SHOPIFY_REDIRECT_URI production
vercel env add MESSENGER_REDIRECT_URI production

# Remove old hardcoded credentials
vercel env rm VITE_SHOPIFY_STORE_NAME production
vercel env rm VITE_SHOPIFY_ACCESS_TOKEN production
vercel env rm VITE_KUSTOMER_API_KEY production
vercel env rm VITE_KUSTOMER_SUBDOMAIN production
vercel env rm VITE_MESSENGER_PAGE_ACCESS_TOKEN production
```
- [ ] Added new environment variables
- [ ] Removed old hardcoded credentials

---

#### **Task 1.5: Deploy OAuth Infrastructure**
```powershell
git add .
git commit -m "Multi-tenant OAuth infrastructure"
git push
vercel --prod
```
- [ ] Deployed successfully
- [ ] No errors in Vercel logs

---

### ☑️ **PHASE 2: SHOPIFY SETUP** (2 hours)

#### **Task 2.1: Create Shopify Partner Account** (Free)
**Link:** https://partners.shopify.com/signup

1. Go to link above
2. Click "Sign Up"
3. Fill in:
   - Email: your email
   - Password: create password
   - **You DON'T need a business name** - use your personal name
4. Verify email
5. Complete profile (can skip business details)

- [ ] Shopify Partner account created
- [ ] Email verified

---

#### **Task 2.2: Create Shopify Development Store** (Free test store)
**In Partner Dashboard:**

1. Click "Stores" → "Add store"
2. Select "Development store"
3. Fill in:
   - Store name: `agenstack-test` (or any name)
   - Purpose: Testing OAuth
   - Select "For building or testing apps"
4. Create store

- [ ] Development store created
- [ ] Can access: `agenstack-test.myshopify.com`

---

#### **Task 2.3: Create Shopify App**
**In Partner Dashboard:**

1. Click "Apps" → "Create app"
2. Select "Public app" (or "Custom app")
3. Fill in:
   - App name: `AgenStack Chatbot Platform`
   - App URL: `https://chatbot-platform-v2.vercel.app`
4. Create app

- [ ] App created
- [ ] Got Client ID (same as your current VITE_SHOPIFY_API_KEY)
- [ ] Got Client Secret (same as your current VITE_SHOPIFY_API_SECRET)

---

#### **Task 2.4: Configure Shopify App URLs**
**In your app settings:**

1. Find "App setup" or "URLs"
2. Set:
   - **Allowed redirection URL(s):** 
     ```
     https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback
     ```
3. Set API Scopes:
   - `read_products`
   - `read_orders`
   - `read_customers`
   - `read_inventory`
   - `read_locations`
   - `read_draft_orders`
4. Save

- [ ] Redirect URL configured
- [ ] API scopes set
- [ ] Saved changes

---

#### **Task 2.5: Test Shopify OAuth**
1. Go to your integrations page
2. Click "Connect Shopify"
3. Enter: `agenstack-test` (your dev store name)
4. Should redirect to Shopify authorization
5. Approve the app
6. Should redirect back with success

- [ ] OAuth flow works
- [ ] Token saved in database
- [ ] Integration shows "connected"

---

### ☑️ **PHASE 3: FACEBOOK MESSENGER SETUP** (1 hour)

**⚠️ IMPORTANT:** Your current app ID `722364090371811` already exists.
You already completed most of this! Just need to update settings.

#### **Task 3.1: Update Facebook App Settings**
**Link:** https://developers.facebook.com/apps/722364090371811/settings/basic/

1. Scroll to "App Domains"
2. Add: `chatbot-platform-v2.vercel.app`
3. Scroll to "Website"
4. Add: `https://chatbot-platform-v2.vercel.app`
5. Save

- [ ] App domains updated
- [ ] Website URL added

---

#### **Task 3.2: Add OAuth Redirect URI**
**In Messenger Settings:**

1. Go to: Products → Messenger → Settings
2. Scroll to "OAuth redirect URIs"
3. Add:
   ```
   https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback
   ```
4. Save

- [ ] OAuth redirect URI added

---

#### **Task 3.3: Test Messenger OAuth**
1. Go to your integrations page
2. Click "Connect Facebook Page"
3. Should redirect to Facebook login
4. Select your test page
5. Approve permissions
6. Should redirect back with success

- [ ] OAuth flow works
- [ ] Page token saved in database
- [ ] Integration shows "connected"

---

### ☑️ **PHASE 4: KLAVIYO SETUP** (30 minutes)

#### **Task 4.1: Create Klaviyo Account** (Free trial)
**Link:** https://www.klaviyo.com/sign-up

1. Click "Start free trial"
2. Fill in:
   - Email: your email
   - Password: create password
   - **Business name:** Can use your name or "Test Business"
3. Skip the questionnaire or fill minimally
4. Verify email

- [ ] Klaviyo account created
- [ ] Email verified

---

#### **Task 4.2: Get Klaviyo API Key**
**Link:** https://www.klaviyo.com/settings/account/api-keys

1. Go to Account → Settings → API Keys
2. Click "Create Private API Key"
3. Name: `AgenStack Platform`
4. Select "Full Access" (or minimum: Lists, Profiles, Events)
5. Copy the key (starts with `pk_`)

- [ ] API key generated
- [ ] Key saved somewhere safe

---

#### **Task 4.3: Add Klaviyo Key to Environment**
```powershell
# Update .env
# VITE_KLAVIYO_PRIVATE_API_KEY=pk_your_key_here

# Add to Vercel
vercel env add VITE_KLAVIYO_PRIVATE_API_KEY production
```

- [ ] Added to .env
- [ ] Added to Vercel
- [ ] Redeployed

---

#### **Task 4.4: Test Klaviyo**
1. Go to integrations page
2. Klaviyo should show "Admin Configured"
3. Users can use Klaviyo features

- [ ] Klaviyo shows as configured
- [ ] Can create test list in Klaviyo

---

### ☑️ **PHASE 5: KUSTOMER SETUP** (30 minutes)

#### **Task 5.1: Research Kustomer Access**
**Kustomer is enterprise-only** - requires sales contact.

**OPTIONS:**
- **A) Skip for now** - Most users won't have Kustomer
- **B) Use True Citrus credentials temporarily** - For demo purposes
- **C) Contact Kustomer sales** - For enterprise trial

**Recommended: Option A (Skip)**

- [ ] Decision made: Skip / Use True Citrus / Contact sales

---

### ☑️ **PHASE 6: UPDATE FRONTEND** (1-2 hours)

#### **Task 6.1: Update CentralizedIntegrations.jsx**

Add OAuth trigger buttons:

```jsx
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

- [ ] Added Shopify OAuth button
- [ ] Added Messenger OAuth button
- [ ] Tested both buttons work

---

#### **Task 6.2: Handle OAuth Callbacks**

Add success/error message handling:

```jsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('shopify') === 'connected') {
    setMessage({ type: 'success', text: 'Shopify connected successfully!' });
  } else if (params.get('messenger') === 'connected') {
    setMessage({ type: 'success', text: `Facebook Page "${params.get('page')}" connected!` });
  } else if (params.get('shopify') === 'error' || params.get('messenger') === 'error') {
    setMessage({ type: 'error', text: params.get('message') || 'Connection failed' });
  }
}, []);
```

- [ ] Added callback handling
- [ ] Success messages display
- [ ] Error messages display

---

### ☑️ **PHASE 7: TEST WITH REAL USERS** (1 hour)

#### **Task 7.1: Create Test Accounts**

Create 2-3 test organizations:
1. Test User 1 (True Citrus)
2. Test User 2 (Fake business)
3. Test User 3 (Another fake business)

- [ ] Created test account 1
- [ ] Created test account 2
- [ ] Created test account 3

---

#### **Task 7.2: Test Each Integration**

**For EACH test account:**

1. Sign in
2. Go to Integrations
3. Connect Shopify (create dev store for each)
4. Connect Messenger (create test page for each)
5. Verify tokens in database
6. Test chatbot uses correct credentials

- [ ] Test User 1: All integrations working
- [ ] Test User 2: All integrations working
- [ ] Test User 3: All integrations working
- [ ] Verified multi-tenancy works

---

## 📝 OPTION B: PRODUCTION SETUP (For Later)

**Only do this when you have real paying customers.**

### ☑️ **PHASE 8: BUSINESS REGISTRATION** (1-2 weeks)

#### **Task 8.1: Register Business**
- [ ] Choose business structure (LLC, etc.)
- [ ] Register with state
- [ ] Get EIN from IRS
- [ ] Open business bank account

---

#### **Task 8.2: Create Legal Documents**
- [ ] Privacy Policy (required for OAuth apps)
- [ ] Terms of Service
- [ ] Data Processing Agreement
- [ ] Host publicly on your website

**Tools:**
- **TermsFeed:** https://www.termsfeed.com/ (Free templates)
- **Termly:** https://termly.io/ (Paid, comprehensive)

---

### ☑️ **PHASE 9: FACEBOOK APP REVIEW** (1-2 weeks)

#### **Task 9.1: Submit for App Review**
**Requirements:**
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] App Icon (1024x1024)
- [ ] Screen recording showing OAuth flow
- [ ] Detailed use case explanation
- [ ] Test user credentials for reviewers

**Submit at:** https://developers.facebook.com/apps/722364090371811/app-review/

- [ ] All requirements met
- [ ] App submitted for review
- [ ] Approved (can take 1-2 weeks)
- [ ] Switched to "Live Mode"

---

### ☑️ **PHASE 10: SHOPIFY APP REVIEW** (1 week)

#### **Task 10.1: Submit Public App for Review**

**Requirements:**
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] Support contact
- [ ] App listing details
- [ ] Test instructions

**Submit in Partner Dashboard**

- [ ] App submitted
- [ ] Approved
- [ ] Listed in Shopify App Store (optional)

---

## 🎯 RECOMMENDED PATH:

### **Week 1: Start Testing**
- [ ] Complete Phase 1: Deploy OAuth infrastructure
- [ ] Complete Phase 2: Shopify setup (dev mode)
- [ ] Complete Phase 3: Messenger setup (test mode)

### **Week 2: Frontend & Testing**
- [ ] Complete Phase 4: Klaviyo
- [ ] Complete Phase 6: Update frontend
- [ ] Complete Phase 7: Test with multiple accounts

### **Week 3-4: First Real Customers**
- [ ] Get 1-2 beta customers
- [ ] Have them test OAuth flows
- [ ] Gather feedback
- [ ] Fix bugs

### **Month 2+: Production Ready**
- [ ] Register business (if needed)
- [ ] Create legal documents
- [ ] Submit apps for review
- [ ] Go live!

---

## 💡 KEY NOTES:

### **You DON'T need for testing:**
- ❌ Registered business
- ❌ App reviews/approvals
- ❌ Production credentials
- ❌ Legal documents

### **You DO need for testing:**
- ✅ Personal email accounts
- ✅ Free developer accounts
- ✅ Development/test stores
- ✅ Test Facebook pages

### **You WILL need for production:**
- ⚠️ Business registration (maybe)
- ⚠️ Privacy Policy & Terms
- ⚠️ App reviews
- ⚠️ Production credentials

---

## 🚀 START HERE:

**Right now, do these 5 things:**

1. ✅ Run database migration
2. ✅ Generate encryption key
3. ✅ Update environment variables
4. ✅ Deploy OAuth code
5. ✅ Create Shopify Partner account

**Then test with your own accounts before getting customers!**

---

## ⏱️ TIME ESTIMATES:

- **Phase 1 (Deploy):** 30 minutes
- **Phase 2 (Shopify):** 2 hours
- **Phase 3 (Messenger):** 1 hour (mostly done)
- **Phase 4 (Klaviyo):** 30 minutes
- **Phase 6 (Frontend):** 2 hours
- **Phase 7 (Testing):** 1 hour

**Total: ~7 hours to get working test environment**

---

**Ready to start? Begin with Phase 1! 🚀**
