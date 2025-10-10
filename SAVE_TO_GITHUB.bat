@echo off
cls
echo ============================================
echo   Save Changes to GitHub
echo ============================================
echo.

cd /d "%~dp0"

REM Check if connected to GitHub
git remote -v > temp_remote.txt
findstr /C:"github.com" temp_remote.txt >nul
if %errorlevel% neq 0 (
    del temp_remote.txt
    echo ✗ GitHub not connected!
    echo.
    echo Please run SETUP_GITHUB.bat first
    echo.
    pause
    exit /b 1
)
del temp_remote.txt

echo Enter a brief description of your changes:
set /p COMMIT_MSG="Message: "

if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG="Update files"
)

echo.
echo [1/3] Staging files...
git add .
if %errorlevel% neq 0 (
    echo   ✗ Failed to stage files
    pause
    exit /b 1
)
echo   ✓ Files staged

echo.
echo [2/3] Creating commit...
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo   ⚠ No changes detected or commit failed
    pause
    exit /b 1
)
echo   ✓ Commit created

echo.
echo [3/3] Pushing to GitHub...
git push
if %errorlevel% neq 0 (
    echo   ✗ Push failed
    pause
    exit /b 1
)
echo   ✓ Pushed to GitHub

echo.
echo ============================================
echo   ✓ SUCCESS
echo ============================================
echo.
echo Your changes are saved to GitHub!
echo Vercel will automatically deploy in 2-3 minutes.
echo.
pause
