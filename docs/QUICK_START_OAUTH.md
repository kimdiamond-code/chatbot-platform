# 🎯 SHOPIFY OAUTH - QUICK START

## ⚡ 3-Step Setup

### 1️⃣ DATABASE
```bash
# Run in Supabase SQL Editor
Copy: database_oauth_states.sql → Paste → Execute
```

### 2️⃣ SHOPIFY APP
```
Partners Dashboard → Your App → App Setup → URLs:
✅ App URL: https://chatbot-platform-v2.vercel.app
✅ Redirect: https://chatbot-platform-v2.vercel.app/shopify/callback
```

### 3️⃣ DEPLOY
```bash
DEPLOY_SHOPIFY_OAUTH.bat
```

**CRITICAL: Add to Vercel Environment Variables:**
- SHOPIFY_CLIENT_ID
- SHOPIFY_CLIENT_SECRET  
- SHOPIFY_REDIRECT_URI
- SHOPIFY_SCOPES

---

## 🧪 Test It

1. Go to: https://chatbot-platform-v2.vercel.app
2. Integrations → Shopify
3. Click "🚀 OAuth (Best)" tab
4. Enter store name → "Connect with OAuth"
5. Approve on Shopify → Done! ✅

---

## 📝 Your Credentials

```
Client ID: 1209816bfe4d73b67e9d90c19dc984d9
Client Secret: 749dc6236bfa6f6948ee4c39e0d52c37
Redirect URI: https://chatbot-platform-v2.vercel.app/shopify/callback
```

---

## 🔥 What Changed

✅ `.env` - Added OAuth credentials
✅ `/api/shopify/oauth/auth.js` - NEW OAuth init endpoint
✅ `/api/shopify/oauth/token.js` - Token exchange endpoint
✅ `ShopifyOAuthConfiguration.jsx` - Added OAuth UI
✅ `Router.jsx` - Added `/shopify/callback` route
✅ `database_oauth_states.sql` - NEW tables: oauth_states, shopify_apps

---

## ❓ Quick Troubleshooting

**"Invalid OAuth state"** → Try again (expires in 15min)
**"Failed to exchange token"** → Check Vercel env vars
**"Redirect not working"** → Verify Shopify app URLs
**Connection fails** → Check database tables exist

Full guide: `SHOPIFY_OAUTH_SETUP_GUIDE.md`
