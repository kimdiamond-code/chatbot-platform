@echo off
echo.
echo ================================================================
echo  🔧 QUICK FIX: Shopify Integration Database
echo ================================================================
echo.
echo This will fix the "credentials column" error in 2 simple steps:
echo.
echo STEP 1: Fix the integrations table (run this first)
echo STEP 2: Test the basic integration (OAuth disabled temporarily)
echo.
echo ================================================================
echo.
echo Opening Supabase dashboard...
start https://supabase.com/dashboard/project/aidefvxiaaekzwflxqtd/sql
echo.
echo Opening the SQL fix file...
start notepad "STEP1_FIX_INTEGRATIONS.sql"
echo.
echo ================================================================
echo 📋 INSTRUCTIONS:
echo.
echo 1. Copy ALL the SQL from the notepad file
echo 2. Paste it into the Supabase SQL Editor 
echo 3. Click "Run" button
echo 4. Refresh your app and test Shopify integration
echo.
echo ✅ After this works, we'll add the full OAuth features!
echo ================================================================
echo.
pause