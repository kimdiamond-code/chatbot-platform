# 🚀 PRODUCTION LAUNCH CHECKLIST

**Platform:** AgenStack.ai Chatbot Platform  
**Date Prepared:** December 2, 2025  
**Status:** Pre-Launch Review Complete

---

## ✅ STEP 1: Run Automated Cleanup

```powershell
.\PRODUCTION_CLEANUP.ps1
```

This will automatically:
- Remove BotBuilderSaveTest import
- Move backup files to /backups
- Create production-safe logger
- Create ErrorBoundary component
- Update .gitignore

---

## ⚠️ STEP 2: Add ErrorBoundary (MANUAL)

Edit `src/App.jsx`:

Add import at top:
```javascript
import ErrorBoundary from './components/common/ErrorBoundary';
```

Wrap content (around line 300):
```javascript
export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ErrorBoundary>
    </AuthProvider>
  );
}
```

---

## 🔑 STEP 3: Verify Vercel Environment Variables

Required variables:
- DATABASE_URL
- VITE_OPENAI_API_KEY
- VITE_SHOPIFY_API_KEY
- VITE_SHOPIFY_API_SECRET
- VITE_MESSENGER_APP_ID
- VITE_MESSENGER_APP_SECRET
- TOKEN_ENCRYPTION_KEY

---

## 🧪 STEP 4: Test Build

```powershell
npm run build
```

Must complete with no errors before deploying.

---

## 🚀 STEP 5: Deploy

```powershell
git add .
git commit -m "Production ready: cleanup and error boundaries"
git push
vercel --prod
```

---

## ✅ STEP 6: Post-Deploy Testing

Test these features:
1. Sign up / Log in
2. Bot Builder save
3. Integrations page loads
4. Conversations display
5. Analytics dashboard

---

See PRODUCTION_AUDIT_FINAL.md for complete details.
