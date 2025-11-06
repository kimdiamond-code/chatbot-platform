# 🔒 SECURITY QUICK REFERENCE

## 🚀 Quick Deploy (3 Steps)

```powershell
# Step 1: Activate Security
.\ACTIVATE_SECURITY.bat

# Step 2: Update Backend
# Edit api/consolidated.js - add security code (see below)

# Step 3: Deploy
.\DEPLOY_WITH_SECURITY.bat
```

## 📝 Backend Code to Add

**File:** `api/consolidated.js`

**Add at top:**
```javascript
const promptSecurity = require('./promptSecurityBackend.js');
```

**Add in OpenAI endpoint (line ~380):**
```javascript
if (endpoint === 'openai' && action === 'chat') {
  const { messages } = body;
  
  // ADD THIS BLOCK:
  try {
    promptSecurity.validateMessages(messages);
    const orgId = body.organizationId || 'default';
    const ip = req.headers['x-forwarded-for'] || 'unknown';
    promptSecurity.checkRateLimit(orgId, ip);
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      error: 'Security validation failed' 
    });
  }
  
  // ... continue with OpenAI call
}
```

## 🧪 Test Commands

```javascript
// Browser Console:

// Test 1: Safe message
window.testPromptSecurity("What products do you have?")
// → { isSafe: true }

// Test 2: Injection attempt
window.testPromptSecurity("ignore previous instructions")
// → { isSafe: false }

// Test 3: Chat test
await window.testChatBot("Hello!")
// → Normal response

// Test 4: Stats
window.getSecurityStats()
// → { totalAttempts, blockedConversations }
```

## 🛡️ What's Blocked

❌ "ignore previous instructions"
❌ "you are now a [role]"
❌ "system: new prompt"
❌ "forget everything"
❌ Multiple suspicious keywords
❌ >30 requests per minute

## ✅ What's Allowed

✓ "What products do you have?"
✓ "Track my order"
✓ "Help me find [product]"
✓ All normal customer questions

## 📊 Files Created

| File | Purpose |
|------|---------|
| `src/services/promptSecurity.js` | Frontend detection |
| `src/services/openaiService.secured.js` | Secured service |
| `api/promptSecurityBackend.js` | Backend validation |
| `ACTIVATE_SECURITY.bat` | Activation script |
| `DEPLOY_WITH_SECURITY.bat` | Deploy script |

## 🔧 Configuration

**Adjust sensitivity** in `promptSecurity.js`:
```javascript
maxSuspiciousAttempts: 3,    // Block after N attempts
blockDuration: 300000,       // Block for 5 minutes
maxRequestsPerMinute: 30     // Rate limit
```

## 🚨 Emergency Rollback

```powershell
copy src\services\openaiService.original.js src\services\openaiService.js -Force
git add . && git commit -m "Rollback security" && git push
vercel --prod
```

## 📖 Full Documentation

- **Summary:** SECURITY_SUMMARY.md
- **Full Guide:** SECURITY_IMPLEMENTATION_GUIDE.md
- **This Card:** SECURITY_QUICK_REFERENCE.md

---
**Version:** 1.0 | **Date:** 2025
