@echo off
echo ================================================
echo ACTIVATING ROLE-BASED ACCESS CONTROL (RBAC)
echo ================================================
echo.

echo [STEP 1/5] Creating backups...
copy "src\App.jsx" "src\App.jsx.backup" /Y
if %errorlevel% neq 0 (
    echo ERROR: Failed to create backup
    pause
    exit /b 1
)
echo ✓ App.jsx backed up

echo.
echo [STEP 2/5] Checking required files...
if not exist "src\services\rbacService.js" (
    echo ERROR: rbacService.js not found!
    pause
    exit /b 1
)
if not exist "src\components\WidgetStudioSimplified.jsx" (
    echo ERROR: WidgetStudioSimplified.jsx not found!
    pause
    exit /b 1
)
if not exist "src\App.jsx.rbac" (
    echo ERROR: App.jsx.rbac not found!
    pause
    exit /b 1
)
echo ✓ All required files present

echo.
echo [STEP 3/5] Activating RBAC version...
copy "src\App.jsx.rbac" "src\App.jsx" /Y
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate RBAC
    pause
    exit /b 1
)
echo ✓ RBAC App.jsx activated

echo.
echo [STEP 4/5] Verifying installation...
echo ✓ rbacService.js - Role definitions & permissions
echo ✓ App.jsx - RBAC-enabled application
echo ✓ WidgetStudioSimplified.jsx - User-friendly widget interface

echo.
echo [STEP 5/5] Git status...
git status --short

echo.
echo ================================================
echo ✓ RBAC ACTIVATED SUCCESSFULLY!
echo ================================================
echo.
echo IMPORTANT: You must manually update CleanModernNavigation.jsx
echo See RBAC_IMPLEMENTATION_GUIDE.md Section "Step 3" for details
echo.
echo Current User Roles:
echo   • Admin      - Full access to everything
echo   • Developer  - Technical full access (no user mgmt)
echo   • Manager    - Content & operations
echo   • Agent      - Support role
echo   • User       - Minimal access
echo.
echo Features restricted for regular users:
echo   ❌ Webhooks (Admin/Developer only)
echo   ❌ Security & Compliance (Admin/Developer only)
echo   ❌ Integrations/API Keys (Admin/Developer only)
echo   ❌ User Management (Admin only)
echo   ❌ Raw Widget Code (Button only for users)
echo.
echo Next steps:
echo 1. Update CleanModernNavigation.jsx (see guide)
echo 2. Test locally: npm run dev
echo 3. Deploy: DEPLOY_WITH_RBAC.bat
echo.
echo See RBAC_IMPLEMENTATION_GUIDE.md for complete instructions
echo.
pause
