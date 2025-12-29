# 📋 INTEGRATION API KEYS CHECKLIST

Copy this checklist and fill in your credentials as you obtain them.

---

## ✅ ALREADY CONFIGURED

### OpenAI (AI Responses)
- [x] API Key: `sk-proj-h-ISI1pECUBVww58HTn8G...` ✅
- [x] Organization ID: `org-8J5v1gk2mYq6bZt3pX9pD3BlbkFJ...` ✅
- **Status:** WORKING

---

## 🔴 NEED TO OBTAIN

### 1. Shopify (E-commerce Integration)

**Where to get:** https://partners.shopify.com/

**What you need:**
- [ ] SHOPIFY_ADMIN_API_KEY: `___________________________`
- [ ] SHOPIFY_ADMIN_API_SECRET: `___________________________`
- [ ] SHOPIFY_ADMIN_ACCESS_TOKEN: `shpat_____________________`

**Instructions:**
1. Create Shopify Partner account (free)
2. Create a "Custom App" or "Public App"
3. Required scopes: `read_products, write_products, read_orders, write_orders, read_customers, write_customers, read_inventory, write_inventory, read_locations, read_draft_orders, write_draft_orders`
4. Install app and copy the 3 values above

**Notes:**
- Current `.env` has True Citrus keys - these can be used as admin keys
- Store Name: `true-citrus`
- You already have: API Key `1209816bfe4d73b67e9d90c19dc984d9`
- You already have: Secret `749dc6236bfa6f6948ee4c39e0d52c37`
- You already have: Access Token `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`

**Action:** ✅ YOU'RE ALREADY SET - Just need to rename env vars for clarity

---

### 2. Klaviyo (Email Marketing)

**Where to get:** https://www.klaviyo.com/ → Account → Settings → API Keys

**What you need:**
- [ ] KLAVIYO_PRIVATE_API_KEY: `pk_0e451f3e95d467f112cb00bcd1b2048653___________________________`

**Instructions:**
1. Log in to Klaviyo account
2. Go to Account → Settings → API Keys
3. Create a "Private API Key"
4. Select scopes: `Lists:Read, Lists:Write, Profiles:Read, Profiles:Write, Campaigns:Read, Flows:Read`
5. Copy the Private Key

**Notes:**
- Private keys start with `pk_`
- Make sure to select "Full Access" or required scopes
- Save the key immediately (only shown once)

---

### 3. Kustomer (Customer Service CRM)

**Where to get:** https://app.kustomer.com/ → Settings → API Keys

**What you need:**
- [ ] KUSTOMER_API_KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Instructions:**
1. Log in to Kustomer
2. Go to Settings → API Keys
3. Create new API Key
4. Select permissions:
   - `org.user.customer.read`
   - `org.user.customer.write`
   - `org.user.conversation.read`
   - `org.user.conversation.write`
   - `org.admin.message.write`
5. Copy the API Key (starts with `eyJhbG...`)

**Notes:**
- You already have: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDk3NmE2OWFkOGE0ZWVjM2MxMGQzZSIsInVzZXIiOiI2OGQ5NzZhNjkyZTBiNzZlMWQwMWZjZDQiLCJvcmciOiI1YzM3NTRkOGMwZWQ1YzAwMTkwZGMwMjYiLCJvcmdOYW1lIjoidHJ1ZS1jaXRydXMiLCJ1c2VyVHlwZSI6Im1hY2hpbmUiLCJwb2QiOiJwcm9kMSIsInJvbGVzIjpbIm9yZy5hZG1pbi5jdXN0b21lci5tZXJnZS53cml0ZSIsIm9yZy5hZG1pbi5tZXNzYWdlLndyaXRlIiwib3JnLnVzZXIuY29udmVyc2F0aW9uLndyaXRlIiwib3JnLnVzZXIuY3VzdG9tZXIucmVhZCIsIm9yZy51c2VyLm5vdGUud3JpdGUiLCJvcmcudXNlci5jb252ZXJzYXRpb24ucmVhZCJdLCJhdWQiOiJ1cm46Y29uc3VtZXIiLCJpc3MiOiJ1cm46YXBpIiwic3ViIjoiNjhkOTc2YTY5MmUwYjc2ZTFkMDFmY2Q0In0.9dMybxEnhTLVc1RJe164mNZu9YJpARMYgnhUFk0QcWM`
- Subdomain: `true-citrus`

**Action:** ✅ YOU'RE ALREADY SET

---

### 4. Facebook Messenger (Messaging Platform)

**Where to get:** https://developers.facebook.com/

**What you need:**
- [ ] MESSENGER_PAGE_ACCESS_TOKEN:EAAKQZCH8BTuMBQEKhcZAm2sQxp3lg80ER7NY7SOo9AewNboHv6gkcFCvAvZBQ5gQXxXPa7nZBW5ZC2ZA8UjIZB3yDe8YyoaFovLEZCcyr4fZBjbo8RmF8UpBZBIQZBVArSZAD5ROZByhzmLxr4yJfFBPZCZBHCvekRZB3dEiUbJCqIh3NuGcfZAxS8BQ2JRyh34tgtI4oMwUDseYZD
- [ ] MESSENGER_VERIFY_TOKEN:agenstack_verify_2025
**Instructions:**
1. Go to Facebook Developers
2. Create a new App (type: Business)
3. Add "Messenger" product
4. Generate Page Access Token:
   - Select your Facebook Page
   - Copy the Page Access Token (select "never expires")
5. Set up webhook:
   - Callback URL: `https://chatbot-platform-v2.vercel.app/api/webhooks/messenger`
   - Verify Token: Create a random string (e.g., `my_secure_verify_token_12345`)
6. Subscribe to events: `messages, messaging_postbacks, message_reads`

**Notes:**
- You'll need a Facebook Page first
- Page Access Token should be long-lived (never expires)
- Save verify token in your env vars

---

### 5. WhatsApp Business (via Twilio)

**Where to get:** https://www.twilio.com/

**What you need:**
- [ ] TWILIO_ACCOUNT_SID: `AC___________________________`
- [ ] TWILIO_AUTH_TOKEN: `___________________________`
- [ ] TWILIO_WHATSAPP_NUMBER: `whatsapp:+14155238886` (Twilio sandbox) or your approved number

**Instructions:**
1. Sign up at Twilio.com
2. Go to Console Dashboard
3. Copy Account SID and Auth Token
4. For testing: Use Twilio WhatsApp Sandbox
   - Go to Messaging → Try it Out → Send a WhatsApp Message
   - Number: `whatsapp:+14155238886`
5. For production: Apply for WhatsApp Business API access

**Notes:**
- Sandbox is free for testing
- Production requires WhatsApp Business verification
- Can take 1-2 weekMESSENGER_APP_ID:722364090371811
- [ ] MESSENGER_APP_SECRET:f3547df34db0eae406ddc80b4f0dfb41
- [ ] s for approval

---

### 6. Stripe (Payment Processing) - OPTIONAL

**Where to get:** https://stripe.com/ → Developers → API Keys

**What you need:**
- [ ] STRIPE_SECRET_KEY: `sk_live_____________________` (or `sk_test_...` for testing)
- [ ] STRIPE_PUBLISHABLE_KEY: `pk_live_____________________` (or `pk_test_...` for testing)
- [ ] STRIPE_WEBHOOK_SECRET: `whsec_____________________`

**Instructions:**
1. Sign up at Stripe.com
2. Go to Developers → API Keys
3. Copy Secret Key and Publishable Key
4. Set up webhook:
   - Endpoint URL: `https://chatbot-platform-v2.vercel.app/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.*`, `payment_intent.*`
5. Copy Webhook Signing Secret

**Notes:**
- Use test keys during development (`sk_test_...`)
- Switch to live keys for production (`sk_live_...`)
- Webhook secret different for each endpoint

---

## 📝 SUMMARY

### Ready to Use ✅
1. **OpenAI** - Already configured
2. **Shopify** - Already have True Citrus credentials (can use as admin)
3. **Kustomer** - Already configured

### Need to Obtain 🔴
1. **Klaviyo** - Need to create Private API Key
2. **Messenger** - Need to create Facebook App
3. **WhatsApp/Twilio** - Need to sign up for Twilio
4. **Stripe** (optional) - Need to sign up for Stripe

---

## 🚀 QUICK START ORDER

**Recommended order to obtain credentials:**

1. **Start with Klaviyo** (easiest, 5 mins)
   - You might already have an account
   - Just create API key

2. **Then Twilio/WhatsApp** (15 mins)
   - Sign up free
   - Get sandbox credentials immediately
   - Production approval optional later

3. **Then Facebook Messenger** (30 mins)
   - Need Facebook Page
   - Need to create Facebook App
   - Most complex setup

4. **Finally Stripe** (15 mins) - OPTIONAL
   - Only if you want to process payments
   - Can skip for now

---

## 💾 SAVE YOUR CREDENTIALS

Once you have all the keys, add them to `.env` file:

```env
# Shopify
SHOPIFY_ADMIN_API_KEY=1209816bfe4d73b67e9d90c19dc984d9
SHOPIFY_ADMIN_API_SECRET=749dc6236bfa6f6948ee4c39e0d52c37
SHOPIFY_ADMIN_ACCESS_TOKEN=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

# Klaviyo
KLAVIYO_PRIVATE_API_KEY=pk_YOUR_KEY_HERE

# Kustomer (Already have)
KUSTOMER_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Messenger
MESSENGER_APP_ID=YOUR_APP_ID
MESSENGER_APP_SECRET=YOUR_APP_SECRET
MESSENGER_PAGE_ACCESS_TOKEN=YOUR_TOKEN
MESSENGER_VERIFY_TOKEN=your_custom_verify_string

# Twilio/WhatsApp
TWILIO_ACCOUNT_SID=AC_YOUR_SID
TWILIO_AUTH_TOKEN=YOUR_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Stripe (Optional)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# OpenAI (Already have)
VITE_OPENAI_API_KEY=sk-proj-h-ISI1pECUBVww58HTn8G...
VITE_OPENAI_ORG_ID=org-8J5v1gk2mYq6bZt3pX9pD3BlbkFJ...
```

Then deploy to Vercel:
```powershell
vercel env add KLAVIYO_PRIVATE_API_KEY
vercel env add MESSENGER_APP_ID
# ... etc
```

---

**Questions? Next Steps?**
Once you have the credentials, I'll implement the centralized integration architecture!
