# Analytics System Usage Guide

## Overview
The analytics system tracks comprehensive metrics across three main categories: Insights, Sales, and Engagement.

## Setup

### 1. Database Setup
Run the analytics schema migration in your Supabase database:
```sql
-- Run this in Supabase SQL Editor
-- Location: database_analytics_schema.sql
```

### 2. Import the Analytics Service
```javascript
import analyticsService from '../services/analyticsService';
```

## Tracking Events

### Sales Events

#### Track Product Viewed
```javascript
await analyticsService.trackProductViewed(
  conversationId, 
  'product-123', 
  'True Lemon Original'
);
```

#### Track Add to Cart
```javascript
await analyticsService.trackAddToCart(
  conversationId, 
  'product-123', 
  'True Lemon Original', 
  2  // quantity
);
```

#### Track Order Placed
```javascript
await analyticsService.trackOrderPlaced(
  conversationId, 
  149.99,  // order value
  'order-456'
);
```

#### Track PDP Redirect
```javascript
await analyticsService.trackPDPRedirect(
  conversationId, 
  'product-123',
  'https://yoursite.com/products/true-lemon'
);
```

### Engagement Events

#### Track Customer Type
```javascript
await analyticsService.trackCustomerType(
  conversationId, 
  'returning'  // Options: 'new', 'returning', 'vip'
);
```

#### Track Proactive Engagement
```javascript
await analyticsService.trackProactiveEngagement(
  conversationId, 
  'exit_intent'  // trigger type
);
```

#### Track Engagement (3+ messages)
```javascript
// Call this when a conversation reaches 3+ messages
await analyticsService.trackEngagement(conversationId);
```

### Insights Events

#### Track Missing Information
```javascript
await analyticsService.trackMissingInfo(
  conversationId, 
  'shipping-cost'
);
```

#### Track Category Discussion
```javascript
await analyticsService.trackCategoryDiscussion(
  conversationId, 
  ['beverages', 'health-drinks']
);
```

## Integration Examples

### In Chat Handler
```javascript
// In your chat message handler
const handleChatMessage = async (message, conversationId) => {
  // Your existing chat logic...
  
  // Track engagement after 3 messages
  const messageCount = await getMessageCount(conversationId);
  if (messageCount === 3) {
    await analyticsService.trackEngagement(conversationId);
  }
  
  // If bot mentions a product
  if (message.includes('product_id')) {
    await analyticsService.trackProductViewed(
      conversationId,
      extractProductId(message),
      extractProductName(message)
    );
  }
};
```

### In E-Commerce Integration
```javascript
// When user adds to cart via chatbot
const handleAddToCart = async (conversationId, product) => {
  // Your add to cart logic...
  
  await analyticsService.trackAddToCart(
    conversationId,
    product.id,
    product.name,
    product.quantity
  );
};

// When order is placed via chatbot
const handleOrderPlacement = async (conversationId, order) => {
  // Your order logic...
  
  await analyticsService.trackOrderPlaced(
    conversationId,
    order.total,
    order.id
  );
};
```

### In Proactive Engagement
```javascript
// When proactive message is triggered
const triggerProactiveMessage = async (triggerType) => {
  const conversationId = await createNewConversation();
  
  await analyticsService.trackProactiveEngagement(
    conversationId,
    triggerType  // e.g., 'exit_intent', 'scroll_50', 'time_on_page'
  );
  
  // Show chatbot...
};
```

## Viewing Analytics

### Access the Dashboard
Navigate to the Analytics section in your chatbot platform to view:

#### Sales Performance
- Conversion Rate
- AI Generated Sales
- AI Generated Orders
- Average Order Value (AOV)
- PDP Redirects
- Add to Cart Events
- Total Conversations

#### Engagement Analytics
- Overall Engagement Rate
- Proactive Engagement Rate
- Conversations by Customer Type
- Engaged Conversations Count

#### Insights
- Shoppers Intelligence
  - Total Visitors
  - Average Session Time
  - Top Products Discussed
  - Top Categories
  - Conversion Funnel
- Missing Information
- AI Recommendations

### Exporting Data

#### Export as CSV
Click Export → Export as CSV to download multiple CSV files:
- analytics-summary.csv
- top-products.csv
- missing-information.csv
- ai-recommendations.csv
- conversion-funnel.csv
- customer-types.csv

#### Export as JSON
Click Export → Export as JSON for a complete JSON export with all data.

#### Print Report
Click Export → Printable Report to generate a formatted printable report.

## Advanced Features

### Custom Metadata
You can add custom metadata to conversations:
```javascript
await analyticsService.updateConversationMetadata(conversationId, {
  customField: 'value',
  anotherField: 123
});
```

### Query Analytics Events
```javascript
// Get all events for a conversation
const events = await analyticsService.getAnalyticsEvents(conversationId);

// Get specific event type
const orderEvents = await analyticsService.getAnalyticsEvents(
  null,  // all conversations
  'order_placed'  // event type
);

// Get events in date range
const recentEvents = await analyticsService.getAnalyticsEvents(
  null,
  null,
  '2024-01-01',  // start date
  '2024-01-31'   // end date
);
```

### Analytics Summary
```javascript
// Get aggregated analytics summary
const summary = await analyticsService.getAnalyticsSummary(
  '2024-01-01',
  '2024-01-31'
);
```

## Metadata Structure

The system stores metadata in the conversations table:
```json
{
  "orderPlaced": true,
  "orderValue": 150.00,
  "addedToCart": true,
  "redirectedToPDP": true,
  "viewedProduct": true,
  "customerType": "returning",
  "isProactive": false,
  "proactiveTrigger": "exit_intent",
  "productsDiscussed": ["product-1", "product-2"],
  "categoriesDiscussed": ["electronics", "accessories"],
  "missingInfo": ["shipping-cost", "return-policy"]
}
```

## Best Practices

1. **Track Early**: Call tracking functions as soon as events occur
2. **Unique IDs**: Always use unique product and order IDs
3. **Customer Type**: Identify customer type early in conversation
4. **Proactive Tracking**: Always track proactive triggers
5. **Missing Info**: Track when bot can't answer questions
6. **Regular Review**: Check analytics dashboard weekly
7. **Export Data**: Regularly export data for long-term storage
8. **Monitor Recommendations**: Act on AI recommendations

## Troubleshooting

### Events Not Showing
- Verify database schema is applied
- Check Supabase permissions
- Ensure conversationId is valid
- Check browser console for errors

### Analytics Not Loading
- Verify Supabase connection
- Check date range selection
- Ensure data exists for selected period
- Check network requests in browser DevTools

### Export Not Working
- Check browser download permissions
- Verify data exists
- Check console for JavaScript errors
- Try different export format

## Support
For issues or questions, check:
- Browser console for errors
- Supabase logs
- Network tab in DevTools
- Database query logs
