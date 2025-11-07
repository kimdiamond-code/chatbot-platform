# Multi-Tenant Bot Configuration Fix

## 🎯 Goal
Connect Bot Builder configurations to OpenAI responses so each organization gets their own custom bot behavior.

## 🔍 Current State

### ✅ What's Already Built
1. **Database Schema** - `bot_configs` table per organization
2. **Bot Config Service** - `botConfigService.getPublicBotConfig(organizationId)` loads from database
3. **OpenAI Service** - Has `loadBotConfigForOrg(organizationId)` and `buildSystemPromptFromConfig()`
4. **Bot Builder UI** - Saves to database via `dbService.saveBotConfig()`

### ❌ The Problem
Organization ID is NOT being passed through the conversation flow, so:
- Bot Builder saves config for organization `00000000-0000-0000-0000-000000000001`
- OpenAI always defaults to organization `00000000-0000-0000-0000-000000000001`
- **Result**: Everyone gets the same bot configuration (but system is ready for multi-tenant!)

## 🔧 The Fix

### 1. Update ChatPreview.jsx
**Pass organization ID to OpenAI service**

```javascript
await chatBotService.generateResponse(
  userInput,
  'bot-builder-preview',
  {
    organizationId: DEFAULT_ORG_ID,  // ✅ Pass org ID
    // Remove manual systemPrompt - let OpenAI load from database
  }
);
```

### 2. Ensure BotBuilder Uses Correct Org ID
**Get organization ID from user context**

The current `DEFAULT_ORG_ID` is hardcoded. In production, this should come from:
- User's session
- Auth context
- Organization selector

For now, keeping default org ID is fine for single-tenant setup.

### 3. Verify Database Loading
**Check that OpenAI actually loads from database**

The `openaiService.js` already has the logic:
1. Extracts `organizationId` from context
2. Calls `loadBotConfigForOrg(organizationId)`
3. Builds system prompt using `buildSystemPromptFromConfig(botConfig)`
4. Uses organization's custom prompt instead of fallback

## 📋 Files to Update

1. **src/components/ChatPreview.jsx**
   - Pass `organizationId` in `generateResponse()` call
   - Remove manual `systemPrompt` passing

2. **src/components/BotBuilder.jsx** *(if needed)*
   - Ensure organization ID is available
   - Consider adding org selector for multi-org support

## 🧪 How to Test

### Test 1: Bot Builder Configuration
1. Go to Bot Builder
2. Change system prompt: "You are a pizza ordering assistant"
3. Click Save
4. Check database: `SELECT * FROM bot_configs WHERE organization_id = '00000000-0000-0000-0000-000000000001'`
5. Verify `instructions` field contains your custom prompt

### Test 2: OpenAI Uses Custom Config
1. In ChatPreview, send a test message
2. Check browser console for logs:
   - `✅ Using custom system prompt from Bot Builder`
   - `📋 Loaded bot config for org: 00000000-0000-0000-0000-000000000001`
3. Bot should respond according to your custom directive

### Test 3: Multi-Tenant Isolation (Future)
1. Create new organization in database
2. Configure different bot in Bot Builder for that org
3. Switch organization context
4. Verify bot uses different configuration

## 🚀 Benefits After Fix

✅ **Each organization has their own bot personality**
- True Lemon gets citrus-focused bot
- Other stores get their own custom bots

✅ **Bot Builder actually works**
- Changes in UI immediately affect bot responses
- No hardcoded prompts

✅ **True SaaS architecture**
- Organizations are isolated
- Each tenant controls their own bot

✅ **Knowledge base and Q&A work per organization**
- Organization A's knowledge base ≠ Organization B's
- Custom Q&A pairs per tenant

## 📊 Current Architecture Flow

```
User configures in Bot Builder
  ↓
Saves to bot_configs table (per org)
  ↓
ChatPreview calls OpenAI service
  ↓
OpenAI service loads config from database (per org)
  ↓
Builds custom system prompt from config
  ↓
Generates response with organization's settings
```

## 🎯 Next Steps

1. ✅ Fix ChatPreview to pass organization ID
2. ✅ Verify OpenAI loads from database
3. ✅ Test configuration changes propagate
4. 🔜 Add organization selector for multi-org users
5. 🔜 Add real authentication and user → organization mapping

## 💡 Note for Production

In production, you'll need:
- **Real authentication** - Track which user belongs to which organization
- **Organization context** - Pass org ID from auth session
- **RBAC** - Admins can configure bot, agents can't
- **Multiple organizations per user** - If users can access multiple orgs

For now, using the default organization ID works for single-tenant setup.
