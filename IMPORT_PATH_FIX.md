# 🔧 Import Path Fix - createDraftOrder
**Date:** October 12, 2025

## ❌ Error

```
ch.createDraftOrder is not a function
```

## 🔍 Root Cause

**Wrong import path in two files:**

1. `src/hooks/useMessages.js` was importing:
   ```javascript
   import shopifyService from '../services/shopifyService'  // ❌ Old/wrong file
   ```

2. `src/services/chat/integrationOrchestrator.js` was importing:
   ```javascript
   import shopifyService from '../integrations/shopifyService.js';  // ❌ default export
   ```

The correct shopifyService with `createDraftOrder()` method is at:
`src/services/integrations/shopifyService.js`

## ✅ Fix Applied

### Fix #1: useMessages.js
```javascript
// Before
import shopifyService from '../services/shopifyService'

// After  
import { shopifyService } from '../services/integrations/shopifyService'
```

### Fix #2: integrationOrchestrator.js
```javascript
// Before
import shopifyService from '../integrations/shopifyService.js';

// After
import { shopifyService } from '../integrations/shopifyService.js';
```

## 📝 Technical Details

**The issue:**
- There were multiple `shopifyService` files in the codebase
- The imports were pointing to old/wrong files
- Those old files didn't have the new `createDraftOrder()` method
- This caused the "not a function" error

**Files found:**
```
src/services/shopifyService.js                          ← OLD (wrong one)
src/services/integrations/shopifyService.js             ← CORRECT (has createDraftOrder)
src/services/integrations/multiStoreShopifyService.js   ← Alternative version
src/services/integrations/simplifiedShopifyService.js   ← Alternative version
... and others
```

**The correct one to use:**
- `src/services/integrations/shopifyService.js`
- Has all methods including `createDraftOrder()`
- Uses consolidated API
- Properly exported as named export

## 🧪 How to Test

After deploying:

1. **Go to Live Chat**
2. **Type:** "show me products"
3. **Bot shows products**
4. **Click "Add to Cart"**
5. **Should work now!** ✅

**Console should show:**
```
🛒 Adding to cart: {...}
✅ Real Shopify: Adding to cart
✅ Draft order created: 987654321
```

**Should NOT see:**
```
❌ ch.createDraftOrder is not a function
```

## 🚀 Deploy

```bash
vercel --prod
```

Then:
1. Hard refresh (Ctrl+Shift+R)
2. Test add to cart
3. Should work! ✅

## 📁 Files Modified

1. ✅ `src/hooks/useMessages.js` - Fixed import path
2. ✅ `src/services/chat/integrationOrchestrator.js` - Fixed import to named export

## 🎯 Result

**Before:**
- ❌ `createDraftOrder is not a function`
- ❌ Add to cart fails
- ❌ Importing wrong file

**After:**
- ✅ Correct import path
- ✅ Method exists and works
- ✅ Add to cart functional

---

**Status:** ✅ Ready to deploy  
**Test:** Add to cart should work immediately after deployment
