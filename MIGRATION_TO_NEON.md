# Migration from Supabase to Neon Database

## ✅ Completed Migration

The chatbot platform has been **fully migrated** from Supabase to Neon PostgreSQL.

## What Changed

### Database
- **Before:** Supabase (supabase.io)
- **After:** Neon PostgreSQL (neon.tech)
- **Connection:** `@neondatabase/serverless` package

### Key Benefits
- ✅ Lower cost (generous free tier)
- ✅ Serverless PostgreSQL with auto-scaling
- ✅ Native Vercel integration
- ✅ Better performance with connection pooling
- ✅ Database branching for dev/staging

## Files Updated

### Removed/Deprecated
- ❌ `@supabase/supabase-js` package removed
- ❌ `src/services/supabase.js` deprecated (kept as stub)
- ❌ `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` removed from .env

### Using Neon Database
- ✅ `api/neon-db.js` - Main database connection
- ✅ `sql/neon_schema.sql` - Complete database schema
- ✅ `src/services/chatService.js` - Chat operations
- ✅ `src/services/analyticsService.js` - Analytics tracking
- ✅ `src/services/shopifyService.js` - Shopify integration
- ✅ All components updated to use Neon

## Environment Variables

```bash
# Current setup (.env)
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-super-snow-addw8m42-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Database Schema

The complete schema is in `/sql/neon_schema.sql` with tables:
- organizations
- bot_configs
- conversations
- messages
- customers
- analytics_events
- knowledge_base
- integrations
- engagement_rules
- agents
- shopify_connections
- oauth_states

## How to Deploy

```bash
# Install dependencies (Supabase package removed)
npm install

# Run locally
npm run dev

# Deploy to Vercel
vercel --prod
```

## Testing Connection

All database operations now use Neon. Test with:
1. Start chat in Live Chat page
2. Check browser console - should see "✅ Connected to Neon Database"
3. No Supabase errors!

## Support

- **Neon Dashboard:** https://console.neon.tech
- **Database:** agentstack_ai_chatbot
- **Connection String:** Use `DATABASE_URL` env variable

---

**Migration Date:** October 3, 2025  
**Status:** ✅ Complete - All Supabase dependencies removed
