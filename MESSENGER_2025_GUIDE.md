# 📱 FACEBOOK MESSENGER - UPDATED 2025 GUIDE

## ⚠️ IMPORTANT: Facebook Changed Their UI

There's NO "Business" type option anymore. Here's the correct current flow:

---

## STEP 1: Create Facebook Developers Account

### Go to: https://developers.facebook.com/

1. Click **"Get Started"** (top right) or **"My Apps"**
2. Log in with your Facebook account
3. Complete registration if prompted
4. Accept terms and conditions

✅ **Developer account ready!**

---

## STEP 2: Create a New App (2025 Method)

### Go to: https://developers.facebook.com/apps/

1. Click **"Create App"** (green button)

2. **NEW FLOW - You'll see different options:**
   - Choose **"Other"** (or whatever option shows "Messenger" in description)
   - If you see "Use cases" instead, select **"Other"** or **"Build Connected Experiences"**
   - Click **"Next"**

3. **App Type Selection:**
   - If asked to select app type, choose **"Consumer"** or **"Business"** (either works)
   - If you don't see these options, just proceed to the next screen
   - Click **"Next"**

4. **Fill in App Details:**
   - **App Name:** `AgenStack Chatbot` (or your name)
   - **App Contact Email:** your-email@example.com
   - **Business Account (optional):** Can skip this
   - Click **"Create App"**

5. **Security Check:** Complete the CAPTCHA

✅ **App Created! You're now on the App Dashboard**

---

## STEP 3: Add Messenger to Your App

### On the App Dashboard:

**Method A: If you see "Add Products"**
1. Scroll down to **"Add Products to Your App"**
2. Find **"Messenger"** 
3. Click **"Set Up"**

**Method B: If you see "Products +" in sidebar**
1. Click **"Products +"** in left sidebar
2. Find **"Messenger"**
3. Click **"Set Up"**

**Method C: Direct Link**
1. Go to: `https://developers.facebook.com/apps/YOUR_APP_ID/messenger/`
2. Click **"Set Up"** or **"Get Started"**

✅ **Messenger added to your app!**

---

## STEP 4: Connect Your Facebook Page

### You need a Facebook Page first (if you don't have one):

**Create a Page (2 minutes):**
1. Go to: https://www.facebook.com/pages/create
2. Click **"Get Started"** or **"Create New Page"**
3. Fill in:
   - **Page Name:** AgenStack Chatbot
   - **Category:** Business or Software
4. Click **"Create Page"**
5. **Get your Page ID:**
   - Go to your page
   - Click **"About"**
   - Scroll down
   - Copy the **Page ID** (a long number)

---

## STEP 5: Generate Page Access Token (CRITICAL!)

### On Messenger Settings Page:

1. Find the **"Access Tokens"** section (might be called "Messenger API Settings")

2. You'll see **"Add or Remove Pages"** button
   - Click it
   - **Log in if prompted**
   - Select your page from the list
   - Check all permission boxes
   - Click **"Continue"** or **"Done"**

3. Your page should now appear in the list

4. **Click "Generate Token"** next to your page
   - A popup appears
   - **✅ CHECK ALL PERMISSIONS** (very important!)
   - Look for: `pages_messaging`, `pages_manage_metadata`, `pages_read_engagement`
   - Click **"Continue"**
   - Click **"Done"**

5. **⚠️ COPY THE TOKEN IMMEDIATELY!**
   - It appears in a text box
   - Starts with `EAAG`
   - About 200+ characters long
   - **You only see this ONCE**
   - Save it as: `VITE_MESSENGER_PAGE_ACCESS_TOKEN`

6. **IMPORTANT:** Before closing
   - Look for "Token Expiration" dropdown
   - Change to **"Never expire"** if available
   - Or select **"60 days"** (you'll need to regenerate later)

✅ **Page Access Token saved!**

```
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAGxxxxxxxxxxxxxxx...
```

---

## STEP 6: Get App ID and App Secret

### Easy to find:

1. Click **"Settings"** in the left sidebar
2. Click **"Basic"** (should be selected by default)
3. You'll see:
   - **App ID:** Copy this number
   - **App Secret:** Click **"Show"**, enter Facebook password, copy it

```
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123def456...
```

✅ **Got App ID and Secret!**

---

## STEP 7: Set Up Webhooks

### On Messenger Settings Page:

1. Scroll to **"Webhooks"** section

2. Click **"Add Callback URL"** (or "Edit" if already there)

3. **Enter these values:**
   - **Callback URL:** `https://chatbot-platform-v2.vercel.app/api/webhooks/messenger`
   - **Verify Token:** **YOU CREATE THIS!** (e.g., `agenstack_verify_2025`)
   
   ⚠️ **IMPORTANT:** Write down YOUR verify token!
   ```
   VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_2025
   ```

4. Click **"Verify and Save"**

5. **If verification fails:**
   - Make sure your app is deployed on Vercel
   - Double-check the URL is correct
   - Check that verify token matches exactly

6. **Subscribe to webhook fields:**
   - After saving, you'll see checkboxes
   - ✅ Check: `messages`
   - ✅ Check: `messaging_postbacks`
   - ✅ Check: `message_reads` (optional)
   - Click **"Save"** or **"Subscribe"**

---

## STEP 8: Subscribe App to Your Page

### Still in Webhooks section:

1. Look for **"Page Subscriptions"** or similar
2. Your page should be listed
3. Click **"Subscribe"** next to your page
4. Make sure webhook fields are checked

✅ **App subscribed to page!**

---

## ✅ CHECKLIST - You Should Now Have:

```env
# From Step 6
VITE_MESSENGER_APP_ID=123456789012345

# From Step 6
VITE_MESSENGER_APP_SECRET=abc123def456...

# From Step 5 - CRITICAL!
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAGxxxxxxx...

# From Step 7 - YOU CREATED THIS
VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_2025
```

---

## 🚀 Add to Your Project

### 1. Update .env file:

```env
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123def456...
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAGxxxxxxx...
VITE_MESSENGER_VERIFY_TOKEN=agenstack_verify_2025
```

### 2. Add to Vercel:

```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

vercel env add VITE_MESSENGER_APP_ID
# Paste your App ID

vercel env add VITE_MESSENGER_APP_SECRET
# Paste your App Secret

vercel env add VITE_MESSENGER_PAGE_ACCESS_TOKEN
# Paste your Page Access Token (EAAG...)

vercel env add VITE_MESSENGER_VERIFY_TOKEN
# Paste your Verify Token
```

### 3. Deploy:

```powershell
git add .
git commit -m "Add Messenger integration credentials"
git push
vercel --prod
```

---

## 🧪 Test Your Setup

### Test 1: Check Token Works

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your app (top left)
3. Select "User Token" dropdown → Change to "Page Access Token"
4. Select your page
5. In query box, type: `me?fields=id,name`
6. Click **"Submit"**
7. Should return:
   ```json
   {
     "id": "123456789",
     "name": "Your Page Name"
   }
   ```

### Test 2: Check Webhook

After deploying to Vercel:
1. Go back to Messenger Settings → Webhooks
2. If the callback URL is verified ✅, you're good!
3. If not, click "Edit" and "Verify and Save" again

---

## 🆘 Common Issues

### "I can't find the Add Products section"
**Solution:** Look for "Products +" in the left sidebar instead

### "Generate Token button is grayed out"
**Solution:** Click "Add or Remove Pages" first and select your page

### "Webhook verification failed"
**Solutions:**
- Ensure app is deployed: `vercel --prod`
- Check URL is exact: `https://chatbot-platform-v2.vercel.app/api/webhooks/messenger`
- Verify token matches exactly (case-sensitive)
- Wait 2 minutes after deploying, then try again

### "No App Type options shown"
**Solution:** That's fine! Just proceed to the next screen and add Messenger as a product

### "Token expired" error
**Solution:** Regenerate the token (repeat Step 5)

---

## 📱 Alternative: Use Test App

If you're just testing and don't want to set up everything:

1. Create app
2. Add Messenger
3. Use **"Test Mode"** or **"Development Mode"**
4. Send test messages from your own Facebook account
5. Later switch to "Live Mode" for production

---

## 🔗 Important Links

- **Apps Dashboard:** https://developers.facebook.com/apps/
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Messenger Docs:** https://developers.facebook.com/docs/messenger-platform/
- **Create Page:** https://www.facebook.com/pages/create

---

**Still having trouble? Tell me exactly what you see on your screen and I'll help!**
