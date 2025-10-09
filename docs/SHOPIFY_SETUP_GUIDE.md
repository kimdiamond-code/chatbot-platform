# True Citrus Shopify Integration Setup Guide

## Overview
This chatbot platform includes a fully integrated Shopify service specifically designed for True Citrus products. The integration provides:

- **Product Search**: Natural language product search with True Citrus specific categorization
- **Vegan Information**: Automatic responses to vegan/dietary questions
- **Order Tracking**: Customer order status and tracking information
- **Ingredient Info**: Product ingredients and nutritional information
- **Customer Support**: Enhanced customer service with product knowledge

## Prerequisites
- Active Shopify store for True Citrus
- Admin access to the Shopify store
- Basic understanding of Shopify Admin API

## Step 1: Get Shopify API Credentials

### Create a Private App in Shopify:

1. **Log into your Shopify Admin panel**
   - Go to: `https://true-citrus.myshopify.com/admin`

2. **Navigate to Apps**
   - Click on "Apps" in the sidebar
   - Click "App and sales channel settings"
   - Click "Develop apps"

3. **Create a new private app**
   - Click "Create an app"
   - Name: "True Citrus Chatbot"
   - App developer: Your email

4. **Configure API scopes**
   Enable the following scopes:
   ```
   read_products
   read_orders
   read_customers
   read_inventory
   read_locations
   read_draft_orders
   read_checkouts
   ```

5. **Install the app**
   - Click "Install app"
   - Note down the **Access Token** (starts with "shpat_...")

## Step 2: Configure Environment Variables

Update your `.env` file with the following:

```bash
# Shopify Integration for True Citrus
VITE_SHOPIFY_API_KEY=1209816bfe4d73b67e9d90c19dc984d9
VITE_SHOPIFY_API_SECRET=749dc6236bfa6f6948ee4c39e0d52c37
VITE_SHOPIFY_STORE_NAME=true-citrus
VITE_SHOPIFY_ACCESS_TOKEN=shpat_your_access_token_here
```

**Important**: Replace `shpat_your_access_token_here` with the actual access token from Step 1.

## Step 3: Test the Integration

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to Integrations page**
   - Go to the Integrations tab in your chatbot platform
   - Find the Shopify integration card
   - Click "Connect"

3. **Verify connection**
   - You should see "✅ True Citrus Shopify Store Connected"
   - The status should change to "Connected"

## Step 4: Test Customer Interactions

Try these example messages in the bot builder or live chat:

### Vegan Questions:
- "Are your products vegan?"
- "Do you have any animal products?"
- "Is Crystal Light vegan-friendly?"

### Product Search:
- "I'm looking for True Lemon packets"
- "Show me citrus products"
- "What Crystal Light flavors do you have?"

### Ingredient Information:
- "What ingredients are in True Orange?"
- "Are there any allergens in your products?"
- "What's in Crystal Light packets?"

### Order Tracking:
- "Track my order"
- "Where is my shipment?"
- "Order status update"

## Features Included

### 🌱 Vegan-Friendly Responses
The integration automatically recognizes vegan-related questions and provides comprehensive answers about True Citrus products being vegan-friendly.

### 🔍 Smart Product Search
Advanced product search that understands True Citrus product categories:
- True Lemon packets
- True Lime packets  
- True Orange packets
- Crystal Light products
- Hydration products

### 📊 Customer Order Management
- Real-time order tracking
- Order status updates
- Customer order history
- Shipping information

### 🏷️ Product Information
- Ingredient lists
- Nutritional information
- Product benefits
- Usage instructions

### 💬 Natural Language Processing
The integration understands natural language queries like:
- "Are there any sugar-free options?"
- "What's the healthiest product you have?"
- "I need something for water flavoring"

## Troubleshooting

### Connection Issues

**Error: "Missing Shopify access token"**
- Check that `VITE_SHOPIFY_ACCESS_TOKEN` is set in your `.env` file
- Verify the token starts with "shpat_"
- Restart your development server

**Error: "Shopify API error: 401"**
- Your access token may be invalid or expired
- Recreate the private app in Shopify Admin
- Generate a new access token

**Error: "Shopify API error: 403"**
- Check that your private app has the required API scopes
- Verify the app is installed and active

### Database Issues

**Error: "duplicate key value violates unique constraint"**
- This is fixed in the latest version
- The integration now uses proper upsert operations
- Clear your browser cache and try again

### Integration Not Working

1. **Check console logs**
   - Open browser DevTools (F12)
   - Look for Shopify-related log messages
   - Check for any error messages

2. **Verify environment variables**
   ```javascript
   console.log('Shopify Config:', {
     storeName: import.meta.env.VITE_SHOPIFY_STORE_NAME,
     hasToken: !!import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN
   });
   ```

3. **Test API connection manually**
   - Go to Integrations page
   - Click "Connect" on Shopify integration
   - Check the connection message

## Security Notes

- Keep your access token secure and never commit it to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your API credentials
- Monitor API usage in Shopify Admin

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test the Shopify API connection in the Integrations page
4. Contact the development team with specific error messages

## API Rate Limits

The Shopify integration includes built-in rate limiting and retry logic:
- Maximum 2 requests per second
- Automatic exponential backoff on rate limit errors
- Request queuing for optimal performance

The integration is designed to handle typical customer service loads without hitting rate limits.
