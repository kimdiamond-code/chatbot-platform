@echo off
echo ================================================
echo ACTIVATING PROMPT INJECTION SECURITY
echo ================================================
echo.

echo [1/4] Creating backup of original openaiService.js...
copy "src\services\openaiService.js" "src\services\openaiService.original.js" /Y
if %errorlevel% neq 0 (
    echo ERROR: Failed to create backup
    pause
    exit /b 1
)
echo ✓ Backup created

echo.
echo [2/4] Activating secured OpenAI service...
copy "src\services\openaiService.secured.js" "src\services\openaiService.js" /Y
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate secured service
    pause
    exit /b 1
)
echo ✓ Secured service activated

echo.
echo [3/4] Verifying files...
if not exist "src\services\promptSecurity.js" (
    echo ERROR: promptSecurity.js not found!
    pause
    exit /b 1
)
if not exist "api\promptSecurityBackend.js" (
    echo ERROR: promptSecurityBackend.js not found!
    pause
    exit /b 1
)
echo ✓ All security files present

echo.
echo [4/4] Installing dependencies (if needed)...
call npm install 2>nul
echo ✓ Dependencies checked

echo.
echo ================================================
echo ✓ SECURITY ACTIVATED SUCCESSFULLY!
echo ================================================
echo.
echo Next steps:
echo 1. Update api/consolidated.js with backend security (see SECURITY_IMPLEMENTATION_GUIDE.md)
echo 2. Test security: Open browser console and run window.testPromptSecurity()
echo 3. Deploy: Run DEPLOY_WITH_SECURITY.bat
echo.
echo IMPORTANT: Review SECURITY_IMPLEMENTATION_GUIDE.md for backend integration!
echo.
pause
