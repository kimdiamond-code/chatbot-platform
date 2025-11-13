# Bot Instructions Save Diagnostic

## Current Issue
Bot instructions are not saving properly when edited in the Bot Builder.

## Diagnostic Steps

### 1. Check Browser Console During Save
Open Bot Builder → F12 → Console Tab → Make changes → Click Save

**Expected console logs:**
```
💾 Saving bot config: { organization_id: '00000000...', name: 'YourBot', ... }
✅ Bot config created/updated: [some-uuid]
```

**If you see errors instead:**
- Note the exact error message
- Check Network tab for failed requests

### 2. Check Database State
After clicking Save, verify database has the data:

**Option A - Via Vercel (if you have access):**
```sql
SELECT id, name, instructions, updated_at 
FROM bot_configs 
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY updated_at DESC 
LIMIT 1;
```

**Option B - Via Browser Console:**
```javascript
// Test save directly
const testSave = async () => {
  const response = await fetch('/api/consolidated', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'database',
      action: 'saveBotConfig',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Test Bot',
      instructions: 'You are a test assistant.',
      personality: JSON.stringify({ tone: 'friendly' }),
      settings: JSON.stringify({ responseDelay: 1500 }),
      greeting_message: 'Hello!',
      fallback_message: 'I am not sure about that.'
    })
  });
  return await response.json();
};
testSave();
```

### 3. Check Reload Behavior
After saving:
1. Refresh the page (F5)
2. Check if instructions persist
3. Check browser console for load logs:
```
📥 Loading bot configuration from database...
✅ Bot config loaded from database
```

## Common Issues & Fixes

### Issue A: Save Button Doesn't Change to "Saved!"
**Cause:** API request failing silently

**Fix Steps:**
1. Open Network tab (F12)
2. Click Save
3. Look for `/api/consolidated` request
4. Check if it returns 200 or an error
5. Click request to see response details

### Issue B: Save Works But Reload Loses Data
**Cause:** Database connection issue

**Check:**
```javascript
// Test database connection
fetch('/api/consolidated?check=1')
  .then(r => r.json())
  .then(d => console.log('DB Status:', d));
```

### Issue C: Instructions Field Empty After Reload
**Cause:** Field binding issue or API not storing instructions

**Debug:**
```javascript
// In browser console on Bot Builder page:
// Check current botConfig state (React DevTools needed)
// Or add this to BotBuilder.jsx temporarily:
console.log('Current systemPrompt:', botConfig.systemPrompt);
```

## Quick Fix Commands

### If Database Connection Failed:
Run: `.\DB_ONLINE.bat`

### If Need Fresh Deploy:
Run: `.\DEPLOY_NOW.bat`

### If API Issues:
```powershell
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"
vercel --prod
```

## Expected Working Flow

1. User types in "System Instructions" textarea
2. `onChange` triggers: `updateConfig('root', { systemPrompt: e.target.value })`
3. botConfig state updates
4. User clicks "Save"
5. `saveBotConfiguration()` runs
6. Sends to API: `{ instructions: botConfig.systemPrompt, ... }`
7. API saves to database `bot_configs.instructions` column
8. Returns success
9. Button shows "Saved!" (green)
10. On page refresh, `loadBotConfiguration()` runs
11. Loads from database: `dbConfig.instructions`
12. Sets state: `systemPrompt: dbConfig.instructions`
13. Textarea shows saved value

## Manual Test

Run this in browser console on Bot Builder page:

```javascript
// 1. Test state
console.log('Testing Bot Builder save...');

// 2. Trigger save manually
document.querySelector('button').click(); // Assuming Save button is first

// 3. Wait 2 seconds then check result
setTimeout(async () => {
  const configs = await fetch('/api/consolidated', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'database',
      action: 'getBotConfigs',
      orgId: '00000000-0000-0000-0000-000000000001'
    })
  }).then(r => r.json());
  
  console.log('Saved configs:', configs);
  if (configs.data && configs.data.length > 0) {
    console.log('Latest instructions:', configs.data[0].instructions);
  }
}, 2000);
```

## Next Steps

1. Run diagnostic checks above
2. Note which step fails
3. Share error messages or unexpected behavior
4. I'll provide targeted fix
