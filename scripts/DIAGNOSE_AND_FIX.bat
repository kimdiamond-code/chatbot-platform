@echo off
echo.
echo ================================================================
echo  🔍 DIAGNOSTIC: Find and Fix Integrations Table Issues
echo ================================================================
echo.
echo The 400 Bad Request errors suggest the table structure is wrong.
echo This will diagnose the exact problem and fix it automatically.
echo.
echo ================================================================
echo.
echo Opening Supabase SQL Editor...
start https://supabase.com/dashboard/project/aidefvxiaaekzwflxqtd/sql
echo.
echo Opening diagnostic SQL script...
start notepad "DIAGNOSTIC_AND_FIX.sql"
echo.
echo ================================================================
echo 📋 INSTRUCTIONS:
echo.
echo 1. Copy ALL the SQL from the diagnostic file
echo 2. Paste it into Supabase SQL Editor
echo 3. Click "Run" button
echo 4. Review the output to see what was wrong
echo 5. The script will automatically fix any issues found
echo.
echo 🔍 What this script does:
echo   - Checks current table structure
echo   - Identifies missing columns or wrong types
echo   - Fixes RLS and permission issues
echo   - Recreates table if needed
echo   - Verifies the fix worked
echo.
echo ✅ After running, refresh your app and test again!
echo ================================================================
echo.
pause