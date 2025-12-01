# 🔗 INTEGRATION SETUP - QUICK LINKS

## 📋 Get API Credentials Here:

### 🟢 Klaviyo (5 minutes)
**Direct Link:** https://www.klaviyo.com/settings/account/api-keys
- Click "Create Private API Key"
- Copy key (starts with `pk_`)

### 🔵 Facebook Messenger (30 minutes)
**Start Here:** https://developers.facebook.com/apps/
**Then:**
1. Create App → Business Type
2. Add Messenger Product
3. **Generate Token:** https://developers.facebook.com/apps/YOUR_APP_ID/messenger/settings/
4. **Webhook Setup:** Use `https://chatbot-platform-v2.vercel.app/api/webhooks/messenger`

### 🟢 Twilio/WhatsApp (15 minutes)
**Sign Up:** https://www.twilio.com/try-twilio
**Console:** https://console.twilio.com/
**WhatsApp Sandbox:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

### 🟡 Stripe (Optional, 15 minutes)
**API Keys:** https://dashboard.stripe.com/test/apikeys
**Start here:** https://stripe.com/

---

## 📚 Documentation Links:

- **Shopify API:** https://shopify.dev/docs/api/admin-rest/2024-10/resources/product
- **Klaviyo API:** https://developers.klaviyo.com/en/reference/api-overview
- **Messenger:** https://developers.facebook.com/docs/messenger-platform/getting-started
- **Twilio:** https://www.twilio.com/docs/whatsapp/quickstart
- **Kustomer:** https://developer.kustomer.com/kustomer-api-docs/reference/introduction

---

## 🗄️ Your Database:

**Neon Console:** https://console.neon.tech/
**Connection String:** 
```
postgresql://neondb_owner:npg_oO90iBtIxymP@ep-super-snow-addw8m42-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## ☁️ Your Deployment:

**Vercel Dashboard:** https://vercel.com/dashboard
**Production Site:** https://chatbot-platform-v2.vercel.app
**Project Settings:** https://vercel.com/your-team/chatbot-platform-v2/settings

---

## 🚀 Deployment Commands:

```powershell
# Navigate to project
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

# Add env variables to Vercel
vercel env add VITE_KLAVIYO_PRIVATE_API_KEY
vercel env add VITE_MESSENGER_APP_ID
vercel env add VITE_MESSENGER_APP_SECRET
vercel env add VITE_MESSENGER_PAGE_ACCESS_TOKEN
vercel env add VITE_MESSENGER_VERIFY_TOKEN
vercel env add VITE_TWILIO_ACCOUNT_SID
vercel env add VITE_TWILIO_AUTH_TOKEN
vercel env add VITE_TWILIO_WHATSAPP_NUMBER

# Deploy
git add .
git commit -m "Add centralized integrations"
git push origin main
vercel --prod
```

---

## ✅ Integration Checklist:

- [ ] Run database migration (create integrations table)
- [ ] Get Klaviyo Private API Key
- [ ] Add Klaviyo key to `.env` and Vercel
- [ ] Get Facebook Messenger credentials (optional)
- [ ] Add Messenger credentials to Vercel
- [ ] Get Twilio credentials (optional)
- [ ] Add Twilio credentials to Vercel
- [ ] Update router to use CentralizedIntegrations component
- [ ] Deploy to production
- [ ] Test Shopify connection
- [ ] Test Klaviyo connection
- [ ] Test other integrations

---

## 🆘 Quick Help:

**Database not connecting?**
- Check Neon console is accessible
- Verify migration ran: `SELECT * FROM integrations LIMIT 1;`

**Integration shows "Admin Setup Needed"?**
- Add the API key to Vercel environment variables
- Redeploy: `vercel --prod`
- Clear browser cache

**Test connection fails?**
- Verify account identifier is correct (store name, subdomain, etc.)
- Check browser console for detailed error
- Verify admin API keys are correct in Vercel

---

**Print this page and keep it handy while setting up!** 📄
