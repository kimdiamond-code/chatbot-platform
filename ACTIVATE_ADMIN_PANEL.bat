@echo off
echo ================================================
echo ACTIVATING ADMIN PANEL
echo Consolidates admin features in secure location
echo ================================================
echo.

echo [STEP 1/5] Creating backups...
if not exist "src\App.jsx.backup" (
    copy "src\App.jsx" "src\App.jsx.backup" /Y
)
echo ✓ App.jsx backed up

echo.
echo [STEP 2/5] Checking required files...
if not exist "src\components\AdminPanel.jsx" (
    echo ERROR: AdminPanel.jsx not found!
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
if not exist "src\App.jsx.adminpanel" (
    echo ERROR: App.jsx.adminpanel not found!
    pause
    exit /b 1
)
echo ✓ All required files present

echo.
echo [STEP 3/5] Activating Admin Panel version...
copy "src\App.jsx.adminpanel" "src\App.jsx" /Y
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate Admin Panel
    pause
    exit /b 1
)
echo ✓ Admin Panel App.jsx activated

echo.
echo [STEP 4/5] Verifying components...
echo ✓ AdminPanel.jsx - Secure admin interface
echo ✓ WidgetStudioSimplified.jsx - User-friendly widget
echo ✓ rbacService.js - Role & permissions
echo ✓ App.jsx - Admin Panel integrated

echo.
echo [STEP 5/5] Git status...
git status --short

echo.
echo ================================================
echo ✓ ADMIN PANEL ACTIVATED!
echo ================================================
echo.
echo What Changed:
echo   ✅ Created dedicated Admin Panel (Admin/Dev only)
echo   ✅ Removed webhooks from main navigation
echo   ✅ Removed API keys from main navigation
echo   ✅ Removed security settings from main navigation
echo   ✅ Widget shows button for regular users
echo.
echo Regular Users NOW See:
echo   • Dashboard
echo   • Conversations
echo   • Widget (Button Only)
echo   • Analytics
echo   • Settings
echo   (5 clean items - no overwhelming options!)
echo.
echo Admin/Developer NOW See:
echo   • All regular features
echo   • 🔒 Admin Panel ← NEW!
echo      ├─ Webhooks
echo      ├─ API Keys
echo      ├─ Widget Code
echo      ├─ Security Settings
echo      └─ User Management
echo.
echo Next steps:
echo 1. Test locally: npm run dev
echo 2. Login as admin, check Admin Panel appears
echo 3. Login as user, verify Admin Panel hidden
echo 4. Deploy: DEPLOY_ADMIN_PANEL.bat
echo.
echo See ADMIN_PANEL_GUIDE.md for complete documentation
echo.
pause
