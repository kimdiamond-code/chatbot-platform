// 🔧 QUICK FIX: OpenAI Configuration Test
// Run this in your project directory: node test-openai-fix.js

console.log('🔍 OpenAI Configuration Test Starting...\n');

import fs from 'fs';
import path from 'path';

async function testOpenAISetup() {
  try {
    // Step 1: Check .env file
    console.log('1️⃣ Checking .env file...');
    const envPath = '.env';
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found');
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = envContent.match(/VITE_OPENAI_API_KEY=(.+)/);
    
    if (!apiKeyMatch) {
      console.log('❌ OpenAI API key not found in .env');
      return;
    }
    
    const apiKey = apiKeyMatch[1].trim();
    console.log('✅ API key found');
    console.log(`   Length: ${apiKey.length}`);
    console.log(`   Format: ${apiKey.startsWith('sk-proj-') ? 'Valid' : 'Invalid'}`);
    console.log(`   Preview: ${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 8)}\n`);
    
    // Step 2: Check OpenAI package
    console.log('2️⃣ Checking OpenAI package...');
    try {
      const { default: OpenAI } = await import('openai');
      console.log('✅ OpenAI package imported successfully\n');
      
      // Step 3: Test OpenAI connection
      console.log('3️⃣ Testing OpenAI API connection...');
      const openai = new OpenAI({
        apiKey: apiKey
      });
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Respond with exactly: "OpenAI is working correctly!"' },
          { role: 'user', content: 'test connection' }
        ],
        max_tokens: 20,
        temperature: 0
      });
      
      console.log('✅ OpenAI API Test Successful!');
      console.log(`   Response: ${response.choices[0].message.content}`);
      console.log(`   Model: ${response.model}`);
      console.log(`   Usage: ${response.usage.total_tokens} tokens\n`);
      
      // Step 4: Check server files
      console.log('4️⃣ Checking server implementation files...');
      const serverFiles = [
        'src/services/serverOpenaiService.js',
        'src/services/secureApiRoutes.js',
        'vite.config.js'
      ];
      
      for (const file of serverFiles) {
        if (fs.existsSync(file)) {
          console.log(`✅ ${file} exists`);
        } else {
          console.log(`❌ ${file} missing`);
        }
      }
      
      console.log('\n🎉 DIAGNOSIS COMPLETE');
      console.log('✅ OpenAI API key is working correctly!');
      console.log('✅ The issue is likely in the server middleware or routing.');
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Make sure your dev server is running: npm run dev');
      console.log('2. Test the chat widget at http://localhost:5173');
      console.log('3. Check browser console for any errors');
      console.log('4. Test API directly: http://localhost:5173/api/test-openai');
      
    } catch (importError) {
      console.log('❌ Failed to import OpenAI package');
      console.log('💡 Fix: Run "npm install openai" in your project directory');
      console.log(`   Error: ${importError.message}`);
    }
    
  } catch (apiError) {
    console.log('❌ OpenAI API Test Failed');
    console.log(`   Error: ${apiError.message}`);
    console.log(`   Code: ${apiError.code}`);
    console.log(`   Type: ${apiError.type}`);
    
    if (apiError.code === 'invalid_api_key') {
      console.log('\n💡 SOLUTION: Your API key is invalid or expired');
      console.log('   1. Check your OpenAI account at https://platform.openai.com/');
      console.log('   2. Generate a new API key if needed');
      console.log('   3. Update the VITE_OPENAI_API_KEY in your .env file');
    } else if (apiError.code === 'insufficient_quota') {
      console.log('\n💡 SOLUTION: Insufficient quota');
      console.log('   1. Add credits to your OpenAI account');
      console.log('   2. Check usage limits at https://platform.openai.com/usage');
    } else {
      console.log('\n💡 SOLUTION: Check your internet connection and try again');
    }
  }
}

// Run the test
testOpenAISetup();
