@echo off
echo ========================================
echo   TESTING BUILD ONLY (NO DEPLOY)
echo ========================================
echo.
echo This will test if your code builds correctly
echo without actually deploying to Vercel.
echo.

cd /d "%~dp0"

echo Cleaning previous build...
if exist dist rmdir /s /q dist

echo.
echo Running build...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Your code compiles without errors.
    echo Ready to deploy.
    echo.
    echo Next steps:
    echo 1. Run: SIMPLE_DEPLOY.bat
    echo    OR
    echo 2. Run: GIT_PUSH_SECURE.bat
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ BUILD FAILED!
    echo ========================================
    echo.
    echo Look at the error messages above.
    echo.
    echo Common fixes:
    echo - Check for missing commas or brackets
    echo - Check for typos in import statements
    echo - Make sure all files are saved
    echo.
    echo If you see syntax errors, share them with me
    echo and I'll help fix them.
    echo.
)

pause
