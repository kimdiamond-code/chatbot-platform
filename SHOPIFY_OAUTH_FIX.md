# Shopify OAuth Fix - Action Required

## Problem Identified
The Shopify OAuth redirect URI was pointing to `/shopify/callback`, but the app handles OAuth parameters on the main route `/`. This mismatch was causing the "invalid action or endpoint" error.

## Changes Made

### 1. Local Environment (.env)
✅ Updated `SHOPIFY_REDIRECT_URI` to: `https://chatbot-platform-v2.vercel.app/`
✅ Updated API fallback to use main route instead of `/shopify/callback`

### 2. Next Steps (Action Required)

#### A. Update Vercel Environment Variables
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Navigate to your project: **chatbot-platform-v2**
3. Go to **Settings** → **Environment Variables**
4. Find `SHOPIFY_REDIRECT_URI` and update it to:
   ```
   https://chatbot-platform-v2.vercel.app/
   ```
5. Click **Save**
6. Redeploy the application (or it will auto-deploy on next push)

#### B. Update Shopify Partner Dashboard
1. Go to https://partners.shopify.com/
2. Navigate to **Apps** → Your app
3. Go to **App setup** → **URLs**
4. Find **Allowed redirection URL(s)**
5. Update the URL to:
   ```
   https://chatbot-platform-v2.vercel.app/
   ```
6. Add a second URL for local testing:
   ```
   http://localhost:5173/
   ```
7. Click **Save**

### 3. Test the OAuth Flow

After making the above changes:

1. Clear your browser cache/cookies
2. Go to your chatbot platform
3. Navigate to **Integrations** → **Shopify**
4. Enter your store name (e.g., "truecitrus2")
5. Click **Connect with OAuth**
6. You should be redirected to Shopify for authorization
7. After approving, you'll be redirected back to your app
8. The integration should now connect successfully

### 4. How It Works Now

**OAuth Flow:**
```
User clicks "Connect with OAuth"
    ↓
App calls /api/consolidated with action: shopify_oauth_initiate
    ↓
API generates: https://chatbot-platform-v2.vercel.app/
    ↓
Redirects to Shopify authorization page
    ↓
User approves permissions
    ↓
Shopify redirects to: https://chatbot-platform-v2.vercel.app/?code=xxx&shop=xxx
    ↓
App.jsx detects OAuth params and shows Integrations page
    ↓
Frontend calls /api/consolidated with action: shopify_oauth_callback
    ↓
API exchanges code for access token and saves to database
    ↓
Success! Integration connected
```

## Troubleshooting

### If you still get "invalid action or endpoint":
1. Verify Vercel env vars are saved correctly
2. Check that Shopify redirect URI matches exactly
3. Make sure you've redeployed after updating env vars
4. Try in an incognito window to rule out cached data

### If Shopify shows "redirect_uri mismatch":
- The URL in Shopify Partner Dashboard must **exactly** match the one in your Vercel env vars
- Don't forget the trailing slash consistency

### If the integration connects but doesn't work:
- Verify `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` are correct in Vercel
- Check that the scopes match what your Shopify app is approved for

## Environment Variables Reference

Required in Vercel:
```
SHOPIFY_CLIENT_ID=a5a524c7efb937e6e1817df60eeaf499
SHOPIFY_CLIENT_SECRET=dbd00a9649291665300299e413fdc4aa
SHOPIFY_REDIRECT_URI=https://chatbot-platform-v2.vercel.app/
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,read_locations
```

## Deploy Command

After updating Vercel env vars, redeploy:
```bash
git add .
git commit -m "Fix Shopify OAuth redirect URI"
git push
```

Or use Vercel CLI:
```bash
vercel --prod
```
