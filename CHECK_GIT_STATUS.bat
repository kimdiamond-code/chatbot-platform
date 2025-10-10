@echo off
echo ============================================
echo   Git Status Check
echo ============================================
echo.

cd /d "%~dp0"

echo Checking Git configuration...
echo.

git status
echo.

echo Remote repositories:
git remote -v
echo.

echo Recent commits:
git log --oneline -5
echo.

echo ============================================
echo.
pause
