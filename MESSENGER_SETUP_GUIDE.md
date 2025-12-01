# 📱 FACEBOOK MESSENGER APP SETUP - COMPLETE GUIDE

## Prerequisites
- Facebook account (personal)
- Facebook Business Page (you'll create one if you don't have it)
- 30 minutes

---

## 🎯 OVERVIEW

You need to:
1. Create a Facebook Business Page (if you don't have one)
2. Create a Facebook App for Messenger
3. Connect your Page to the App
4. Get the Page Access Token
5. Set up Webhooks
6. Get all the credentials needed

---

## STEP 1: Create a Facebook Business Page (Skip if you have one)

### Go to: https://www.facebook.com/pages/create

1. Click **"Create New Page"**
2. Choose **"Business or Brand"**
3. Fill in:
   - **Page Name:** AgenStack Chatbot (or your business name)
   - **Category:** Software Company (or your category)
   - **Description:** AI-powered customer service chatbot
4. Click **"Create Page"**
5. **Save the Page ID** - you'll need this later
   - Go to your page
   - Click "About"
   - Scroll to bottom
   - Copy the Page ID number

✅ **You now have a Facebook Page!**

---

## STEP 2: Create Facebook Developers Account

### Go to: https://developers.facebook.com/

1. Click **"Get Started"** (top right)
2. Choose **"Continue"** with your Facebook account
3. Fill in:
   - Display Name: Your name
   - Email: Your email
   - Role: Select appropriate role
4. Click **"Complete Registration"**
5. Verify your email if prompted

✅ **You now have a Facebook Developers account!**

---

## STEP 3: Create a Facebook App

### At: https://developers.facebook.com/apps/

1. Click **"Create App"** (green button)

2. Choose **"Business"** type
   - Click **"Next"**

3. Fill in App Details:
   - **Display Name:** AgenStack Chatbot Platform
   - **App Contact Email:** your-email@example.com
   - **Business Account:** Create new or select existing
   - Click **"Create App"**

4. Complete Security Check (if prompted)

5. You'll be redirected to the App Dashboard

✅ **App Created! You're now on the App Dashboard**

---

## STEP 4: Add Messenger Product

### On your App Dashboard:

1. Scroll down to **"Add Products to Your App"**

2. Find **"Messenger"** and click **"Set Up"**

3. The Messenger settings page will open

✅ **Messenger product added!**

---

## STEP 5: Generate Page Access Token

### On the Messenger Settings page:

1. Scroll to **"Access Tokens"** section

2. Click **"Add or Remove Pages"**

3. **IMPORTANT STEP:** 
   - A popup will appear
   - Select your Facebook Page
   - Click **"Next"**
   - Grant all permissions
   - Click **"Done"**

4. Back on the Messenger Settings:
   - Your page should now appear
   - Click **"Generate Token"** next to your page

5. **CRITICAL:** A popup appears with permissions
   - ✅ Check ALL permissions
   - Especially: `pages_messaging`, `pages_manage_metadata`
   - Click **"Continue"**
   - Click **"Done"**

6. **COPY THE TOKEN IMMEDIATELY!**
   - It starts with `EAAG...`
   - It's very long (200+ characters)
   - **Paste it somewhere safe immediately**
   - You can only see this once!

7. **IMPORTANT:** Click "I Understand" on the token expiration warning
   - Then change token expiration to "Never expire" (recommended)

✅ **You now have your Page Access Token!**

```
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAG....(your token here)
```

---

## STEP 6: Get App ID and App Secret

### On your App Dashboard:

1. Click **"Settings"** → **"Basic"** (left sidebar)

2. You'll see:
   - **App ID:** A number like `123456789012345`
   - **App Secret:** Click **"Show"** button, enter your Facebook password

3. **Copy both:**

```
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123def456...
```

✅ **You have App ID and Secret!**

---

## STEP 7: Set Up Webhooks

### Still on Messenger Settings page:

1. Scroll to **"Webhooks"** section

2. Click **"Add Callback URL"**

3. Enter:
   - **Callback URL:** `https://chatbot-platform-v2.vercel.app/api/webhooks/messenger`
   - **Verify Token:** Create your own (e.g., `agenstack_verify_12345`)
   
   **IMPORTANT:** Write down your verify token!
   ```
   VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_12345
   ```

4. Click **"Verify and Save"**

5. **Subscribe to webhook fields:**
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `message_reads`
   - ✅ `message_deliveries`
   - Click **"Subscribe"**

✅ **Webhooks configured!**

---

## STEP 8: Subscribe App to Page

### On the Webhooks section:

1. Find your page in the list

2. Click **"Subscribe"** next to your page

3. Make sure these are enabled:
   - ✅ messages
   - ✅ messaging_postbacks

✅ **App subscribed to page events!**

---

## STEP 9: Get Your Page ID

### Two ways:

**Method 1: From Facebook Page**
1. Go to your Facebook Page
2. Click "About" tab
3. Scroll to bottom
4. Find "Page ID" - it's a number

**Method 2: From Graph API Explorer**
1. Go to: https://developers.facebook.com/tools/explorer/
2. Click "Get Token" → "Page Access Tokens"
3. Select your page
4. In the query box, type: `me?fields=id,name`
5. Click "Submit"
6. Copy the `id` from the response

```json
{
  "id": "123456789012345",  ← This is your Page ID
  "name": "AgenStack Chatbot"
}
```

---

## 📝 SUMMARY: All Your Credentials

You should now have:

```env
# From Step 6
VITE_MESSENGER_APP_ID=123456789012345

# From Step 6
VITE_MESSENGER_APP_SECRET=abc123def456...

# From Step 5
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAG....(very long token)

# From Step 7 (you created this)
VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_12345

# From Step 9 (for users to connect)
# Users will enter this when connecting
PAGE_ID=123456789012345
```

---

## 🚀 Add to Your Project

### Update Local .env:

```env
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123def456...
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAG...
VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_12345
```

### Add to Vercel:

```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

vercel env add VITE_MESSENGER_APP_ID
# Paste: 123456789012345

vercel env add VITE_MESSENGER_APP_SECRET
# Paste: abc123def456...

vercel env add VITE_MESSENGER_PAGE_ACCESS_TOKEN
# Paste: EAAG...

vercel env add VITE_MESSENGER_VERIFY_TOKEN
# Paste: agenstack_verify_12345
```

---

## ✅ Testing Your Setup

### Test the Page Access Token:

1. Go to: https://developers.facebook.com/tools/explorer/

2. Select your app (top left dropdown)

3. Select "Page Access Token" (Get Token button)

4. Select your page

5. In the query field, enter: `me/conversations`

6. Click Submit

7. If you see a response (even if empty), **it works!** ✅

---

## 🆘 Common Issues & Solutions

### "Callback URL verification failed"
**Solution:** 
- Make sure your verify token matches exactly
- Ensure your Vercel deployment is complete
- Check that the webhook endpoint exists

### "Invalid Page Access Token"
**Solution:**
- Regenerate the token
- Make sure you selected all permissions
- Check token hasn't expired

### "Can't find my Page ID"
**Solution:**
- Go to: https://developers.facebook.com/tools/explorer/
- Query: `me?fields=id,name`
- The `id` field is your Page ID

### "Webhook not receiving events"
**Solution:**
- Make sure you subscribed to webhook fields
- Check that app is subscribed to the page
- Verify webhook callback URL is correct

---

## 📸 Visual Checklist

When done, verify you have:
- ✅ Facebook Business Page created
- ✅ Facebook App created
- ✅ Messenger product added
- ✅ Page Access Token generated (starts with EAAG)
- ✅ App ID copied (numbers only)
- ✅ App Secret copied (shown after clicking "Show")
- ✅ Verify Token created (you made this up)
- ✅ Webhook URL added and verified
- ✅ Page subscribed to app
- ✅ All credentials added to .env
- ✅ All credentials added to Vercel

---

## 🎯 Next Steps

1. Deploy your application: `vercel --prod`
2. Test in your platform:
   - Go to Integrations page
   - Click "Connect" on Messenger
   - Enter your Page ID
   - Click "Test Connection"

---

## 🔗 Quick Reference Links

- **Developers Console:** https://developers.facebook.com/apps/
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Messenger Docs:** https://developers.facebook.com/docs/messenger-platform
- **Your Facebook Page:** https://www.facebook.com/pages/
- **Webhook Tester:** https://developers.facebook.com/tools/webhooks/

---

## 💡 Pro Tips

1. **Keep your Page Access Token secure** - Never commit it to GitHub
2. **Use a "Never Expire" token** - For production use
3. **Test in Graph API Explorer** - Before integrating
4. **Subscribe to all webhook events** - You can always ignore what you don't need
5. **Create a test page first** - Practice before using your real business page

---

**Still stuck? Let me know which step you're on and I'll help you through it!** 🚀
