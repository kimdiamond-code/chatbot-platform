# Shopify Store Connection Issue - CRITICAL FIX NEEDED

## Problem Summary

The chatbot is connected to the **WRONG Shopify store**!

### Current Situation:
- **Connected to**: `agentstack-stuff` (demo/test store)
- **Should be**: `true-citrus` (your actual store with real orders)
- **Result**: Bot finds 0 orders because it's searching the wrong store

### Evidence from Logs:
```
✅ Shopify credentials found: {shopDomain: 'agentstack-stuff', hasToken: true}
📧 Fetching orders for email: johnsmith@email.com
✅ Found 0 orders for email
```

## How to Fix

### Option 1: Reconnect Shopify (Recommended)

1. **Go to the Integrations page**
2. **Find Shopify integration**
3. **Click "Disconnect"**
4. **Click "Connect" again**
5. **When prompted, use your True Citrus store:**
   - Store name: `true-citrus`
   - Or use the full URL: `https://true-citrus.myshopify.com`

### Option 2: Update Database Directly

Run this SQL query in your Neon database:

```sql
UPDATE integrations
SET 
  credentials_encrypted = jsonb_set(
    credentials_encrypted::jsonb,
    '{shopDomain}',
    '"true-citrus"'
  )::text,
  config = jsonb_set(
    config::jsonb,
    '{shop}',
    '"true-citrus"'
  )
WHERE 
  organization_id = '00000000-0000-0000-0000-000000000001'
  AND integration_id = 'shopify';
```

### Option 3: Update via API

Run this in browser console on your chatbot page:

```javascript
await fetch('/api/consolidated', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: 'database',
    action: 'saveIntegrationCredentials',
    integration: 'shopify',
    organizationId: '00000000-0000-0000-0000-000000000001',
    credentials: {
      shopDomain: 'true-citrus',
      accessToken: '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',
      shop: 'true-citrus'
    }
  })
}).then(r => r.json()).then(console.log)
```

## Additional Issues to Fix

### 1. Privacy Service Error (500)

The `privacyService.logDataAccess()` is failing. We need to:
- Check if the `data_access_log` table exists
- Add error handling to make logging non-blocking
- Or disable privacy logging temporarily

### 2. Order Search Issues

Even when connected to the right store, the email filter might not work. The API logs show:

```
⚠️ No orders matched email filter
```

This could be because:
- Test email `johnsmith@email.com` doesn't exist in your store
- Shopify's email parameter isn't working correctly
- Need to use actual customer emails from your store

## Testing After Fix

1. **Reconnect to `true-citrus` store**
2. **Test with a REAL customer email from your Shopify store**
3. **Try these test scenarios:**
   ```
   User: "track my order"
   Bot: "I'll help you track your order. What's your email?"
   User: [REAL EMAIL FROM YOUR SHOPIFY STORE]
   Bot: Should show actual orders
   ```

## Next Steps

1. ✅ **PRIORITY 1**: Reconnect Shopify to `true-citrus` store
2. ✅ **PRIORITY 2**: Test with real customer email
3. ✅ **PRIORITY 3**: Fix privacy service 500 error
4. Test order tracking flow end-to-end

---

**Status**: 🔴 CRITICAL - Wrong store connected
**Impact**: Order tracking completely broken
**Fix Time**: 5 minutes (reconnect Shopify)
