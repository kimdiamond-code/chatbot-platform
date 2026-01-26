# ====================================================================
# PRODUCTION DEPLOYMENT GUIDE
# Complete checklist for deploying a production-ready multi-tenant chatbot platform
# ====================================================================

## PRE-DEPLOYMENT CHECKLIST

### 1. Clean Up Code
- [x] Remove True Citrus specific files
- [x] Remove console.log statements (keep console.error and console.warn)
- [x] Remove test files and components
- [x] Remove backup files
- [x] Archive old documentation
- [x] Update package.json to be generic

### 2. Verify Multi-Tenant Architecture
- [x] All API calls include organizationId
- [x] Database queries filter by organization_id
- [x] OAuth flows properly encode organization_id in state
- [x] No hardcoded organization IDs anywhere
- [x] AuthContext provides organizationId to all components

### 3. Security
- [x] All sensitive data encrypted in database
- [x] OAuth tokens stored securely
- [x] CORS properly configured
- [x] RBAC implemented (Admin vs User roles)
- [x] API endpoints verify user permissions
- [x] No API keys in client-side code

### 4. Environment Variables
Verify all required variables are set in Vercel:
- [x] DATABASE_URL (Neon PostgreSQL)
- [x] VITE_SHOPIFY_API_KEY
- [x] VITE_SHOPIFY_API_SECRET
- [x] VITE_MESSENGER_APP_ID
- [x] VITE_MESSENGER_APP_SECRET
- [x] VITE_OPENAI_API_KEY
- [x] TOKEN_ENCRYPTION_KEY
- [x] FRONTEND_URL

### 5. User Experience
- [ ] All integrations use OAuth (no manual API key entry)
- [ ] Clear user onboarding flow
- [ ] Admin controls hidden from regular users
- [ ] FAQ and help articles are complete and accurate
- [ ] Error messages are user-friendly
- [ ] Loading states for all async operations

### 6. Testing
- [ ] Test user signup/login flow
- [ ] Test each OAuth integration (Shopify, Kustomer, Messenger, Klaviyo)
- [ ] Test bot builder save/load
- [ ] Test chat functionality with all integrations
- [ ] Test multi-tenant isolation (users cannot see other org data)
- [ ] Test on mobile devices
- [ ] Test with different user roles (admin vs regular user)

## DEPLOYMENT STEPS

### Step 1: Run Production Cleanup
```powershell
.\PRODUCTION_CLEANUP.ps1
```

### Step 2: Remove Console Logs
```powershell
.\REMOVE_CONSOLE_LOGS.ps1
```

### Step 3: Verify Changes
```powershell
git status
git diff
```

### Step 4: Test Locally
```powershell
npm run dev
```
- Test key features
- Verify no console errors
- Check all integrations

### Step 5: Commit Changes
```powershell
git add .
git commit -m "Production cleanup: Remove test files, console logs, and True Citrus references"
git push origin main
```

### Step 6: Deploy to Vercel
```powershell
vercel --prod
```

### Step 7: Post-Deployment Verification
1. Visit production URL
2. Test user signup
3. Test OAuth integration flows
4. Verify admin panel access control
5. Check browser console for errors
6. Test on mobile device

## PRODUCTION CONFIGURATION

### Database Schema
Ensure these tables exist in Neon:
- users (id, email, password_hash, organization_id, role)
- organizations (id, name, created_at)
- integrations (id, organization_id, provider, credentials, created_at)
- bot_configs (id, organization_id, config, created_at)
- conversations (id, organization_id, customer_email, messages, created_at)

### OAuth Redirect URIs
Configure these in each provider's dashboard:
- Shopify: https://chatbot-platform-v2.vercel.app/api/oauth/shopify/callback
- Messenger: https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback
- Kustomer: https://chatbot-platform-v2.vercel.app/api/oauth/kustomer/callback
- Klaviyo: https://chatbot-platform-v2.vercel.app/api/oauth/klaviyo/callback

### Security Headers
Vercel configuration includes:
- CORS headers for API endpoints
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options

## USER-FACING FEATURES

### Regular Users Can:
1. Sign up and create their account
2. Build and customize chatbots
3. Connect integrations via OAuth:
   - Shopify (no manual API keys needed)
   - Messenger (OAuth flow)
   - Kustomer (OAuth flow)
   - Klaviyo (OAuth or API key)
4. View conversations and analytics
5. Customize widget appearance
6. Set up proactive engagement rules
7. Access FAQ and help articles

### Regular Users CANNOT:
- Access admin panel
- View other organizations' data
- Modify system-wide settings
- Access developer tools

### Admins Can (in addition to above):
- Access admin panel at /admin
- Manage user roles
- View system-wide analytics
- Configure security settings
- Manage webhooks
- Access API documentation

## KNOWN LIMITATIONS

1. Vercel Hobby plan limits:
   - Serverless function timeout: 10 seconds
   - Function size: 50MB
   - Monthly executions: 100GB-hours

2. Multi-tenant considerations:
   - Each organization's data is isolated
   - OAuth tokens are organization-specific
   - No cross-organization data sharing

## SUPPORT RESOURCES

### For Users:
- FAQ section in app
- Help articles
- Contact support (configure email)

### For Developers:
- API documentation in /docs
- Database schema in /sql
- Integration guides in /docs

## MONITORING

### Key Metrics to Track:
1. User signups per day
2. Active integrations by provider
3. API error rates
4. Conversation volumes
5. Response times
6. OAuth connection success rates

### Error Tracking:
- Monitor Vercel logs
- Check database connection errors
- Watch for OAuth callback failures
- Track API rate limits

## ROLLBACK PROCEDURE

If issues occur after deployment:
```powershell
# Revert to previous deployment in Vercel dashboard
# OR
git revert HEAD
git push origin main
# Vercel will auto-deploy the reverted code
```

## POST-LAUNCH TODO

1. [ ] Set up monitoring/alerting
2. [ ] Configure backup strategy for database
3. [ ] Create user documentation
4. [ ] Set up support email/chat
5. [ ] Plan for scaling (upgrade Vercel plan if needed)
6. [ ] Add analytics tracking (Google Analytics, etc.)
7. [ ] Create marketing materials
8. [ ] Set up user feedback collection

---

**Last Updated:** January 2026
**Version:** 2.0 Production Ready
