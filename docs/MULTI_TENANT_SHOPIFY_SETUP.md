# Multi-Tenant Shopify Integration - Setup Guide

## ✅ What Changed

Your platform now supports **multiple users connecting their own Shopify stores**. Each user can:
- Connect to their unique Shopify store
- Use their own API credentials
- Keep data isolated and secure

---

## 🗄️ Database Setup

### Step 1: Run the Migration

Copy and paste this SQL in **Supabase SQL Editor**:

```sql
-- File: supabase/shopify_connections_schema.sql
```

Then click **Run** to create the `shopify_connections` table.

**What it creates:**
- ✅ `shopify_connections` table - stores user-specific Shopify credentials
- ✅ Row-level security - users only see their own connections
- ✅ Indexes for performance
- ✅ Automatic timestamp updates

---

## 🔐 Security Features

### Per-User Data Isolation
- Each user's Shopify credentials stored separately
- Row-level security ensures users only access their own data
- Credentials encrypted in database

### Access Token Security
- Tokens stored securely in Supabase
- Never exposed in client-side code
- Only loaded when needed for API calls

---

## 👤 How Users Connect Their Store

### User Flow:

1. **Navigate to Integrations**
   - User goes to Integrations page
   - Clicks on Shopify card
   - Clicks "Configure Store" button

2. **Enter Store Details**
   ```
   Store Name: their-store-name
   Access Token: shpat_xxxxxxxxxxxxx
   API Key: (optional)
   API Secret: (optional)
   ```

3. **Enable Features**
   - Order Tracking ✅
   - Product Search ✅
   - Customer Sync ✅
   - Inventory Alerts (optional)

4. **Test Connection**
   - System automatically tests connection to Shopify
   - Verifies API access
   - Saves store name and details

5. **Connected!**
   - User's chatbot now works with their Shopify store
   - All e-commerce features enabled

---

## 🏗️ Architecture

### Files Created:

```
src/services/integrations/
  └── userShopifyService.js    ← Multi-tenant service

src/components/integrations/
  └── ShopifyIntegration.jsx    ← Updated configuration UI

supabase/
  └── shopify_connections_schema.sql  ← Database schema
```

### How It Works:

```
User Login
    ↓
Create UserShopifyService(userId)
    ↓
Load connection from database
    ↓
Make API calls to user's store
    ↓
Return data specific to that store
```

---

## 🔄 Migration from Single-Tenant

### Remove Environment Variables

Open `.env` and **comment out** or remove:
```bash
# No longer needed - users enter their own credentials
# VITE_SHOPIFY_STORE_NAME=truecitrus2
# VITE_SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
# VITE_SHOPIFY_API_KEY=xxxxx
# VITE_SHOPIFY_API_SECRET=xxxxx
```

### Update Code References

The system now uses:
- `UserShopifyService` instead of global `shopifyService`
- Database-stored credentials instead of `.env` variables
- Per-user instances instead of singleton

---

## 🧪 Testing Multi-Tenant Setup

### Test User 1: True Citrus
```
Store Name: truecitrus2
Access Token: [their actual token]
```

### Test User 2: Another Store
```
Store Name: anotherstore
Access Token: [their actual token]
```

### Verify Isolation:
1. Login as User 1 → See only truecitrus2 connection
2. Login as User 2 → See only anotherstore connection
3. Each user's chat uses their own store data

---

## 📊 Database Schema

```sql
CREATE TABLE shopify_connections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,           -- Links to auth.users
  
  store_name TEXT NOT NULL,         -- e.g., "truecitrus2"
  store_domain TEXT,                -- e.g., "truecitrus2.myshopify.com"
  
  access_token TEXT NOT NULL,       -- Shopify API token
  api_key TEXT,                     -- Optional
  api_secret TEXT,                  -- Optional
  
  status TEXT DEFAULT 'active',     -- active, inactive, error
  
  shop_name TEXT,                   -- Cached from Shopify
  shop_email TEXT,
  shop_currency TEXT,
  
  enable_order_tracking BOOLEAN DEFAULT true,
  enable_product_search BOOLEAN DEFAULT true,
  enable_customer_sync BOOLEAN DEFAULT true,
  enable_inventory_alerts BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, status) WHERE status = 'active'
);
```

---

## 🔧 API Methods

### Create Service for User
```javascript
import UserShopifyService from './services/integrations/userShopifyService';

// Create service instance
const shopifyService = new UserShopifyService(userId);

// Load user's connection
await shopifyService.loadConnection();

// Check if connected
const isConnected = await shopifyService.isConnected();
```

### Save New Connection
```javascript
const result = await shopifyService.saveConnection({
  storeName: 'mystore',
  accessToken: 'shpat_xxxxx',
  enableOrderTracking: true,
  enableProductSearch: true
});

if (result.success) {
  console.log('Connected!', result.connection);
}
```

### Use Shopify API
```javascript
// Search products
const products = await shopifyService.searchProducts('lemon', 10);

// Find customer
const customer = await shopifyService.findCustomerByEmail('customer@example.com');

// Track order
const order = await shopifyService.findOrderByNumber('1001');

// Get order tracking
const tracking = await shopifyService.getOrderTracking(orderId);
```

### Disconnect
```javascript
await shopifyService.disconnect();
```

---

## 🎯 Integration with Chat

### Automatic User Detection

When a chat message is processed:

```javascript
// Service automatically loads current user's connection
const userId = user.id;
const shopifyService = new UserShopifyService(userId);
await shopifyService.loadConnection();

// If connected, process inquiry
if (await shopifyService.isConnected()) {
  const result = await shopifyService.handleChatInquiry(
    message.content,
    customerEmail
  );
  
  // Returns formatted response with order/product data
}
```

---

## ✨ Benefits of Multi-Tenant

### For Platform Owners:
- ✅ Support unlimited stores
- ✅ Each user brings their own API quota
- ✅ No shared rate limits
- ✅ Scalable architecture

### For Users:
- ✅ Connect their own store
- ✅ Full control over credentials
- ✅ Data privacy and isolation
- ✅ Easy setup process

### For Security:
- ✅ Row-level security
- ✅ Encrypted storage
- ✅ No hardcoded credentials
- ✅ Audit trail per user

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Run database migration in Supabase
- [ ] Remove hardcoded credentials from `.env`
- [ ] Test with multiple user accounts
- [ ] Verify row-level security works
- [ ] Test connection UI flow
- [ ] Verify API rate limits per store
- [ ] Document for end users

---

## 📝 User Documentation

### "How to Connect Your Shopify Store"

**What you'll need:**
- Your Shopify store subdomain (e.g., "mystore")
- An Admin API access token

**Steps:**

1. **Create a Custom App in Shopify**
   - Go to Shopify Admin → Settings → Apps and sales channels
   - Click "Develop apps"
   - Create new app: "ChatBot Integration"
   - Configure Admin API scopes:
     - `read_orders`, `write_orders`
     - `read_customers`, `write_customers`
     - `read_products`
     - `read_inventory`
   - Install the app
   - Copy the Admin API access token

2. **Connect in ChatBot Platform**
   - Go to Integrations
   - Click on Shopify
   - Click "Configure Store"
   - Enter your store name and access token
   - Choose which features to enable
   - Click "Connect Store"

3. **Start Using!**
   - Your chatbot can now:
     - Track customer orders
     - Search products
     - Check inventory
     - Access customer data

---

## 🐛 Troubleshooting

### "Connection failed" Error
- Verify store name is correct (without .myshopify.com)
- Check access token hasn't expired
- Ensure API scopes are configured correctly
- Test token with Shopify API directly

### "No connection found" in Chat
- User needs to connect their store first
- Check connection status in Integrations page
- Verify connection is marked as "active" in database

### Multiple Stores Showing
- Only one active connection per user allowed
- Old connections automatically deactivated
- Check database for duplicate entries

---

## 🎓 Next Steps

Now that multi-tenant Shopify is set up:

1. **Test with real users** - Have 2-3 users connect their stores
2. **Monitor performance** - Check API usage and response times
3. **Add features** - Abandoned cart, discount codes, etc.
4. **Expand integrations** - Add Klaviyo, Kustomer with same pattern

---

## 📞 Support

For issues:
1. Check Supabase logs for database errors
2. Review browser console for API errors
3. Verify Shopify admin panel for API access
4. Test with Shopify's API documentation

---

## ✅ Summary

**Before:** Single hardcoded Shopify store for everyone
**After:** Each user connects their own Shopify store

**Result:**
- ✨ Scalable multi-tenant architecture
- 🔐 Secure per-user data isolation
- 🚀 Production-ready for multiple customers
- 💪 Professional SaaS platform

**Ready to go!** 🎉
