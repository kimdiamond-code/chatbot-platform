# 🎯 API Consolidation Fix - Vercel Hobby Plan

## Problem Solved
Vercel Hobby plan limits deployments to **12 serverless functions**. The previous API structure had **14+ endpoints**, causing deployment failures.

## Solution
Consolidated all API endpoints into **5 unified handlers** (well under the limit):

### ✅ New API Structure (5 Functions Total)

1. **`/api/index.js`** - API router & documentation
2. **`/api/database.js`** - All database operations (unchanged)
3. **`/api/shopify-unified.js`** - Shopify OAuth, Products, Cart, Orders, Customers, Inventory
4. **`/api/integrations-unified.js`** - Kustomer, Klaviyo, Messenger integrations
5. **`/api/scraping-unified.js`** - Web scraping, site discovery, knowledge base

---

## 📋 Migration Steps

### 1. Install New Dependencies
```bash
npm install cheerio
```

### 2. Clean Up Old API Files
```bash
CLEANUP_OLD_API.bat
```

This removes:
- `/api/shopify/*` (6 files)
- `/api/shopify/oauth/*` (2 files)
- `/api/kustomer/*` (3+ files)
- `/api/scrape-*.js` (2 files)
- Old `/api/shopify.js` and `/api/kustomer.js`

### 3. Deploy
```bash
npm run clean:build
vercel --prod
```

---

## 🔌 Updated API Endpoints

### Database API (Unchanged)
```javascript
POST /api/database
{
  "action": "testConnection",
  "action": "getBotConfigs",
  "action": "createConversation",
  // ... (all existing actions work the same)
}
```

### Shopify API (Consolidated)
```javascript
POST /api/shopify-unified
{
  "action": "oauth:initiate",
  "shop": "your-store",
  "organizationId": "uuid"
}

POST /api/shopify-unified
{
  "action": "products:list",
  "organizationId": "uuid",
  "limit": 50
}

POST /api/shopify-unified
{
  "action": "cart:abandoned",
  "organizationId": "uuid"
}
```

**Available actions:**
- **OAuth:** `oauth:initiate`, `oauth:callback`, `oauth:verify`
- **Products:** `products:list`, `products:get`, `products:search`
- **Cart:** `cart:abandoned`, `cart:create`
- **Orders:** `orders:list`, `orders:get`
- **Customers:** `customers:list`, `customers:search`
- **Inventory:** `inventory:check`

### Integrations API (Consolidated)
```javascript
POST /api/integrations-unified
{
  "integration": "kustomer",
  "action": "connect",
  "organizationId": "uuid",
  "apiKey": "your-key"
}

POST /api/integrations-unified
{
  "integration": "klaviyo",
  "action": "sendEmail",
  "organizationId": "uuid",
  "email": "user@example.com",
  "data": {...}
}
```

**Supported integrations:**
- **Kustomer:** `connect`, `test`, `sync`, `disconnect`
- **Klaviyo:** `connect`, `test`, `sendEmail`, `disconnect`
- **Messenger:** `connect`, `webhook`, `send`, `disconnect`

**General actions:**
- `list` - List all integrations
- `status` - Check integration status

### Scraping API (Consolidated)
```javascript
POST /api/scraping-unified
{
  "action": "scrape:page",
  "url": "https://example.com/page",
  "selector": ".main-content" // optional
}

POST /api/scraping-unified
{
  "action": "scrape:discover",
  "url": "https://example.com",
  "maxDepth": 2,
  "maxPages": 50
}

POST /api/scraping-unified
{
  "action": "scrape:save",
  "organizationId": "uuid",
  "url": "https://example.com",
  "title": "Page Title",
  "content": "Page content..."
}
```

**Available actions:**
- `scrape:page` - Scrape single page
- `scrape:discover` - Discover all pages on site
- `scrape:batch` - Scrape multiple URLs
- `scrape:save` - Save to knowledge base
- `scrape:list` - List scraped pages

---

## 🔄 Frontend Integration Updates

### Old Code (❌ Will Break)
```javascript
// OLD - Multiple endpoints
await fetch('/api/shopify/products')
await fetch('/api/shopify/cart')
await fetch('/api/kustomer/connections')
await fetch('/api/scrape-page')
```

### New Code (✅ Use This)
```javascript
// NEW - Unified endpoints with actions
await fetch('/api/shopify-unified', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'products:list',
    organizationId: 'uuid',
    limit: 50
  })
})

await fetch('/api/integrations-unified', {
  method: 'POST',
  body: JSON.stringify({
    integration: 'kustomer',
    action: 'test',
    organizationId: 'uuid'
  })
})

await fetch('/api/scraping-unified', {
  method: 'POST',
  body: JSON.stringify({
    action: 'scrape:page',
    url: 'https://example.com'
  })
})
```

---

## 🛠️ Frontend Service Updates Needed

Update these files to use new unified endpoints:

### 1. Shopify Service
```javascript
// src/services/shopifyService.js

export const shopifyService = {
  async initiateOAuth(shop, organizationId) {
    const response = await fetch('/api/shopify-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'oauth:initiate',
        shop,
        organizationId
      })
    });
    return response.json();
  },

  async getProducts(organizationId, limit = 50) {
    const response = await fetch('/api/shopify-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'products:list',
        organizationId,
        limit
      })
    });
    return response.json();
  },

  async getAbandonedCarts(organizationId) {
    const response = await fetch('/api/shopify-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cart:abandoned',
        organizationId
      })
    });
    return response.json();
  }
};
```

### 2. Integrations Service
```javascript
// src/services/integrationsService.js

export const integrationsService = {
  async connectKustomer(organizationId, apiKey) {
    const response = await fetch('/api/integrations-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integration: 'kustomer',
        action: 'connect',
        organizationId,
        apiKey
      })
    });
    return response.json();
  },

  async listIntegrations(organizationId) {
    const response = await fetch('/api/integrations-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list',
        organizationId
      })
    });
    return response.json();
  }
};
```

### 3. Scraping Service
```javascript
// src/services/scrapingService.js

export const scrapingService = {
  async scrapePage(url, selector) {
    const response = await fetch('/api/scraping-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'scrape:page',
        url,
        selector
      })
    });
    return response.json();
  },

  async discoverSite(url, maxDepth = 2) {
    const response = await fetch('/api/scraping-unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'scrape:discover',
        url,
        maxDepth,
        maxPages: 50
      })
    });
    return response.json();
  }
};
```

---

## ✅ Deployment Checklist

- [ ] Install `cheerio` dependency
- [ ] Run `CLEANUP_OLD_API.bat` to remove old files
- [ ] Update frontend service files (Shopify, Integrations, Scraping)
- [ ] Test locally with `npm run dev`
- [ ] Verify environment variables in Vercel Dashboard
- [ ] Deploy: `npm run clean:build && vercel --prod`
- [ ] Test all API endpoints after deployment

---

## 📊 Before vs After

### Before (❌ 14+ Functions - Over Limit)
```
api/
├── database.js
├── shopify.js
├── kustomer.js
├── scrape-discover.js
├── scrape-page.js
├── shopify/
│   ├── cart.js
│   ├── customer.js
│   ├── inventory.js
│   ├── orders.js
│   ├── products.js
│   ├── verify.js
│   └── oauth/
│       ├── auth.js
│       └── token.js
└── kustomer/
    ├── connections.js
    └── test-connection.js
```

### After (✅ 5 Functions - Under Limit)
```
api/
├── index.js                    (API router)
├── database.js                 (unchanged)
├── shopify-unified.js          (OAuth + Products + Cart + Orders + Customers + Inventory)
├── integrations-unified.js     (Kustomer + Klaviyo + Messenger)
└── scraping-unified.js         (Page scraping + Site discovery)
```

---

## 🎯 Key Benefits

1. **Deploys Successfully** - Only 5 functions (vs 12 limit)
2. **Better Organization** - Related logic grouped together
3. **Easier Maintenance** - Fewer files to manage
4. **Same Functionality** - All features preserved
5. **More Scalable** - Can add more actions without new functions

---

## 🆘 Troubleshooting

### Error: "Module not found: cheerio"
```bash
npm install cheerio
```

### Error: "API endpoint not found"
Check you're using the new unified endpoint:
- ✅ `/api/shopify-unified`
- ❌ `/api/shopify/products`

### Error: "Invalid action"
Verify action name matches the format:
- Format: `category:action` (e.g., `products:list`, `oauth:initiate`)

### Frontend still using old endpoints
Update service files to use unified endpoints (see examples above)

---

**Last Updated:** October 6, 2025  
**Status:** ✅ Ready for deployment
