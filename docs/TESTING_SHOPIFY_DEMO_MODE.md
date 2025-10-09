# Testing Shopify Features Without Store Connection

## 🎭 Demo Mode Activated!

You can now test all Shopify product features without connecting to a real store. Demo mode automatically activates when no Shopify store is connected.

## ✅ What's Available in Demo Mode

### Demo Products
Three mock products are available:
1. **Wireless Bluetooth Headphones** - $149.99 (Black/White variants)
2. **Portable Bluetooth Speaker** - $89.99 (Blue variant in stock, Red out of stock)
3. **USB-C Charging Cable** - $19.99

All products have:
- Real product images (from Unsplash)
- Multiple variants
- Inventory levels
- Pricing information
- Add-to-cart functionality

## 🧪 How to Test

### Step 1: Deploy the Changes

```bash
npm run build
# Then deploy to Vercel
```

### Step 2: Go to Live Chat

On your deployed site:
1. Navigate to **Live Chat**
2. Click **"Test Smart Response"** button (or select a conversation)

### Step 3: Test Product Search

Send these messages to trigger product display:

**Test 1: General Product Request**
```
User: "I'm looking for headphones"
Expected: Bot shows Wireless Bluetooth Headphones product card
```

**Test 2: Different Product**
```
User: "show me speakers"
Expected: Bot shows Portable Bluetooth Speaker product card
```

**Test 3: Multiple Products**
```
User: "recommend some products"
Expected: Bot shows all 3 demo products
```

**Test 4: Accessories**
```
User: "I need a cable"
Expected: Bot shows USB-C Cable product card
```

### Step 4: Test Add-to-Cart

1. After products appear, you'll see product cards with:
   - Product image
   - Title and price
   - Variant selector (if multiple options)
   - Quantity controls (+/-)
   - **Add to Cart** button

2. Click **"Add to Cart"** button

3. Expected behavior:
   - Button shows "Adding..." briefly
   - Changes to "Added!" with checkmark
   - Bot sends confirmation message: "✅ Added [product] to cart! (Demo Mode)"
   - Console logs show: "🎭 DEMO MODE: Mock add to cart"

### Step 5: Test Different Variants

For products with variants (like headphones):
1. Use the dropdown to select different colors
2. Price updates if there are price differences
3. Click Add to Cart
4. Should add the selected variant

### Step 6: Test Out of Stock

For the Red speaker (out of stock):
1. Request speakers: "show me speakers"
2. Select "Red" variant from dropdown
3. Add to Cart button should be **disabled** and show "Out of Stock"

### Step 7: Test Quantity

1. Use the + and - buttons to adjust quantity
2. Quantity should update
3. Add to Cart should add the correct quantity
4. Confirmation message should reflect the quantity

## 🔍 What to Check

### Visual Checks
- ✅ Product cards display properly
- ✅ Images load correctly
- ✅ Prices show formatted ($149.99)
- ✅ Variant dropdowns work
- ✅ Quantity controls functional
- ✅ Add to Cart button responsive

### Functional Checks
- ✅ Products appear when mentioned in chat
- ✅ Product search works (headphones, speakers, cable)
- ✅ Add to Cart button works
- ✅ Success confirmation appears
- ✅ Demo Mode indicator shows in confirmation
- ✅ Out of stock items are disabled

### Console Checks
Open browser console (F12) and look for:
```
🎭 DEMO MODE: Using mock Shopify products
🛒 DEMO MODE: Mock add to cart called
✅ Demo cart created: {success: true, ...}
```

## 📊 Analytics Tracking

Even in demo mode, analytics are tracked:
- Product views
- Add to cart events
- With `demoMode: true` flag

Check the Analytics page to see tracked events.

## 🎨 Customization

To customize demo products, edit:
```
src/services/demoShopifyService.js
```

You can:
- Change product names, prices, descriptions
- Add more products
- Modify variants
- Change images (use Unsplash URLs)

## 🔄 Switching to Real Shopify

When you're ready to use a real store:
1. Go to **Settings → Integrations**
2. Connect your Shopify store
3. Demo mode automatically disables
4. Real products from your store appear
5. Add-to-cart creates actual draft orders

## 🐛 Troubleshooting

**Products not showing:**
- Check console for "🎭 DEMO MODE" logs
- Ensure you're using trigger phrases like "looking for", "show me", "recommend"
- Try "Test Smart Response" button in Live Chat

**Add to Cart not working:**
- Check console for errors
- Ensure products are displaying first
- Check that product has `available: true`

**No confirmation message:**
- Check browser console for errors
- Ensure bot service is running
- Try refreshing the page

## ✨ Demo Mode Features

### Advantages
- ✅ Test UI without Shopify account
- ✅ Test add-to-cart flow
- ✅ Validate product display
- ✅ Check analytics tracking
- ✅ Demo to stakeholders
- ✅ Train support team

### Limitations
- ⚠️ Mock data only (3 products)
- ⚠️ No real cart persistence
- ⚠️ No checkout integration
- ⚠️ Cart data not saved to Shopify

## 🚀 Next Steps

After testing in demo mode:

1. **Connect Real Store**
   - Go to Integrations
   - Click "Connect Shopify"
   - Authorize your store
   - Real products replace demo products

2. **Configure Knowledge Base**
   - Add product information
   - Add FAQs about products
   - Bot will use this for better recommendations

3. **Customize Product Display**
   - Edit `ProductCard.jsx` for styling
   - Modify `ProductMessage.jsx` for layout
   - Update colors in `tailwind.config.js`

## 📝 Test Checklist

Before going live with real Shopify:

- [ ] Demo products display correctly
- [ ] Product images load
- [ ] Variants work properly
- [ ] Quantity controls functional
- [ ] Add to Cart button works
- [ ] Confirmation messages appear
- [ ] Out of stock items disabled
- [ ] Console shows no errors
- [ ] Mobile responsive
- [ ] Analytics tracking works

---

**Demo Mode Status:** ✅ Active when Shopify not connected
**Real Mode Status:** ⏸️ Activates after Shopify connection

Happy testing! 🎉
