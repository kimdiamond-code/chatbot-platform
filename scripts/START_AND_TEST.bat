@echo off
cls
echo ===============================================
echo   🔧 OPENAI FIX TEST - STEP BY STEP
echo ===============================================
echo.
echo STEP 1: Starting development server...
echo ⏳ Please wait for server to start...
echo.
echo STEP 2: When you see "Local: http://localhost:5173/"
echo   👉 Open that URL in your browser
echo.
echo STEP 3: In your browser:
echo   👉 Press F12 to open developer console
echo   👉 Click the "Console" tab
echo   👉 Type: diagnoseOpenAI()
echo   👉 Press Enter
echo.
echo STEP 4: Look for this SUCCESS message:
echo   "✅ OpenAI client initialized and cached successfully"
echo.
echo ===============================================
echo   Press Ctrl+C to stop server when done
echo ===============================================
echo.

npm run dev