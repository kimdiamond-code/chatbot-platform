@echo off
echo ================================================================
echo    🤖 ChatBot Platform - OpenAI Integration Setup
echo ================================================================
echo.
echo Installing OpenAI dependencies...
echo.

npm install openai@^4.0.0 @supabase/supabase-js@^2.39.0

echo.
echo ✅ Dependencies installed!
echo.
echo ================================================================
echo    📋 NEXT STEPS:
echo ================================================================
echo.
echo 1. Get OpenAI API Key:
echo    Visit: https://platform.openai.com/api-keys
echo.
echo 2. Edit .env file and replace:
echo    VITE_OPENAI_API_KEY=sk-your-actual-key-here
echo.
echo 3. Restart the development server:
echo    npm run dev
echo.
echo 4. Test your AI chatbot in the Live Chat section!
echo.
echo ================================================================
pause