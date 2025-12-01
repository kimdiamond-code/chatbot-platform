# 🚀 QUICK SETUP GUIDE - Centralized Integrations

## ✅ What's Been Set Up

### Backend Infrastructure
1. **Integration Service Layer** - `src/services/integrations/integrationService.js`
   - Centralized credential management
   - Provider configuration checking
   - Request building for all providers

2. **Provider-Specific Services**
   - `centralizedShopifyService.js` - E-commerce operations
   - `centralizedKlaviyoService.js` - Email marketing
   - `centralizedKustomerService.js` - Customer service CRM
   - `centralizedMessengerService.js` - Facebook Messenger

3. **Database Schema** - `sql/create_integrations_table.sql`
   - Ready to migrate
   - Stores only account identifiers (NOT API keys)

4. **API Endpoints** - Added to `api/consolidated.js`
   - Get integrations
   - Save/update integration
   - Test connection
   - Disconnect/delete

---

## 📋 NEXT STEPS FOR YOU

### 1. Run Database Migration

```powershell
# Connect to your Neon database and run:
psql "postgresql://neondb_owner:npg_oO90iBtIxymP@ep-super-snow-addw8m42-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" -f sql/create_integrations_table.sql
```

### 2. Get Missing API Credentials

**You need to obtain:**

#### 🔴 **KLAVIYO** - 5 minutes
📎 **Link:** https://www.klaviyo.com/settings/account/api-keys

Steps:
1. Log in to your Klaviyo account
2. Click your profile → Account → Settings → API Keys
3. Click "Create Private API Key"
4. Name it: "AgenStack Platform"
5. Select scopes: Full Access (or minimum: Lists, Profiles, Events)
6. Copy the key (starts with `pk_`)

Add to `.env`:
```env
VITE_KLAVIYO_PRIVATE_API_KEY=pk_your_key_here
```

---

#### 🔴 **FACEBOOK MESSENGER** - 30 minutes
📎 **Link:** https://developers.facebook.com/apps/

Steps:
1. Go to https://developers.facebook.com/
2. Create Facebook Developers account
3. Create New App → Business Type
4. Add "Messenger" product
5. Go to Messenger → Settings
6. Generate Page Access Token:
   - Select your Facebook Page
   - Grant permissions
   - Copy token (starts with `EAAG...`)
7. Set up Webhook:
   - Callback URL: `https://chatbot-platform-v2.vercel.app/api/webhooks/messenger`
   - Verify Token: Create your own (e.g., `my_secure_token_123`)
   - Subscribe to: messages, messaging_postbacks
8. Copy App ID and App Secret from Settings → Basic

Add to `.env`:
```env
VITE_MESSENGER_APP_ID=your_app_id
VITE_MESSENGER_APP_SECRET=your_app_secret
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAG...
VITE_MESSENGER_VERIFY_TOKEN=my_secure_token_123
```

---

#### 🔴 **WHATSAPP (TWILIO)** - 15 minutes
📎 **Link:** https://www.twilio.com/try-twilio

Steps:
1. Sign up at https://www.twilio.com/
2. Verify your email and phone
3. Go to Console Dashboard
4. Copy Account SID and Auth Token
5. For testing: Go to Messaging → Try it out → Send a WhatsApp Message
6. Use sandbox number: `+1 415 523 8886`

Add to `.env`:
```env
VITE_TWILIO_ACCOUNT_SID=AC...
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

For production WhatsApp: Apply for WhatsApp Business API (takes 1-2 weeks)

---

#### 🟡 **STRIPE (OPTIONAL)** - 15 minutes
📎 **Link:** https://dashboard.stripe.com/test/apikeys

Steps:
1. Sign up at https://stripe.com/
2. Go to Developers → API Keys
3. Start with TEST keys (sk_test_... and pk_test_...)
4. Copy Secret Key and Publishable Key
5. Set up webhook later for subscriptions

Add to `.env`:
```env
VITE_STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

### 3. Update Environment Variables

After obtaining keys, update both files:

#### Local (`.env`):
```env
# Existing (Already configured ✅)
VITE_SHOPIFY_ADMIN_API_KEY=1209816bfe4d73b67e9d90c19dc984d9
VITE_SHOPIFY_ADMIN_API_SECRET=749dc6236bfa6f6948ee4c39e0d52c37
VITE_SHOPIFY_ADMIN_ACCESS_TOKEN=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
VITE_KUSTOMER_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENAI_API_KEY=sk-proj-h-ISI1pECUBVww58HTn8G...

# Add these new ones:
VITE_KLAVIYO_PRIVATE_API_KEY=pk_...
VITE_MESSENGER_APP_ID=...
VITE_MESSENGER_APP_SECRET=...
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAG...
VITE_MESSENGER_VERIFY_TOKEN=...
VITE_TWILIO_ACCOUNT_SID=AC...
VITE_TWILIO_AUTH_TOKEN=...
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VITE_STRIPE_SECRET_KEY=sk_test_... # Optional
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Optional
```

#### Vercel (Production):
```powershell
# Navigate to your project
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

# Add each new variable
vercel env add VITE_KLAVIYO_PRIVATE_API_KEY
# (paste your key when prompted)

vercel env add VITE_MESSENGER_APP_ID
vercel env add VITE_MESSENGER_APP_SECRET
vercel env add VITE_MESSENGER_PAGE_ACCESS_TOKEN
vercel env add VITE_MESSENGER_VERIFY_TOKEN
vercel env add VITE_TWILIO_ACCOUNT_SID
vercel env add VITE_TWILIO_AUTH_TOKEN
vercel env add VITE_TWILIO_WHATSAPP_NUMBER

# Optional:
vercel env add VITE_STRIPE_SECRET_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

---

### 4. Deploy Changes

Once you have at least Klaviyo key:

```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

# Commit changes
git add .
git commit -m "Add centralized integration architecture"
git push origin main

# Deploy to Vercel
vercel --prod
```

---

## 🎯 WHAT YOU CAN TEST IMMEDIATELY

With the credentials you **already have**:
1. ✅ **Shopify** - Product search, order tracking, customer lookup
2. ✅ **Kustomer** - Ticket creation, conversation management
3. ✅ **OpenAI** - AI responses

Once you add:
4. 🔴 **Klaviyo** - Email list subscriptions, event tracking
5. 🔴 **Messenger** - Send/receive Facebook messages
6. 🔴 **WhatsApp** - Send/receive WhatsApp messages

---

## 📊 INTEGRATION STATUS DASHBOARD

| Provider | Status | Credentials | Action Needed |
|----------|--------|-------------|---------------|
| OpenAI | ✅ Ready | Have key | None |
| Shopify | ✅ Ready | Have key | None |
| Kustomer | ✅ Ready | Have key | None |
| Klaviyo | 🔴 Needs Setup | Need key | Get from Klaviyo (5 min) |
| Messenger | 🔴 Needs Setup | Need key | Create Facebook App (30 min) |
| WhatsApp | 🔴 Needs Setup | Need key | Sign up Twilio (15 min) |
| Stripe | 🟡 Optional | Need key | Sign up Stripe (15 min) |

---

## 🔗 QUICK ACCESS LINKS

### Get API Keys:
- **Klaviyo:** https://www.klaviyo.com/settings/account/api-keys
- **Facebook Developers:** https://developers.facebook.com/apps/
- **Twilio:** https://www.twilio.com/try-twilio
- **Stripe:** https://dashboard.stripe.com/test/apikeys

### Documentation:
- **Shopify API:** https://shopify.dev/docs/api/admin-rest
- **Klaviyo API:** https://developers.klaviyo.com/en/reference/api-overview
- **Messenger Platform:** https://developers.facebook.com/docs/messenger-platform
- **Twilio WhatsApp:** https://www.twilio.com/docs/whatsapp
- **Kustomer API:** https://developer.kustomer.com/

---

## 💡 TIPS

1. **Start with Klaviyo** - It's the easiest and fastest to set up
2. **Use test credentials** - Stripe and Twilio have test modes
3. **Save credentials securely** - Keep a password manager backup
4. **Test one at a time** - Easier to debug issues
5. **Facebook Messenger** is the most complex - save it for last

---

## 🆘 NEED HELP?

If you encounter issues:
1. Check the `API_KEYS_CHECKLIST.md` for detailed instructions
2. Verify environment variables are set in Vercel
3. Check the integration service logs in Vercel dashboard
4. Test API endpoints directly using Postman or curl

---

**Ready to proceed?** 
1. Run the database migration
2. Get the Klaviyo key (5 minutes)
3. Test the Shopify integration
4. Let me know when you're ready for the frontend UI!
