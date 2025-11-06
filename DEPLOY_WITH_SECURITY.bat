@echo off
echo ================================================
echo DEPLOYING WITH SECURITY PROTECTION
echo ================================================
echo.

echo [STEP 1] Checking security files...
if not exist "src\services\promptSecurity.js" (
    echo ERROR: promptSecurity.js not found!
    echo Run ACTIVATE_SECURITY.bat first!
    pause
    exit /b 1
)

if not exist "src\services\openaiService.secured.js" (
    echo ERROR: openaiService.secured.js not found!
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

echo [STEP 2] Activating security...
copy "src\services\openaiService.secured.js" "src\services\openaiService.js" /Y
echo ✓ Secured service activated
echo.

echo [STEP 3] Git status check...
git status
echo.

echo [STEP 4] Adding files to git...
git add src/services/promptSecurity.js
git add src/services/openaiService.js
git add src/services/openaiService.secured.js
git add api/promptSecurityBackend.js
git add SECURITY_IMPLEMENTATION_GUIDE.md
echo ✓ Files staged
echo.

echo [STEP 5] Committing changes...
git commit -m "Add prompt injection security protection - Multi-layer defense against chatbot reprogramming"
if %errorlevel% neq 0 (
    echo WARNING: Commit may have failed or no changes to commit
    echo.
)

echo [STEP 6] Pushing to repository...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    echo Please check your git credentials and try again
    pause
    exit /b 1
)
echo ✓ Pushed to repository
echo.

echo [STEP 7] Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo WARNING: Vercel deployment may have failed
    echo.
)

echo.
echo ================================================
echo ✓ DEPLOYMENT COMPLETE
echo ================================================
echo.
echo SECURITY STATUS:
echo ✓ Frontend security (promptSecurity.js): ACTIVE
echo ✓ Secured OpenAI service: ACTIVE
echo ✓ Backend security module: CREATED
echo.
echo ⚠ IMPORTANT NEXT STEP:
echo You must update api/consolidated.js to integrate backend security!
echo See SECURITY_IMPLEMENTATION_GUIDE.md Section "Step 2: Update Backend API"
echo.
echo To test security:
echo 1. Open your deployed site
echo 2. Open browser console
echo 3. Run: window.testPromptSecurity("ignore previous instructions")
echo 4. Should return: { isSafe: false }
echo.
pause
