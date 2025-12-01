# 🎯 MESSENGER SETUP - SIMPLEST POSSIBLE GUIDE

## What You're Doing (Big Picture)

You're creating a Facebook App that can send/receive messages on your Facebook Page.

---

## START HERE ⬇️

### 1️⃣ Go to Facebook Developers

**Link:** https://developers.facebook.com/apps/

- Click the **green "Create App"** button

---

### 2️⃣ What Do You See Now?

**You'll see ONE of these screens:**

#### Option A: "What do you want your app to do?"
- Select **"Other"** 
- Click **"Next"**
- Then skip to Step 3

#### Option B: "Select an app type"
- Select **"Business"** or **"Consumer"** (either is fine)
- Click **"Next"**
- Then skip to Step 3

#### Option C: Straight to app name
- Just fill in the name (Step 3)

---

### 3️⃣ Name Your App

You'll see a form asking for:
- **Display name:** Type `AgenStack Chatbot` (or anything you want)
- **Email:** Your email
- Click **"Create App"**
- Do the security check (click the images)

**✅ App is created!**

You'll see a dashboard with your new app.

---

### 4️⃣ Add Messenger

**Look at the left sidebar** or **center of the screen**:

Find **"Messenger"** and click **"Set Up"**

(It might say "Add Products" or have a + icon)

**✅ Messenger is added!**

---

### 5️⃣ Connect Your Facebook Page

**First, do you have a Facebook business page?**

**NO? Create one now (2 minutes):**
1. Open new tab: https://www.facebook.com/pages/create
2. Click "Create New Page"
3. Name: `AgenStack Test Page`
4. Category: Software or Business
5. Click "Create"
6. Done! Come back here.

**YES? Continue:**

On the Messenger settings page:
1. Find **"Access Tokens"** section
2. Click **"Add or Remove Pages"**
3. **Select your page** from the list
4. Click **"Next"** or **"Continue"**
5. **Check ALL the boxes** (important!)
6. Click **"Done"**

---

### 6️⃣ Generate Token (MOST IMPORTANT!)

Still in "Access Tokens" section:

1. Your page now appears in the list
2. Click the **"Generate Token"** button next to it
3. Another popup with checkboxes appears
4. **✅ Check ALL boxes again** (especially `pages_messaging`)
5. Click **"Continue"** → **"Done"**

**🚨 A LONG string appears (starts with EAAG):**
- This is your Page Access Token
- **Copy it RIGHT NOW**
- Paste it somewhere safe
- You won't see it again!

**Save this as:**
```
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAG...paste_here...
```

---

### 7️⃣ Get App ID and Secret

1. Click **"Settings"** in the left sidebar
2. Click **"Basic"**
3. You'll see two things:

**App ID:** A number like `123456789012345`
- Copy it

**App Secret:** Click "Show", enter Facebook password
- Copy it

**Save these as:**
```
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123...
```

---

### 8️⃣ Create Your Verify Token

**You make this up yourself!**

Think of a random secret word/phrase:
- Examples: `my_secure_token_2025`, `agenstack_verify`, `messenger123`
- Write it down NOW
- You'll need it in the next step

**Save it as:**
```
VITE_MESSENGER_VERIFY_TOKEN=my_secure_token_2025
```

---

### 9️⃣ Set Up Webhooks

Go back to **Messenger** in the left sidebar.

Find **"Webhooks"** section (scroll down):

1. Click **"Add Callback URL"** or **"Edit"**

2. **Enter exactly:**
   - **Callback URL:** `https://chatbot-platform-v2.vercel.app/api/webhooks/messenger`
   - **Verify Token:** The token YOU just created in Step 8

3. Click **"Verify and Save"**

4. If it says ✅ verified, great!
   If it says ❌ failed:
   - Check the URL is exact
   - Make sure your Vercel app is deployed
   - Try again in 2 minutes

5. **Check the boxes:**
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - Click **"Subscribe"**

6. **Subscribe to Page:**
   - Find your page in the list below
   - Click **"Subscribe"** next to it

---

### 🎉 DONE! You Have Everything!

You should now have written down:

```env
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123def456...
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAGxxxxxxx... (very long)
VITE_MESSENGER_VERIFY_TOKEN=my_secure_token_2025
```

---

## 🚀 Add to Your Project

### Step 1: Add to .env file

Open your `.env` file and add:

```env
VITE_MESSENGER_APP_ID=123456789012345
VITE_MESSENGER_APP_SECRET=abc123def456...
VITE_MESSENGER_PAGE_ACCESS_TOKEN=EAAGxxxxxxx...
VITE_MESSENGER_VERIFY_TOKEN=my_secure_token_2025
```

### Step 2: Add to Vercel

Open PowerShell:

```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

vercel env add VITE_MESSENGER_APP_ID
# Paste: 123456789012345

vercel env add VITE_MESSENGER_APP_SECRET
# Paste your secret

vercel env add VITE_MESSENGER_PAGE_ACCESS_TOKEN
# Paste: EAAG...

vercel env add VITE_MESSENGER_VERIFY_TOKEN
# Paste: my_secure_token_2025
```

### Step 3: Deploy

```powershell
vercel --prod
```

Wait 2 minutes for deployment.

---

## 🧪 Quick Test

1. Go to: https://developers.facebook.com/tools/explorer/
2. Click "Get Token" → "Page Access Tokens"
3. Select your page
4. Type: `me`
5. Click "Submit"
6. Should show your page name ✅

---

## 😰 Stuck? Common Problems:

### "I don't see Messenger in products"
→ Look for "+ Add Product" or "Products +" in sidebar

### "Generate Token is gray/disabled"
→ Click "Add or Remove Pages" first, select your page

### "Webhook verification failed"
→ Wait 2 minutes after deploying, verify URL is exact, check verify token matches

### "I can't find the settings"
→ Look at the LEFT sidebar for "Settings" → "Basic"

### "Token expired"
→ Go back to Access Tokens, click "Generate Token" again

---

## 📍 Where Am I?

**If you're lost, check the URL:**
- `developers.facebook.com/apps/` → You're at the apps list (start here)
- `developers.facebook.com/apps/[NUMBER]/` → You're in your app (good!)
- `developers.facebook.com/apps/[NUMBER]/messenger/` → You're in Messenger settings (perfect!)

---

## 🎯 What Each Thing Does

- **App ID** - Identifies your app to Facebook
- **App Secret** - Password for your app (keep secret!)
- **Page Access Token** - Lets your app send messages as your page
- **Verify Token** - Proves to Facebook you own the webhook URL

---

**Still confused? Tell me what step number you're on and what you see on your screen!** 🚀
