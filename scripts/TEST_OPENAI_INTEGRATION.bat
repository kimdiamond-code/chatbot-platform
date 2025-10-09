@echo off
echo ================================================================
echo    🤖 Testing OpenAI Integration
echo ================================================================
echo.
echo Starting development server to test OpenAI...
echo.
echo This will:
echo 1. Start the platform on http://localhost:5173
echo 2. Test OpenAI API connection
echo 3. Verify bot responses work
echo.
echo ================================================================
echo AFTER SERVER STARTS:
echo ================================================================
echo 1. Go to: http://localhost:5173/widget/demo.html
echo 2. Type: "Hello, can you help me?"
echo 3. If you get an AI response, OpenAI is working! ✅
echo 4. If you get fallback response, check console for errors
echo.
echo ================================================================
echo Press Ctrl+C to stop the server when testing is complete
echo ================================================================
echo.

npm run dev
