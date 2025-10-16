# Customer Memory & Personalization System

## Overview
Your bot now remembers customers across sessions and provides personalized experiences based on their history.

## How It Works

### 1. **Automatic Customer Tracking**
When a customer provides their email, the system:
- ✅ Creates or loads their profile
- ✅ Tracks visit count and last seen date
- ✅ Stores conversation topics and history
- ✅ Tags customers (new-customer, frequent-visitor, etc.)
- ✅ Maintains context for 8 minutes during active chat

### 2. **Persistent Memory**
The bot remembers:
- **Email & Contact Info**: Stored permanently
- **Visit History**: Every time they return
- **Past Conversations**: Last 10 conversations accessible
- **Topics Discussed**: Last 20 conversation topics
- **Preferences**: Channel preferences, timezone
- **Behavior**: Browsing patterns, engagement

### 3. **Personalized Greetings**
- **First Visit**: "Hi! Welcome! How can I help you today?"
- **2-5 Visits**: "Good to see you again! What can I help you with?"
- **5+ Visits**: "Welcome back, [Name]! What can I do for you today?"

## Setup Instructions

### Step 1: Run the SQL Migration
```bash
# Open Neon SQL Editor at: https://console.neon.tech
# Run this file: sql/CUSTOMER_MEMORY_SETUP.sql
```

### Step 2: Deploy the Code
```powershell
vercel --prod
```

### Step 3: Test the System
1. Start a conversation as a new customer
2. Provide email: "track my order, email is kim@example.com"
3. Bot creates profile and remembers it
4. Close the conversation
5. Return later (after 8 min idle or new conversation)
6. Say "track my order" - bot remembers your email and uses it automatically!

## Proactive Triggers

The system includes 4 default triggers:

### 1. **Welcome Back Message** (Returning Visitors)
- Triggers: After 2+ visits, 1+ days since last visit
- Message: "Welcome back! Last time we talked about your order..."
- Delay: 3 seconds

### 2. **Exit Intent** (Leaving the page)
- Triggers: User moves cursor to close tab
- Message: "Wait! Need help finding something?"
- Delay: Immediate

### 3. **Time on Page** (Engaged visitors)
- Triggers: After 45 seconds on page
- Message: "I see you're browsing! Can I help?"
- Delay: 45 seconds

### 4. **First Visit Welcome**
- Triggers: First time visitors only
- Message: "Hi there! Welcome to our store!"
- Delay: 10 seconds

## How Customers Are Identified

### Priority Order:
1. **Email in message**: "my email is kim@example.com"
2. **Stored in conversation**: From previous messages in same session
3. **Customer profile**: Loaded from database on return visit

### Example Flow:
```
Customer: "track my order"
Bot: "What email did you use?"
Customer: "kim@example.com"
✅ Bot creates/loads profile
✅ Stores email in conversation context (8 min)
✅ Stores email in database (permanent)

[Customer returns next day]
Customer: "hi"
✅ Bot recognizes email from IP/cookie tracking (future feature)
Bot: "Welcome back, Kim! (Visit #2)"
```

## Customer Profile Structure

```json
{
  "email": "kim@example.com",
  "name": "Kim",
  "phone": "+1234567890",
  "metadata": {
    "firstSeen": "2025-01-15T10:00:00Z",
    "lastSeen": "2025-01-16T14:30:00Z",
    "visitCount": 5,
    "totalMessages": 24,
    "preferences": {},
    "behavior": {
      "preferredChannel": "web",
      "timezone": "America/New_York"
    },
    "history": {
      "conversations": ["conv-1", "conv-2"],
      "orders": ["#1001", "#1002"],
      "topics": [
        {"topic": "order_tracking", "conversationId": "conv-1", "timestamp": "..."},
        {"topic": "product_search", "conversationId": "conv-2", "timestamp": "..."}
      ]
    }
  },
  "tags": ["frequent-visitor", "shopify-customer"]
}
```

## API Usage

### Get Customer Profile
```javascript
import { customerProfileService } from './services/customer/customerProfileService';

const profile = await customerProfileService.getOrCreateProfile(
  'kim@example.com',
  'org-id'
);

console.log('Visit #', profile.metadata.visitCount);
```

### Record Conversation Topic
```javascript
await customerProfileService.recordConversationTopic(
  'kim@example.com',
  'org-id',
  'order_tracking',
  'conversation-id'
);
```

### Get Personalized Greeting
```javascript
const greeting = customerProfileService.getPersonalizedGreeting(profile);
// Returns: "Welcome back, Kim! What can I do for you today?"
```

### Check for Proactive Nudge
```javascript
const nudge = customerProfileService.shouldShowProactiveNudge(profile);
if (nudge.show) {
  console.log(nudge.message);
}
```

## Benefits

✅ **Better Customer Experience**: Customers don't repeat themselves
✅ **Higher Engagement**: Personalized greetings increase response rates
✅ **Proactive Support**: Trigger messages at the right time
✅ **Customer Insights**: Track behavior and preferences
✅ **Reduced Support Time**: Bot remembers context from past conversations

## What's Remembered

### ✅ Currently Tracked
- Email, name, phone
- Visit count and dates
- Conversation history (last 10)
- Topics discussed (last 20)
- Channel preferences
- Customer tags

### 🚀 Future Enhancements
- Order history from Shopify
- Product preferences
- Cart abandonment tracking
- Sentiment analysis
- Purchase predictions
- Automated re-engagement campaigns

## Troubleshooting

**Q: Bot doesn't remember the customer**
- Ensure email was provided in previous conversation
- Check database: `SELECT * FROM customers WHERE email = 'kim@example.com'`
- Verify 8-minute idle timeout hasn't expired

**Q: Proactive triggers not showing**
- Check triggers are enabled: `SELECT * FROM proactive_triggers WHERE enabled = true`
- Verify conditions are met (visit count, time on page, etc.)
- Check browser console for trigger logs

**Q: How to reset a customer's profile**
```sql
-- Delete customer profile
DELETE FROM customers WHERE email = 'kim@example.com';

-- Customer will be treated as new on next visit
```

## Next Steps

1. ✅ Run the SQL migration
2. ✅ Deploy the code
3. ✅ Test with real email addresses
4. 📊 Monitor customer profiles in database
5. 🎯 Customize proactive trigger messages
6. 📈 Track engagement and conversion rates

Your bot now has a memory! 🧠✨
