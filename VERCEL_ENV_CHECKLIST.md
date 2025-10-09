# Environment Variables Checklist for Vercel

## ✅ REQUIRED - Add to Vercel Dashboard

### 1. **DATABASE_URL** (Critical)
```
postgresql://neondb_owner:npg_oO90iBtIxymP@ep-super-snow-addw8m42-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```
- **Where:** Vercel Dashboard → Project Settings → Environment Variables
- **Scope:** Production, Preview, Development
- **Used by:** All database operations via `/api/database.js`

### 2. **VITE_OPENAI_API_KEY** (Required for AI Chat)
```
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
```
- **Where:** Vercel Dashboard → Project Settings → Environment Variables
- **Scope:** Production, Preview, Development
- **Used by:** OpenAI chat functionality
- **Note:** Prefix with `VITE_` to expose to client-side code

### 3. **Shopify OAuth** (Required for Shopify Integration)

**SHOPIFY_CLIENT_ID**
```
a5a524c7efb937e6e1817df60eeaf499
```

**SHOPIFY_CLIENT_SECRET**
```
dbd00a9649291665300299e413fdc4aa
```

**SHOPIFY_REDIRECT_URI**
```
https://chatbot-platform-v2.vercel.app/shopify/callback
```

**SHOPIFY_SCOPES**
```
read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,read_locations
```

- **Where:** Vercel Dashboard → Project Settings → Environment Variables
- **Scope:** Production, Preview (use different redirect URI for preview)
- **Used by:** `/api/shopify.js` OAuth flow

---

## ⚠️ OPTIONAL - Can be added later

### 4. **VITE_OPENAI_ORG_ID** (Optional)
```
org-8J5v1gk2mYq6bZt3pX9pD3BlbkFJbVjyNwzxLyKJmbkLDPoLVSLnN-B0DCjEAnws6L_5P3kM-xNM56XwauRNEf4ZQ62HQAboGVN68A
```
- Only needed if using OpenAI organization accounts

### 5. **GitHub OAuth** (If implementing GitHub login)
- GITHUB_ID
- GITHUB_SECRET

### 6. **VITE_KUSTOMER_API_KEY** (Placeholder - not actively used)
```
your-actual-kustomer-key
```

---

## 🚫 REMOVED - DO NOT ADD

These are deprecated and should NOT be in Vercel:
- ❌ VITE_SUPABASE_URL (Platform migrated to Neon)
- ❌ VITE_SUPABASE_ANON_KEY (Platform migrated to Neon)

---

## 📋 How to Add to Vercel

### Method 1: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project: `chatbot-platform-v2`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. For each variable:
   - Enter **Key** (e.g., `DATABASE_URL`)
   - Enter **Value** (paste the value)
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

### Method 2: Via Vercel CLI
```bash
# Single variable
vercel env add DATABASE_URL production

# From .env file (be selective)
vercel env pull .env.local
```

---

## 🔍 Verification Checklist

After adding environment variables:

1. **Redeploy** the project:
   ```bash
   vercel --prod
   ```

2. **Check deployment logs** for:
   - ✅ No "undefined" environment variable errors
   - ✅ Database connection successful
   - ✅ OpenAI API initialized

3. **Test key features**:
   - [ ] Live Chat works (tests DATABASE_URL + VITE_OPENAI_API_KEY)
   - [ ] Shopify OAuth flow (tests SHOPIFY_* variables)
   - [ ] Analytics loading (tests DATABASE_URL)

---

## 🔐 Security Notes

- Never commit `.env` file to git
- Rotate API keys if accidentally exposed
- Use different values for Preview/Development if needed
- OpenAI keys starting with `sk-proj-` are project-scoped (good!)
- Database connection string includes credentials - keep secure

---

## 📊 Current Status

| Variable | Added to .env | Needs Vercel | Status |
|----------|---------------|--------------|--------|
| DATABASE_URL | ✅ | ✅ | **CRITICAL** |
| VITE_OPENAI_API_KEY | ✅ | ✅ | **CRITICAL** |
| SHOPIFY_CLIENT_ID | ✅ | ✅ | Required for Shopify |
| SHOPIFY_CLIENT_SECRET | ✅ | ✅ | Required for Shopify |
| SHOPIFY_REDIRECT_URI | ✅ | ✅ | Required for Shopify |
| SHOPIFY_SCOPES | ✅ | ✅ | Required for Shopify |
| VITE_OPENAI_ORG_ID | ✅ | ⚠️ | Optional |
| GITHUB_ID | ✅ | ⚠️ | If using GitHub OAuth |
| GITHUB_SECRET | ✅ | ⚠️ | If using GitHub OAuth |

---

## 🎯 Next Steps

1. **Add the 6 critical variables to Vercel Dashboard**
2. **Redeploy:** `vercel --prod`
3. **Test:** Visit https://chatbot-platform-v2.vercel.app
4. **Verify:** Check Live Chat works without errors

---

**Last Updated:** October 3, 2025
