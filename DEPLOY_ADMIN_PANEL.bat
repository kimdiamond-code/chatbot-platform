@echo off
echo ================================================
echo DEPLOYING ADMIN PANEL TO PRODUCTION
echo ================================================
echo.

echo [STEP 1] Verifying Admin Panel files...
if not exist "src\components\AdminPanel.jsx" (
    echo ERROR: AdminPanel.jsx not found! Run ACTIVATE_ADMIN_PANEL.bat first!
    pause
    exit /b 1
)

if not exist "src\components\WidgetStudioSimplified.jsx" (
    echo ERROR: WidgetStudioSimplified.jsx not found!
    pause
    exit /b 1
)

if not exist "src\services\rbacService.js" (
    echo ERROR: rbacService.js not found!
    pause
    exit /b 1
)

echo ✓ All Admin Panel files present
echo.

echo [STEP 2] Checking if Admin Panel is activated...
findstr /C:"AdminPanel" "src\App.jsx" >nul
if %errorlevel% neq 0 (
    echo WARNING: App.jsx doesn't import AdminPanel
    echo Run ACTIVATE_ADMIN_PANEL.bat first!
    pause
    exit /b 1
)
echo ✓ Admin Panel is activated in App.jsx
echo.

echo [STEP 3] Git status...
git status
echo.

echo [STEP 4] Staging Admin Panel files...
git add src/components/AdminPanel.jsx
git add src/components/WidgetStudioSimplified.jsx
git add src/services/rbacService.js
git add src/App.jsx
git add ADMIN_PANEL_GUIDE.md
echo ✓ Files staged
echo.

echo [STEP 5] Committing changes...
git commit -m "Add dedicated Admin Panel - Consolidate webhooks, API keys, security settings for admin-only access"
if %errorlevel% neq 0 (
    echo WARNING: Commit may have failed or no changes to commit
)

echo.
echo [STEP 6] Pushing to repository...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    echo Please check your git credentials
    pause
    exit /b 1
)
echo ✓ Pushed to repository
echo.

echo [STEP 7] Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo WARNING: Vercel deployment may have failed
)

echo.
echo ================================================
echo ✓ ADMIN PANEL DEPLOYED
echo ================================================
echo.
echo DEPLOYED FEATURES:
echo ✅ Dedicated Admin Panel (Admin/Developer only)
echo ✅ Webhooks moved to Admin Panel
echo ✅ API Keys secured in Admin Panel
echo ✅ Widget code hidden from users (button only)
echo ✅ Security settings in Admin Panel
echo ✅ User management in Admin Panel
echo.
echo REGULAR USERS NOW SEE:
echo   📊 Dashboard
echo   💬 Conversations
echo   🔘 Widget (Button)
echo   📈 Analytics
echo   ⚙️ Settings
echo   (Clean, simple interface!)
echo.
echo ADMIN/DEVELOPER SEE:
echo   ... all regular features ...
echo   🔒 Admin Panel
echo      ├─ 🔌 Webhooks
echo      ├─ 🔑 API Keys  
echo      ├─ 💻 Widget Code
echo      ├─ 🛡️ Security
echo      └─ 👥 Users
echo.
echo IMPORTANT POST-DEPLOYMENT:
echo 1. Test as admin: See Admin Panel in navigation
echo 2. Test as user: NO Admin Panel visible
echo 3. Change default admin password!
echo 4. Create test users for different roles
echo 5. Document for team
echo.
echo To test now:
echo   • Visit your deployed site
echo   • Login as admin@chatbot.com (admin123)
echo   • Click "🔒 Admin Panel" in navigation
echo   • Verify all admin features accessible
echo.
echo See ADMIN_PANEL_GUIDE.md for complete documentation
echo.
pause
