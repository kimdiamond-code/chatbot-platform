@echo off
echo.
echo ==========================================
echo  🔍 OPENAI CONFIGURATION DIAGNOSTIC
echo ==========================================
echo.

echo 📁 Navigating to project directory...
cd /d "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo.
echo 🔧 Checking environment configuration...
if exist .env (
    echo ✅ .env file exists
    findstr "VITE_OPENAI_API_KEY" .env >nul
    if errorlevel 1 (
        echo ❌ OpenAI API key not found in .env
    ) else (
        echo ✅ OpenAI API key found in .env
    )
) else (
    echo ❌ .env file missing
)

echo.
echo 📦 Checking OpenAI package installation...
if exist "node_modules\openai" (
    echo ✅ OpenAI package installed
) else (
    echo ❌ OpenAI package missing - installing...
    npm install openai
)

echo.
echo 🧪 Testing OpenAI API key...
node -e "
const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  let apiKey = null;
  
  for (const line of lines) {
    if (line.startsWith('VITE_OPENAI_API_KEY=')) {
      apiKey = line.split('=')[1];
      break;
    }
  }
  
  if (!apiKey) {
    console.log('❌ API key not found in .env file');
    process.exit(1);
  }
  
  console.log('✅ API Key Format Check:');
  console.log('  - Length:', apiKey.length);
  console.log('  - Starts with sk-proj-:', apiKey.startsWith('sk-proj-'));
  console.log('  - Starts with sk-:', apiKey.startsWith('sk-'));
  console.log('  - First 10 chars:', apiKey.substring(0, 10) + '...');
  
  if (apiKey.length < 50) {
    console.log('⚠️  API key seems too short');
  }
  
  if (!apiKey.startsWith('sk-')) {
    console.log('❌ API key format invalid (should start with sk-)');
  }
  
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}
"

echo.
echo 🌐 Testing OpenAI API connection...
node -e "
async function testOpenAI() {
  try {
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    let apiKey = null;
    
    for (const line of lines) {
      if (line.startsWith('VITE_OPENAI_API_KEY=')) {
        apiKey = line.split('=')[1];
        break;
      }
    }
    
    if (!apiKey) {
      console.log('❌ No API key found');
      return;
    }
    
    console.log('🔍 Importing OpenAI...');
    const { default: OpenAI } = await import('./node_modules/openai/index.mjs');
    
    console.log('🔍 Creating OpenAI client...');
    const openai = new OpenAI({
      apiKey: apiKey.trim()
    });
    
    console.log('🔍 Testing API call...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Respond with exactly: OpenAI connection successful!' },
        { role: 'user', content: 'test' }
      ],
      max_tokens: 10,
      temperature: 0
    });
    
    console.log('✅ OpenAI API Response:', response.choices[0].message.content);
    console.log('✅ OpenAI configuration is working correctly!');
    
  } catch (error) {
    console.log('❌ OpenAI API Error:');
    console.log('  - Message:', error.message);
    console.log('  - Code:', error.code);
    console.log('  - Type:', error.type);
    console.log('  - Status:', error.status);
    
    if (error.code === 'invalid_api_key') {
      console.log('💡 Fix: Check your OpenAI API key in .env file');
    }
    if (error.code === 'insufficient_quota') {
      console.log('💡 Fix: Add credits to your OpenAI account');
    }
    if (error.message.includes('fetch')) {
      console.log('💡 Fix: Check internet connection');
    }
  }
}

testOpenAI();
"

echo.
echo 🔍 Checking server-side service files...
if exist "src\services\serverOpenaiService.js" (
    echo ✅ Server OpenAI service exists
) else (
    echo ❌ Server OpenAI service missing
)

if exist "src\services\secureApiRoutes.js" (
    echo ✅ Secure API routes exist
) else (
    echo ❌ Secure API routes missing
)

echo.
echo 🚀 Testing development server API endpoints...
echo Starting development server in background...
start /B npm run dev

echo Waiting for server to start...
timeout /t 10 /nobreak > nul

echo.
echo 🧪 Testing API endpoints...
curl -s "http://localhost:5173/api/health" 2>nul | findstr "success\|error\|status" && (
    echo ✅ Health endpoint working
) || (
    echo ❌ Health endpoint not responding
)

curl -s "http://localhost:5173/api/test-openai" 2>nul | findstr "success\|error" && (
    echo ✅ OpenAI test endpoint working
) || (
    echo ❌ OpenAI test endpoint not responding
)

echo.
echo ==========================================
echo  📋 DIAGNOSTIC COMPLETE
echo ==========================================
echo.
echo If any tests failed, the issue is identified above.
echo If all tests pass, OpenAI should be working in your chat widget.
echo.
pause
