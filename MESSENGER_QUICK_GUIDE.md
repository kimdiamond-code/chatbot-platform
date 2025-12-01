# 🎯 MESSENGER SETUP - QUICK VISUAL GUIDE

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Create Facebook Page (if needed)                   │
│  https://www.facebook.com/pages/create                       │
│  → Click "Create New Page"                                   │
│  → Fill in: Page Name, Category                             │
│  → Get Page ID from About section                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Create Developer Account                           │
│  https://developers.facebook.com/                            │
│  → Click "Get Started"                                       │
│  → Complete registration                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Create Facebook App                                │
│  https://developers.facebook.com/apps/                       │
│  → Click "Create App"                                        │
│  → Choose "Business" type                                    │
│  → Name: "AgenStack Chatbot Platform"                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Add Messenger Product                              │
│  On App Dashboard                                            │
│  → Find "Messenger" in products list                         │
│  → Click "Set Up"                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Generate Page Access Token ⭐ MOST IMPORTANT!     │
│  On Messenger Settings                                       │
│  → Click "Add or Remove Pages"                              │
│  → Select your page                                          │
│  → Click "Generate Token"                                    │
│  → ⚠️ COPY IMMEDIATELY! Starts with EAAG...                │
│  → Save as: VITE_MESSENGER_PAGE_ACCESS_TOKEN                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Get App ID & Secret                                │
│  Settings → Basic                                            │
│  → Copy App ID (numbers)                                     │
│  → Click "Show" for App Secret                              │
│  → Save as: VITE_MESSENGER_APP_ID                           │
│  → Save as: VITE_MESSENGER_APP_SECRET                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Set Up Webhooks                                    │
│  On Messenger Settings → Webhooks                           │
│  → Callback URL: https://chatbot-platform-v2.vercel.app/... │
│  → Verify Token: CREATE YOUR OWN (e.g., my_token_123)      │
│  → Save as: VITE_MESSENGER_VERIFY_TOKEN                     │
│  → Click "Verify and Save"                                  │
│  → Subscribe to: messages, messaging_postbacks              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Subscribe App to Page                              │
│  On Webhooks section                                         │
│  → Find your page                                            │
│  → Click "Subscribe"                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ DONE! You now have 4 credentials:                       │
│                                                               │
│  1. VITE_MESSENGER_APP_ID                                    │
│  2. VITE_MESSENGER_APP_SECRET                                │
│  3. VITE_MESSENGER_PAGE_ACCESS_TOKEN (EAAG...)              │
│  4. VITE_MESSENGER_VERIFY_TOKEN (you created this)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 CRITICAL STEPS - DON'T MISS THESE!

### ⚠️ **Step 5 - Page Access Token**
**THIS IS THE MOST IMPORTANT STEP!**

When you click "Generate Token":
1. A popup appears with checkboxes
2. ✅ **CHECK ALL PERMISSIONS**
3. Especially: `pages_messaging`, `pages_manage_metadata`
4. Click Continue
5. **IMMEDIATELY COPY THE TOKEN**
6. Token starts with `EAAG` and is 200+ characters long
7. You only see this ONCE - copy it NOW!

### ⚠️ **Step 7 - Verify Token**
**YOU CREATE THIS YOURSELF!**

This is NOT from Facebook. You make it up:
- Good: `agenstack_verify_2025`
- Good: `my_secure_token_12345`
- Good: `messenger_webhook_secret`
- Bad: Simple words like "test" or "password"

Write it down BEFORE entering it in Facebook!

---

## 📋 QUICK COPY-PASTE CHECKLIST

```
□ Facebook Page Created
  Page Name: _________________________
  Page ID: ____________________________

□ Facebook App Created
  App Name: __________________________
  App ID: _____________________________

□ Messenger Product Added

□ Page Access Token Generated
  Token (EAAG...): ____________________
  _______________________________________
  _______________________________________

□ App Secret Retrieved
  Secret: _____________________________

□ Verify Token Created (by me)
  My Verify Token: ____________________

□ Webhook URL Added
  URL: https://chatbot-platform-v2.vercel.app/api/webhooks/messenger

□ Webhook Subscribed
  □ messages
  □ messaging_postbacks

□ App Subscribed to Page

□ All credentials added to .env

□ All credentials added to Vercel
```

---

## 🔗 Direct Links (Open These in Order)

1. **Create Page:** https://www.facebook.com/pages/create
2. **Developer Dashboard:** https://developers.facebook.com/apps/
3. **Graph API Explorer (for testing):** https://developers.facebook.com/tools/explorer/

---

## ⚡ FASTEST PATH (If you're in a hurry)

If you just want to test Messenger without creating a full page:

1. Go to: https://developers.facebook.com/apps/
2. Create App → Business
3. Add Messenger product
4. Use your PERSONAL Facebook profile as the test page
5. Generate token for your profile
6. Test everything
7. Later, create proper business page

---

## 🧪 Test Your Token

Once you have your Page Access Token, test it:

```bash
curl -X GET "https://graph.facebook.com/v18.0/me?access_token=YOUR_PAGE_ACCESS_TOKEN"
```

Should return your page info:
```json
{
  "name": "AgenStack Chatbot",
  "id": "123456789012345"
}
```

If you get an error, your token is wrong!

---

## 💾 Add to Your Files

### .env (local):
```env
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123def456ghi789
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAG...very_long_token...
VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_2025
```

### Vercel (production):
```powershell
vercel env add VITE_MESSENGER_APP_ID
vercel env add VITE_MESSENGER_APP_SECRET
vercel env add VITE_MESSENGER_PAGE_ACCESS_TOKEN
vercel env add VITE_MESSENGER_VERIFY_TOKEN
```

---

## 🆘 HELP! Common Problems

### "I can't find where to generate the token!"
→ Messenger Settings → Access Tokens section → Click "Add or Remove Pages" first

### "The Generate Token button is grayed out"
→ You need to add your page first using "Add or Remove Pages"

### "Token generation failed"
→ Make sure you're an admin of the Facebook Page

### "Webhook verification failed"
→ Double-check your verify token matches EXACTLY (case-sensitive!)

### "I lost my Page Access Token!"
→ Generate a new one (same steps in Step 5)

---

**Need help with a specific step? Tell me which step number and I'll walk you through it!**
