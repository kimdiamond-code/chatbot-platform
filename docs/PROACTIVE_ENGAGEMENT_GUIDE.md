# Proactive Engagement Setup Guide

## Overview
The Proactive Engagement system triggers chat messages based on visitor behavior to increase conversions and engagement.

## Features Implemented
✅ **Exit Intent Detection** - Catch visitors before they leave
✅ **Scroll Percentage Triggers** - Engage at specific scroll points
✅ **Time on Page** - Trigger after X seconds on specific pages
✅ **Cart Abandonment** - Re-engage shoppers with cart items
✅ **UTM Parameter Detection** - Welcome campaign visitors
✅ **URL Pattern Matching** - Target specific pages
✅ **Real-time Analytics** - Track triggers, engagements, and conversions
✅ **Priority System** - Control which triggers fire first
✅ **Live Preview** - See how triggers look before activating

## Database Setup

### Step 1: Run the Schema
Execute this SQL in your Supabase SQL Editor:

```bash
# Navigate to: Supabase Dashboard > SQL Editor
# Copy and paste the contents of:
./supabase/proactive_engagement_schema.sql
```

This creates:
- `proactive_triggers` - Store trigger configurations
- `proactive_events` - Track when triggers fire
- `proactive_analytics` - Aggregated analytics data
- Auto-updating analytics via triggers

### Step 2: Verify Tables
Check that these tables exist in Supabase:
- organizations
- bot_configs
- customers
- conversations
- proactive_triggers ✨ NEW
- proactive_events ✨ NEW
- proactive_analytics ✨ NEW

## Frontend Setup

### Component Access
The ProactiveEngagement component is accessible via:
```
Navigation Menu > Proactive Engagement
```

### Features in UI
1. **Stats Dashboard** - View total triggers, conversions, and rates
2. **Trigger Management** - Create, edit, enable/disable triggers
3. **Live Preview** - See how triggers appear to users
4. **Priority Control** - Set which triggers fire first (1-10)

### Creating a New Trigger
1. Click "Add Trigger"
2. Fill in:
   - Name (e.g., "Exit Intent Popup")
   - Trigger Type (exit_intent, scroll_percentage, etc.)
   - Message (what users will see)
   - Delay (seconds before showing)
   - Priority (1-10, higher = more important)
   - Conditions (scroll %, URL pattern, etc.)
3. Click "Save Trigger"
4. Toggle it ON to activate

## Widget Installation

### Step 1: Generate Widget Code
The proactive widget script is located at:
```
/public/proactive-widget.js
```

### Step 2: Add to Your Website
Add this code before the closing `</body>` tag of your website:

```html
<!-- Proactive Engagement Widget -->
<script>
  // Configuration
  window.CHATBOT_API_URL = 'YOUR_SUPABASE_URL';
  window.CHATBOT_API_KEY = 'YOUR_SUPABASE_ANON_KEY';
  window.CHATBOT_ORG_ID = '00000000-0000-0000-0000-000000000001';
</script>
<script src="https://your-domain.com/proactive-widget.js"></script>
```

### Step 3: Configure Environment Variables
Update your `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Widget API

### Track Customer ID
```javascript
// Call this when you identify a user
ProactiveWidget.setCustomerId('customer-id-123');
```

### Track Conversions
```javascript
// Call this when a conversion happens (purchase, signup, etc.)
ProactiveWidget.markConversion('trigger-id-here');
```

### Update Cart Status
```javascript
// For e-commerce sites
ProactiveWidget.updateCart(true, 149.99); // hasItems, cartValue
```

### Custom Events
```javascript
// Dispatch a proactive message programmatically
window.dispatchEvent(new CustomEvent('proactiveMessage', {
  detail: { message: 'Custom message here', source: 'custom_trigger' }
}));
```

## Trigger Types Explained

### 1. Exit Intent
Fires when user's mouse leaves the viewport (moving toward browser controls)
```json
{
  "type": "exit_intent",
  "conditions": {
    "minTimeOnSite": 10  // seconds
  }
}
```

### 2. Scroll Percentage
Fires when user scrolls to a specific percentage of the page
```json
{
  "type": "scroll_percentage",
  "conditions": {
    "scrollPercentage": 50,  // 0-100
    "pageUrl": "*"  // or "/products/*"
  }
}
```

### 3. Time on Page
Fires after user spends X seconds on a page
```json
{
  "type": "time_on_page",
  "conditions": {
    "timeOnPage": 60,  // seconds
    "pageUrl": "/pricing"
  }
}
```

### 4. Cart Abandonment
Fires when user has items in cart but hasn't checked out
```json
{
  "type": "cart_abandonment",
  "conditions": {
    "hasCartItems": true,
    "cartValue": 50  // minimum cart value
  }
}
```

### 5. UTM Parameters
Fires when user arrives from a campaign
```json
{
  "type": "utm_parameter",
  "conditions": {
    "utm_source": "*",  // or "facebook", "google"
    "utm_campaign": "summer_sale"
  }
}
```

### 6. URL Match
Fires on specific pages
```json
{
  "type": "url_match",
  "conditions": {
    "pageUrl": "/pricing*"  // supports wildcards
  }
}
```

## Analytics & Reporting

### Viewing Analytics
Analytics are automatically tracked in:
- `proactive_events` table - Individual trigger fires
- `proactive_analytics` table - Daily aggregated stats

### Metrics Tracked
- **Total Triggers** - How many times triggers fired
- **Engagements** - Users who clicked/interacted
- **Conversions** - Users who completed desired action
- **Engagement Rate** - % of triggers that got engagement
- **Conversion Rate** - % of triggers that led to conversion

### Accessing Data
Query analytics using Supabase:
```javascript
const { data } = await supabase
  .from('proactive_analytics')
  .select('*')
  .eq('organization_id', 'your-org-id')
  .gte('date', '2025-01-01')
  .order('date', { ascending: false });
```

## Best Practices

### Message Writing
✅ **DO:**
- Keep messages under 100 characters
- Use clear calls-to-action
- Personalize when possible (use {utm_source} placeholders)
- A/B test different messages

❌ **DON'T:**
- Use aggressive language
- Trigger too frequently
- Show multiple popups at once

### Trigger Configuration
✅ **DO:**
- Set reasonable delays (5-10 seconds minimum)
- Use priorities to control overlaps
- Test on different devices
- Monitor analytics weekly

❌ **DON'T:**
- Set delays too short (< 3 seconds)
- Create too many active triggers (< 5 recommended)
- Ignore conversion data

### Performance
- Widget is < 15KB
- Async loading
- No dependencies
- Works with existing chat widgets

## Troubleshooting

### Triggers Not Firing
1. Check if trigger is enabled (toggle ON in UI)
2. Verify widget script is loaded (`window.ProactiveWidget` exists)
3. Check browser console for errors
4. Verify Supabase credentials in widget config

### Analytics Not Recording
1. Check `proactive_events` table for recent entries
2. Verify RLS policies are correct
3. Check browser network tab for failed POST requests

### Preview Not Showing
1. Click "Preview" button on a trigger
2. Check if popup appears in bottom-right
3. Verify CSS is loading correctly

## Integration with Existing Chat

### Chat Widget Integration
The proactive widget automatically integrates with your existing chat widget:

```javascript
// Listen for proactive messages in your chat widget
window.addEventListener('proactiveMessage', (event) => {
  const { message } = event.detail;
  // Display message in your chat widget
  displayMessage(message);
});
```

### Shopify Integration
For Shopify stores, add this to track cart:
```javascript
// Add to theme.liquid
{% if cart.item_count > 0 %}
<script>
  ProactiveWidget.updateCart(true, {{ cart.total_price | divided_by: 100.0 }});
</script>
{% endif %}
```

## Next Steps

1. ✅ Run the database schema
2. ✅ Create your first trigger
3. ✅ Install widget on your website
4. ✅ Test triggers in different scenarios
5. ✅ Monitor analytics
6. ✅ Optimize based on data

## Support

For issues or questions:
- Check browser console logs
- Verify Supabase connection
- Review RLS policies
- Check widget configuration

---

**Status:** ✅ Production Ready
**Version:** 1.0
**Last Updated:** September 30, 2025
