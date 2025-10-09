@echo off
echo.
echo ================================================================
echo  🔧 SIMPLE FIX: Add Missing Credentials Column
echo ================================================================
echo.
echo The integrations table exists but is missing the credentials column.
echo This will add just the missing column - much simpler!
echo.
echo ================================================================
echo.
echo Opening Supabase SQL Editor...
start https://supabase.com/dashboard/project/aidefvxiaaekzwflxqtd/sql
echo.
echo Opening the simple SQL fix...
start notepad "ADD_MISSING_COLUMN.sql"
echo.
echo ================================================================
echo 📋 SIMPLE INSTRUCTIONS:
echo.
echo 1. Copy the SQL from the notepad file (it's very short!)
echo 2. Paste it into Supabase SQL Editor
echo 3. Click "Run"
echo 4. You should see "Credentials column added successfully!"
echo 5. Refresh your app - error will be fixed!
echo.
echo ✅ This just adds the missing column - no table recreation!
echo ================================================================
echo.
pause