# Shopify Integration for True Citrus Chatbot

## Overview
Complete Shopify integration connecting your chatbot to the True Citrus store with full e-commerce capabilities.

## ✅ What's Included

### API Routes (Server-Side)
All routes are in `/api/shopify/` and are production-ready:

1. **`/api/shopify/verify`** - Test connection
2. **`/api/shopify/customer`** - Customer lookup by email or ID
3. **`/api/shopify/orders`** - Order retrieval and tracking
4. **`/api/shopify/products`** - Product search and details
5. **`/api/shopify/inventory`** - Stock level checks
6. **`/api/shopify/cart`** - Abandoned carts and draft orders

### Frontend Service
- **`productionShopifyService.js`** - Direct API service with caching
- **`useShopify.js`** - React hook for easy integration

### Test Component
- **`ShopifyTest.jsx`** - UI for testing all functions

## 🚀 Quick Start

### 1. Environment Setup
Your `.env` already has True Citrus credentials:
```
VITE_SHOPIFY_STORE_NAME=true-citrus
VITE_SHOPIFY_ACCESS_TOKEN=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
```

### 2. Test the Connection
Add to your router or test page:

```jsx
import ShopifyTest from './components/ShopifyTest';

// Add route
<Route path="/shopify-test" element={<ShopifyTest />} />
```

Then visit: `http://localhost:5173/shopify-test`

### 3. Use in Your Chatbot

```jsx
import { useShopify } from './hooks/useShopify';

function ChatComponent() {
  const shopify = useShopify();
  
  const handleMessage = async (message, customerEmail) => {
    // Auto-detect intent and respond
    const result = await shopify.handleChatInquiry(message, customerEmail);
    
    if (result.type === 'order_tracking' && result.found) {
      return `Your order ${result.data.name} is ${result.data.financialStatus}`;
    }
    
    if (result.type === 'product_search' && result.found) {
      return `I found ${result.data.length} products...`;
    }
  };
}
```

## 📋 Available Functions

### Customer Operations
```javascript
// Find customer by email
const result = await shopify.findCustomer('customer@example.com');

// Get customer details by ID  
const customer = await shopify.getCustomer(customerId);

// Get customer's order history
const orders = await shopify.getCustomerOrders(customerId, 10);
```

### Order Operations
```javascript
// Get specific order
const order = await shopify.getOrder(orderId);

// Find by order number
const order = await shopify.findOrderByNumber('1001');
```

### Product Operations
```javascript
// Search products
const products = await shopify.searchProducts('lemon');

// Get specific product
const product = await shopify.getProduct(productId);

// Get all products
const allProducts = await shopify.getProducts(50);
```

### Inventory Checks
```javascript
// Check variant stock
const stock = await shopify.checkInventory(variantId);

// Check all variants for a product
const inventory = await shopify.checkProductInventory(productId);
```

### Cart & Recovery
```javascript
// Get abandoned carts
const carts = await shopify.getAbandonedCarts(10);

// Get carts for specific customer
const customerCarts = await shopify.getAbandonedCarts(10, 'email@example.com');

// Create draft order (assisted checkout)
const draft = await shopify.createDraftOrder(
  'customer@example.com',
  [
    { variantId: 12345, quantity: 2 },
    { variantId: 67890, quantity: 1 }
  ],
  {
    note: 'Cart recovery offer',
    discount: { type: 'percentage', value: 10 },
    sendInvoice: true
  }
);
```

## 🤖 Chat Integration Examples

### Order Tracking
```javascript
const handleOrderInquiry = async (message, email) => {
  // User: "Where's my order?"
  // User: "Track order 1001"
  
  const result = await shopify.handleChatInquiry(message, email);
  
  if (result.type === 'order_tracking') {
    const order = result.data;
    return `
      Order ${order.name}: ${order.financialStatus}
      Status: ${order.fulfillmentStatus || 'Processing'}
      ${order.trackingInfo?.tracking?.[0]?.tracking_url || ''}
    `;
  }
};
```

### Product Recommendations
```javascript
const handleProductSearch = async (message) => {
  // User: "Looking for lemon products"
  
  const result = await shopify.handleChatInquiry(message);
  
  if (result.type === 'product_search') {
    return result.data.map(p => ({
      title: p.title,
      price: p.variants[0].price,
      url: `https://true-citrus.myshopify.com/products/${p.handle}`,
      image: p.images[0]?.src
    }));
  }
};
```

### Cart Recovery
```javascript
const handleAbandonedCart = async (email) => {
  const carts = await shopify.getAbandonedCarts(5, email);
  
  if (carts.checkouts.length > 0) {
    const cart = carts.checkouts[0];
    
    // Send recovery message
    return {
      message: `You left ${cart.lineItems.length} items in your cart!`,
      items: cart.lineItems,
      recoveryLink: cart.abandonedCheckoutUrl,
      discount: '10% off if you complete now'
    };
  }
};
```

## 🔒 Security Notes

- Access token is stored in environment variables
- All API calls go through secure server-side routes
- No sensitive data exposed to client
- CORS headers configured for your domain

## 🧪 Testing Checklist

1. ✅ Verify connection: `/api/shopify/verify`
2. ✅ Search customer by email
3. ✅ Get customer's orders  
4. ✅ Track specific order
5. ✅ Search products
6. ✅ Check inventory
7. ✅ Get abandoned carts
8. ✅ Create draft order

## 📊 Analytics Integration

Track these Shopify events in your analytics:
- Order lookups
- Product searches
- Cart recoveries
- Customer inquiries
- Conversion from chat

Add to your analytics service:
```javascript
trackEvent('shopify_order_lookup', { orderId, found: true });
trackEvent('shopify_product_search', { query, resultsCount });
trackEvent('shopify_cart_recovery', { cartValue, itemCount });
```

## 🚨 Common Issues

### Connection Failed
- Check `.env` has correct `VITE_SHOPIFY_ACCESS_TOKEN`
- Verify store name is `true-citrus`
- Ensure API version is 2024-10

### Rate Limits
The service includes built-in caching (5 min) to reduce API calls:
- Customer lookups cached
- Product searches cached
- Order data cached

### Missing Data
Some Shopify stores may not have all fields. Service handles gracefully:
- Missing tracking numbers
- Empty product descriptions
- Null customer data

## 🎯 Next Steps

1. **Deploy to Vercel** - API routes work automatically
2. **Add to Chat Widget** - Integrate `handleChatInquiry()`
3. **Set Up Webhooks** - Real-time order updates
4. **Add Analytics** - Track Shopify interactions
5. **Build Reports** - Shopify-driven conversations

## 📞 Support

- Shopify API Docs: https://shopify.dev/docs/api
- True Citrus Store: https://true-citrus.myshopify.com
- API Version: 2024-10

---

**Ready to test!** Run `npm run dev` and visit `/shopify-test`
