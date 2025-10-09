# API Consolidation - COMPLETED

All API endpoints have been consolidated from 13 functions down to 3:

## Active API Endpoints:
1. `/api/database.js` - All database operations (Neon)
2. `/api/shopify.js` - All Shopify operations 
3. `/api/kustomer.js` - All Kustomer operations

## Usage:

### Shopify API
- `/api/shopify?action=oauth-auth&shop=SHOP_NAME` - Start OAuth
- `/api/shopify?action=oauth-token&code=CODE&shop=SHOP` - Exchange token
- `/api/shopify?action=products` - Get products
- `/api/shopify?action=orders` - Get orders
- `/api/shopify?action=customers&email=EMAIL` - Get customer
- `/api/shopify?action=cart` (POST) - Create cart
- `/api/shopify?action=inventory&productId=ID` - Get inventory
- `/api/shopify?action=verify` - Test connection

### Kustomer API
- `/api/kustomer?action=oauth-token` (POST) - Exchange OAuth code
- `/api/kustomer?action=oauth-refresh` (POST) - Refresh token
- `/api/kustomer?action=test-connection` (POST) - Test API key
- `/api/kustomer?action=connections&organizationId=ID` - Get connections

### Database API
- `/api/database` (POST) - All database operations via action parameter

## Deleted Files:
- api/shopify/* (6 files + oauth folder)
- api/kustomer/* (2 files + oauth folder)

Total: From 13 serverless functions → 3 serverless functions ✅
