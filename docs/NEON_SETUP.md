# Neon Database Setup Guide

## ✅ What's Been Done

1. **Schema Created**: `sql/neon_schema.sql` - Complete database structure
2. **Dependencies Added**: `@neondatabase/serverless` and `pg` packages
3. **API Endpoint**: `api/database.js` - Serverless functions for all DB operations
4. **Client Service**: `src/services/databaseService.js` - Easy-to-use database client
5. **Test Utility**: `src/utils/testNeonConnection.js` - Connection verification

---

## 🚀 Setup Steps

### 1. Get Your Neon Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project: **agentstack_ai_chatbot**
3. Click **Connection Details**
4. Copy the **Connection String** (looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/agentstack_ai_chatbot?sslmode=require`)

### 2. Update .env File

Open `.env` and replace:
```
DATABASE_URL=your_neon_connection_string_here
```

With your actual connection string:
```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/agentstack_ai_chatbot?sslmode=require
```

### 3. Run Database Schema

1. Open Neon SQL Editor: https://console.neon.tech
2. Open file: `sql/neon_schema.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **Run** - should see "Schema created successfully!"

### 4. Install Dependencies

Run in terminal:
```bash
npm install
```

This installs:
- `@neondatabase/serverless` - Neon serverless driver
- `pg` - PostgreSQL client

### 5. Test Connection (Optional)

```bash
node src/utils/testNeonConnection.js
```

Should see:
```
✅ Connection successful!
✅ Organization retrieved: AgentStack AI
✅ Bot configs retrieved: 1 configs found
```

---

## 📦 Database Structure

### Tables Created:
- ✅ **organizations** - Multi-tenant support
- ✅ **bot_configs** - Chatbot configurations
- ✅ **conversations** - Chat sessions
- ✅ **messages** - Individual messages
- ✅ **integrations** - Shopify, Kustomer, etc.
- ✅ **knowledge_base** - Bot training content
- ✅ **analytics_events** - Tracking & metrics
- ✅ **customers** - CRM data
- ✅ **engagement_rules** - Proactive triggers
- ✅ **agents** - Agent/user management
- ✅ **customer_notes** - CRM notes

### Default Data:
- Organization: "AgentStack AI" (ID: `00000000-0000-0000-0000-000000000001`)
- Bot: "Default Support Bot"
- Admin: admin@agentstack.ai

---

## 💻 Usage Examples

### In Your Components:

```javascript
import { dbService } from '../services/databaseService';

// Get bot configs
const configs = await dbService.getBotConfigs(orgId);

// Create conversation
const conversation = await dbService.createConversation({
  organization_id: orgId,
  bot_config_id: botId,
  customer_email: 'user@example.com',
  customer_name: 'John Doe',
  channel: 'web'
});

// Send message
await dbService.createMessage({
  conversation_id: conversation.id,
  sender_type: 'user',
  content: 'Hello!'
});

// Track analytics
await dbService.createAnalyticsEvent({
  organization_id: orgId,
  conversation_id: conversation.id,
  event_type: 'message_sent',
  event_data: { channel: 'web' }
});
```

---

## 🔧 Vercel Environment Variables

Add to Vercel:
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environments**: Production, Preview, Development

---

## 🎯 Next Steps

1. ✅ Set `DATABASE_URL` in `.env`
2. ✅ Run schema in Neon SQL Editor
3. ✅ Run `npm install`
4. ✅ Test connection
5. ✅ Update Vercel env variables
6. 🚀 Deploy!

---

## 🆘 Troubleshooting

### Connection Timeout
- Check firewall rules
- Verify connection string is correct
- Ensure Neon project is active

### "relation does not exist"
- Schema not run yet
- Run `sql/neon_schema.sql` in Neon SQL Editor

### "No DATABASE_URL"
- Update `.env` file
- Restart dev server
- Check Vercel env variables

---

## 📚 Resources

- Neon Docs: https://neon.tech/docs
- Vercel Integration: https://vercel.com/integrations/neon
- PostgreSQL Reference: https://www.postgresql.org/docs/

---

Ready to continue? Run the setup steps above!
