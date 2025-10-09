# Troubleshooting: No Response from Product Search

## Quick Diagnostic Tool

Go to **"Shopify Debug"** in the navigation menu (bottom of sidebar). This will run automated tests to identify the issue.

## Common Issues & Solutions

### 1. Shopify Not Connected ❌

**Symptoms:**
- No response when asking about products
- Console shows "No access token"

**Solution:**
1. Go to **Settings → Integrations**
2. Click **Connect Shopify**
3. Follow OAuth flow
4. OR add to `.env` file:
   ```
   VITE_SHOPIFY_STORE_NAME=your-store-name
   VITE_SHOPIFY_ACCESS_TOKEN=your-access-token
   ```

### 2. Products Not in Shopify Store ⚠️

**Symptoms:**
- Connection works but no products shown
- Returns empty array

**Solution:**
1. Add products to your Shopify store
2. Ensure products are **Active** (not Draft)
3. Products must be visible in Online Store channel

### 3. Intent Not Detected 🔍

**Symptoms:**
- Message sent but bot gives generic response
- Console shows no "productSearch" intent

**Solution:**
Use these trigger phrases:
- "looking for [product]"
- "I need [product]"
- "show me [product]"
- "recommend [product]"
- "buy [product]"

### 4. Integration Orchestrator Inactive ⏸️

**Symptoms:**
- Diagnostic shows Shopify disconnected in orchestrator
- Products exist but not returned

**Solution:**
1. Reload the page
2. Go to Integrations and reconnect
3. Check browser console for errors

## Step-by-Step Testing

### Test 1: Manual Shopify Call
Open browser console and run:
```javascript
// Test Shopify connection
const shopify = await import('./services/integrations/shopifyService');
console.log('Store:', shopify.shopifyService.storeName);
console.log('Token:', shopify.shopifyService.accessToken ? 'Present' : 'Missing');

// Test product search
const products = await shopify.shopifyService.searchProducts('test', 3);
console.log('Products found:', products.length);
console.log('First product:', products[0]?.title);
```

### Test 2: Intent Detection
```javascript
const intelligence = await import('./services/chat/chatIntelligence');
const analysis = intelligence.chatIntelligenceService.analyzeMessage('I need headphones');
console.log('Detected intents:', analysis.intents);
// Should include: "productSearch"
```

### Test 3: Full Flow
```javascript
const orchestrator = await import('./services/chat/integrationOrchestrator');
const result = await orchestrator.integrationOrchestrator.processMessage(
  { content: 'show me speakers', sender_type: 'user' },
  { email: 'test@example.com' }
);
console.log('Response:', result.response);
console.log('Products:', result.integrationResults.shopify?.products);
```

## Debugging Console Logs

When testing product search, watch for these console logs:

✅ **Good Flow:**
```
🧠 Processing message: show me speakers
📊 Message analysis: {intents: ["productSearch"], ...}
📋 Response plan: {responseType: "product_recommendations", ...}
🌐 Shopify API: GET /products.json?...
✅ Found 3 products matching "speakers"
```

❌ **Problem Flow:**
```
❌ Shopify access token not configured
// OR
⚠️ Shopify integration inactive (no credentials)
// OR
⚠️ No database credentials found
```

## Environment Variables Checklist

Your `.env` file should have:
```bash
# Shopify
VITE_SHOPIFY_STORE_NAME=your-store
VITE_SHOPIFY_ACCESS_TOKEN=shpat_xxxxx...

# Database (Required for OAuth)
DATABASE_URL=postgresql://...

# Optional (for OAuth flow)
SHOPIFY_CLIENT_ID=...
SHOPIFY_CLIENT_SECRET=...
```

## API Connection Methods

There are TWO ways to connect Shopify:

### Method 1: OAuth (Recommended)
1. Go to Integrations
2. Click "Connect Shopify"
3. Authorize app
4. Credentials stored in database

### Method 2: Manual API Tokens
1. Get custom app token from Shopify Admin
2. Add to `.env` file
3. Restart dev server

## Database Tables Check

Required tables (automatically created):
- `shopify_connections` - OAuth tokens
- `integrations` - Integration metadata

Run this SQL to check:
```sql
SELECT * FROM shopify_connections 
WHERE status = 'active';

SELECT * FROM integrations 
WHERE integration_id = 'shopify' 
AND status = 'connected';
```

## Quick Fixes

### Fix 1: Clear Cache
```javascript
// In browser console
const shopify = await import('./services/integrations/shopifyService');
shopify.shopifyService.clearCache();
```

### Fix 2: Force Reconnect
1. Delete from browser: localStorage, sessionStorage
2. Reload page
3. Reconnect in Integrations

### Fix 3: Use Test Message Button
1. Go to Live Chat
2. Click "Test Smart Response" button
3. Should auto-send "I need help finding some good headphones"
4. Watch console for logs

## Still Not Working?

### Check Logs in Console

Look for:
- ❌ Red errors (connection failures)
- ⚠️ Yellow warnings (missing config)
- 🔍 Search for "Shopify" in console logs

### Verify Shopify Admin

1. Go to: `https://your-store.myshopify.com/admin`
2. Click **Products**
3. Confirm products exist and are Active
4. Check **Settings → Apps and sales channels**
5. Verify custom app has product read permissions

### Test with Curl

```bash
curl -X GET \
  "https://your-store.myshopify.com/admin/api/2024-10/products.json?limit=3" \
  -H "X-Shopify-Access-Token: your-token"
```

Should return JSON with products array.

## Contact Points

If all else fails, check:
1. **Shopify Integration Code:** `src/services/integrations/shopifyService.js`
2. **Chat Intelligence:** `src/services/chat/chatIntelligence.js`
3. **Integration Orchestrator:** `src/services/chat/integrationOrchestrator.js`
4. **Message Hook:** `src/hooks/useMessages.js`

## Success Checklist

When working correctly, you should see:

✅ Shopify Debug shows all green
✅ Console shows "✅ Shopify integration active"
✅ Asking about products returns product cards
✅ Products have images and prices
✅ Add to Cart button appears
✅ Clicking Add to Cart creates draft order

---

**Need more help?** Run the diagnostic tool first - it will tell you exactly what's wrong!
