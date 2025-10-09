@echo off
echo ========================================
echo Proactive Engagement - Database Setup
echo ========================================
echo.

echo This script will guide you through setting up the proactive engagement feature.
echo.
echo Step 1: Database Schema
echo -----------------------
echo Please open your Supabase Dashboard and:
echo 1. Go to: SQL Editor
echo 2. Copy the contents of: supabase\proactive_engagement_schema.sql
echo 3. Paste and run the SQL
echo.
pause

echo.
echo Step 2: Verify Installation
echo ---------------------------
echo.
echo Testing connection to Supabase...

curl -X GET "https://aidefvxiaaekzwflxqtd.supabase.co/rest/v1/proactive_triggers?limit=1" ^
-H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZGVmdnhpYWFla3p3Zmx4cXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTA0NTEsImV4cCI6MjA3MzI2NjQ1MX0.-UIvw8mL9Dad33TmlBXEH_XmqXNAtmLIFhRj51IhEOY" ^
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZGVmdnhpYWFla3p3Zmx4cXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTA0NTEsImV4cCI6MjA3MzI2NjQ1MX0.-UIvw8mL9Dad33TmlBXEH_XmqXNAtmLIFhRj51IhEOY"

echo.
echo.
echo If you see JSON data above, the setup is successful!
echo.
echo Step 3: Access the Feature
echo --------------------------
echo 1. Run: npm run dev
echo 2. Navigate to: Proactive Engagement in the menu
echo 3. You should see pre-configured triggers
echo.
echo Step 4: Widget Installation
echo ---------------------------
echo The widget script is at: public\proactive-widget.js
echo Add it to your website HTML (see PROACTIVE_ENGAGEMENT_GUIDE.md)
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo - Review triggers in the Proactive Engagement page
echo - Test triggers by enabling them
echo - Install widget on your website
echo - Monitor analytics
echo.
pause
