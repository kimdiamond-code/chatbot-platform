@echo off
echo ================================================
echo DEPLOYING WITH RBAC (Role-Based Access Control)
echo ================================================
echo.

echo [STEP 1] Verifying RBAC files...
if not exist "src\services\rbacService.js" (
    echo ERROR: rbacService.js not found! Run ACTIVATE_RBAC.bat first!
    pause
    exit /b 1
)
if not exist "src\components\WidgetStudioSimplified.jsx" (
    echo ERROR: WidgetStudioSimplified.jsx not found!
    pause
    exit /b 1
)
echo ✓ RBAC files present

echo.
echo [STEP 2] Checking if RBAC is activated...
findstr /C:"rbacService" "src\App.jsx" >nul
if %errorlevel% neq 0 (
    echo WARNING: App.jsx doesn't contain rbacService import
    echo Run ACTIVATE_RBAC.bat first!
    pause
    exit /b 1
)
echo ✓ RBAC is activated in App.jsx

echo.
echo [STEP 3] Git status...
git status

echo.
echo [STEP 4] Staging RBAC files...
git add src/services/rbacService.js
git add src/components/WidgetStudioSimplified.jsx
git add src/App.jsx
git add RBAC_IMPLEMENTATION_GUIDE.md
echo ✓ Files staged

echo.
echo [STEP 5] Committing changes...
git commit -m "Implement Role-Based Access Control (RBAC) - Restrict admin features from regular users"
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
echo ✓ RBAC DEPLOYMENT COMPLETE
echo ================================================
echo.
echo RBAC Features Active:
echo ✅ 5 User Roles (Admin, Developer, Manager, Agent, User)
echo ✅ 35+ Granular Permissions
echo ✅ Feature-based Access Control
echo ✅ Simplified Widget Interface for Users
echo ✅ Admin-only features hidden from regular users
echo.
echo Restricted Features (Admin/Developer Only):
echo   • Webhooks
echo   • Security & Compliance
echo   • API Keys & Integrations
echo   • User Management (Admin only)
echo.
echo Test with different roles:
echo   admin@chatbot.com (password: admin123) - Full access
echo   Create test users via User Management page
echo.
echo IMPORTANT:
echo 1. Change default admin password immediately!
echo 2. Update CleanModernNavigation.jsx if not done
echo 3. Test all roles in production
echo 4. Remove role indicator badge in production (see guide)
echo.
echo See RBAC_IMPLEMENTATION_GUIDE.md for details
echo.
pause
