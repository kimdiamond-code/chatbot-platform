# 🚀 Shopify OAuth Integration - Complete Setup Guide

## ✅ What's Been Configured

Your Shopify OAuth integration is now set up with:

1. **Environment Variables** (`.env`)
   - ✅ `SHOPIFY_CLIENT_ID`: 1209816bfe4d73b67e9d90c19dc984d9
   - ✅ `SHOPIFY_CLIENT_SECRET`: 749dc6236bfa6f6948ee4c39e0d52c37
   - ✅ `SHOPIFY_REDIRECT_URI`: https://chatbot-platform-v2.vercel.app/shopify/callback
   - ✅ `SHOPIFY_SCOPES`: Full product, order, and customer access

2. **Backend API Routes**
   - ✅ `/api/shopify/oauth/auth.js` - Initiates OAuth flow
   - ✅ `/api/shopify/oauth/token.js` - Exchanges code for access token

3. **Frontend Components**
   - ✅ `ShopifyOAuthConfiguration.jsx` - OAuth UI with 3 connection methods
   - ✅ `ShopifyCallback.jsx` - Handles OAuth callback
   - ✅ Router updated with `/shopify/callback` route

4. **Database Schema**
   - ✅ `oauth_states` table - Stores temporary OAuth state tokens
   - ✅ `shopify_apps` table - Stores OAuth installations per organization

---

## 📋 Setup Steps

### Step 1: Run Database Migration

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `aidefvxiaaekzwflxqtd`
3. Go to **SQL Editor**
4. Copy the entire contents of `database_oauth_states.sql`
5. Paste into SQL Editor
6. Click **Run** to execute

**Verify tables created:**
```sql
SELECT * FROM oauth_states LIMIT 1;
SELECT * FROM shopify_apps LIMIT 1;
```

---

### Step 2: Update Shopify App Configuration

1. Go to **Shopify Partners Dashboard**: https://partners.shopify.com
2. Click on **Apps** in the left sidebar
3. Select your app (or create a new app if you haven't already)
4. Under **App setup** → **URLs**, configure:

   **App URL:**
   ```
   https://chatbot-platform-v2.vercel.app
   ```

   **Allowed redirection URL(s):**
   ```
   https://chatbot-platform-v2.vercel.app/shopify/callback
   ```

5. Under **App setup** → **API access scopes**, ensure these are selected:
   - ✅ `read_products`
   - ✅ `write_products`
   - ✅ `read_orders`
   - ✅ `write_orders`
   - ✅ `read_customers`
   - ✅ `write_customers`
   - ✅ `read_inventory`
   - ✅ `read_locations`

6. Click **Save**

---

### Step 3: Deploy to Vercel

**Option A: Using the Deployment Script (Recommended)**
```bash
DEPLOY_SHOPIFY_OAUTH.bat
```

**Option B: Manual Deployment**
```bash
npm install
npm run build
vercel --prod
```

**After deployment, you MUST add environment variables to Vercel:**

1. Go to: https://vercel.com/dashboard
2. Select your project: `chatbot-platform-v2`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   | Name | Value |
   |------|-------|
   | `SHOPIFY_CLIENT_ID` | `1209816bfe4d73b67e9d90c19dc984d9` |
   | `SHOPIFY_CLIENT_SECRET` | `749dc6236bfa6f6948ee4c39e0d52c37` |
   | `SHOPIFY_REDIRECT_URI` | `https://chatbot-platform-v2.vercel.app/shopify/callback` |
   | `SHOPIFY_SCOPES` | `read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,read_locations` |

5. After adding variables, **redeploy** the application

---

### Step 4: Test OAuth Flow

1. **Go to your platform:**
   ```
   https://chatbot-platform-v2.vercel.app
   ```

2. **Navigate to Integrations:**
   - Click hamburger menu (☰)
   - Select **Integrations**
   - Click **Shopify** card

3. **Connect via OAuth:**
   - Select **🚀 OAuth (Best)** tab
   - Enter your store name (e.g., `truecitrus2`)
   - Click **Connect with OAuth**

4. **Authorize on Shopify:**
   - You'll be redirected to Shopify
   - Review the permissions requested
   - Click **Install app**

5. **Automatic Redirect:**
   - You'll be automatically redirected back
   - Should see "Success! Connected" message
   - Your store is now connected!

---

## 🎯 Three Connection Methods

Your platform now supports three ways to connect Shopify:

### 1. 🚀 OAuth (Best) - Recommended
- **Fastest setup** - Just one click
- **Most secure** - Tokens managed by Shopify
- **Automatic permissions** - No manual token creation
- **Easy management** - Revoke from Shopify admin

### 2. 🔑 API Token - Advanced
- Full API connection with manual token
- Requires creating custom app in Shopify
- Good for developers who need full control

### 3. ⚡ Quick Start - Limited
- Basic store linking only
- No real-time data
- Good for testing or simple use cases

---

## 🔍 Troubleshooting

### Problem: "Invalid OAuth state"
**Solution:** Clear cookies and try again. OAuth states expire after 15 minutes.

### Problem: "Failed to exchange code for token"
**Solution:** 
1. Verify environment variables are set in Vercel
2. Check that Client ID and Secret match in Shopify Partners
3. Ensure redirect URI matches exactly

### Problem: Redirect not working
**Solution:**
1. Check Shopify app settings - redirect URL must be exact
2. Verify Router.jsx includes `/shopify/callback` route
3. Clear browser cache

### Problem: "Connection failed"
**Solution:**
1. Check browser console for errors
2. Verify database tables exist: `oauth_states`, `shopify_apps`
3. Check Vercel deployment logs

---

## 🔐 Security Notes

- OAuth tokens are encrypted and stored securely in Supabase
- State tokens expire after 15 minutes for security
- Tokens can be revoked anytime from Shopify admin
- All API calls use HTTPS
- CORS is properly configured

---

## 📊 What Happens Behind the Scenes

1. **User clicks "Connect with OAuth"**
   - Frontend calls `/api/shopify/oauth/auth`
   - Creates secure state token in database
   - Redirects user to Shopify authorization page

2. **User authorizes on Shopify**
   - Shopify redirects back with authorization code
   - `/shopify/callback` page receives the code

3. **Token exchange**
   - Frontend calls `/api/shopify/oauth/token`
   - Backend exchanges code for permanent access token
   - Verifies state token for security
   - Stores token in `shopify_apps` table
   - Updates `integrations` table

4. **Connection complete**
   - User redirected to Integrations page
   - Store is now fully connected
   - Chatbot can access Shopify data

---

## 🎉 Next Steps After Connection

Once connected, your chatbot can:
- ✅ Search and recommend products
- ✅ Track orders in real-time
- ✅ Access customer information
- ✅ Check inventory status
- ✅ Retrieve store policies
- ✅ Browse collections and categories

**Test it out:**
1. Go to your chatbot preview
2. Ask: "Show me your products"
3. Ask: "Track my order #1234"
4. Ask: "What's your return policy?"

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set
4. Review this guide carefully

---

## 🔄 For Local Development

To test locally:

1. Update `.env`:
   ```
   # Uncomment these lines:
   SHOPIFY_REDIRECT_URI=http://localhost:4000/shopify/callback
   ```

2. Update Shopify app redirect URLs to include:
   ```
   http://localhost:4000/shopify/callback
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

4. Test at: `http://localhost:4000`

---

**Created:** December 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready
