# Shopify OAuth - Complete Fix

## ✅ Changes Made (Local)

### 1. Created AppRouter Component
**File:** `src/AppRouter.jsx`
- Routes requests to `/shopify/callback` → `ShopifyCallback` component
- All other routes → Main `App` component
- No React hook rule violations

### 2. Updated Main Entry Point
**File:** `src/main.jsx`
- Changed from `import App` to `import AppRouter`
- Now properly handles `/shopify/callback` route

### 3. Fixed Redirect URI
**Files:** `.env` and `api/consolidated.js`
- Changed back to: `https://chatbot-platform-v2.vercel.app/shopify/callback`
- API now generates correct OAuth URLs

## 🚀 Deploy Now

Run:
```bash
vercel --prod
```

## ⚙️ After Deployment - Update Vercel

1. Go to: https://vercel.com/dashboard
2. Navigate to: **chatbot-platform-v2** → **Settings** → **Environment Variables**
3. Update `SHOPIFY_REDIRECT_URI` to:
   ```
   https://chatbot-platform-v2.vercel.app/shopify/callback
   ```
4. Click **Save**
5. **Redeploy** (click "Redeploy" on latest deployment)

## 📋 Test OAuth Flow (Dev Store)

1. Hard refresh browser (Ctrl+Shift+R)
2. Go to **Integrations** → **Shopify** → **OAuth**
3. Enter dev store name
4. Click **"Connect with OAuth"**
5. Authorize on Shopify
6. **You'll be redirected to** `/shopify/callback`
7. The `ShopifyCallback` component will:
   - Exchange code for access token
   - Save credentials to database
   - Redirect to Integrations page
8. **Store should now show as CONNECTED** ✅

## ⚠️ "Unauthorized Access" for Other Stores

This happens because your app is in **Draft** mode. To fix:

### Option 1: Enable Custom Distribution (Recommended for Testing)

1. In Shopify Partner Dashboard
2. Click **"Distribution"** tab
3. Select **"Custom distribution"**
4. Copy the install link
5. Share with specific stores

### Option 2: Add Test Stores

1. **Distribution** → **Test your app**
2. Add development stores that can install

### Option 3: Submit to App Store (For Public Access)

1. Complete app listing
2. Submit for review
3. Once approved, any store can install

## 🔍 Debug Commands

If issues persist:

**Check current deployment:**
```bash
vercel ls
```

**View logs:**
```bash
vercel logs
```

**Check environment variables:**
```bash
vercel env ls
```

## Expected Flow

```
User → Click "Connect OAuth"
  ↓
API generates OAuth URL with /shopify/callback redirect
  ↓
Shopify authorization page
  ↓
User approves
  ↓
Redirect to: /shopify/callback?code=xxx&shop=xxx
  ↓
AppRouter detects /shopify/callback path
  ↓
Renders ShopifyCallback component
  ↓
Component exchanges code for access token
  ↓
Saves to database
  ↓
Redirects to /integrations?shopify=connected
  ↓
SUCCESS ✅
```

## Next Steps

1. ✅ Deploy with `vercel --prod`
2. ✅ Update Vercel env var
3. ✅ Test with dev store
4. 🔧 Enable custom distribution for other stores
5. 🎉 OAuth working for multiple stores!
