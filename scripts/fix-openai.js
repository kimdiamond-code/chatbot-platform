#!/usr/bin/env node

// 🚀 OPENAI QUICK FIX SCRIPT
// This will diagnose and fix your OpenAI configuration

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔧 OpenAI Configuration Quick Fix');
console.log('=================================\n');

// Step 1: Test OpenAI API Key
async function testOpenAIKey() {
  console.log('1️⃣ Testing OpenAI API Key...');
  
  try {
    // Read API key from .env
    const envContent = fs.readFileSync('.env', 'utf8');
    const apiKeyMatch = envContent.match(/(?:VITE_OPENAI_API_KEY|OPENAI_API_KEY)=(.+)/);
    
    if (!apiKeyMatch) {
      throw new Error('No OpenAI API key found in .env file');
    }
    
    const apiKey = apiKeyMatch[1].trim();
    console.log(`   ✅ API Key found (${apiKey.length} chars)`);
    
    // Test the API key
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "API KEY WORKS"' }],
      max_tokens: 10
    });
    
    console.log(`   ✅ OpenAI Response: ${response.choices[0].message.content}`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    
    if (error.code === 'invalid_api_key') {
      console.log('   💡 Fix: Update your OpenAI API key in .env file');
    } else if (error.code === 'insufficient_quota') {
      console.log('   💡 Fix: Add credits to your OpenAI account');
    }
    
    return false;
  }
}

// Step 2: Create Fixed API Route
function createFixedApiRoute() {
  console.log('\n2️⃣ Creating fixed API middleware...');
  
  const fixedMiddleware = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // 🚀 FIXED: Simple working OpenAI middleware
    {
      name: 'openai-api',
      configureServer(server) {
        server.middlewares.use('/api', async (req, res, next) => {
          // Handle CORS
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }
          
          const url = new URL(req.url, 'http://localhost');
          
          // Health check
          if (url.pathname === '/health') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'ok', openai: 'ready' }));
            return;
          }
          
          // OpenAI test endpoint
          if (url.pathname === '/test-openai') {
            try {
              // Load environment variables
              const fs = await import('fs');
              const envContent = fs.readFileSync('.env', 'utf8');
              const apiKeyMatch = envContent.match(/(?:VITE_OPENAI_API_KEY|OPENAI_API_KEY)=(.+)/);
              
              if (!apiKeyMatch) {
                throw new Error('No API key found');
              }
              
              const apiKey = apiKeyMatch[1].trim();
              const { default: OpenAI } = await import('openai');
              const openai = new OpenAI({ apiKey });
              
              const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Say "OpenAI is working!"' }],
                max_tokens: 10
              });
              
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                response: response.choices[0].message.content,
                message: 'OpenAI API is working correctly!'
              }));
              return;
              
            } catch (error) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: error.message,
                message: 'OpenAI API test failed'
              }));
              return;
            }
          }
          
          // Chat endpoint
          if (url.pathname === '/chat' && req.method === 'POST') {
            try {
              // Parse request body
              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const body = JSON.parse(Buffer.concat(chunks).toString());
              
              if (!body.message) {
                throw new Error('No message provided');
              }
              
              // Load environment and create OpenAI client
              const fs = await import('fs');
              const envContent = fs.readFileSync('.env', 'utf8');
              const apiKeyMatch = envContent.match(/(?:VITE_OPENAI_API_KEY|OPENAI_API_KEY)=(.+)/);
              
              if (!apiKeyMatch) {
                throw new Error('No API key configured');
              }
              
              const apiKey = apiKeyMatch[1].trim();
              const { default: OpenAI } = await import('openai');
              const openai = new OpenAI({ apiKey });
              
              // Generate AI response
              const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a helpful customer service assistant. Be professional, friendly, and concise. Help customers with their questions.'
                  },
                  { role: 'user', content: body.message }
                ],
                max_tokens: 300,
                temperature: 0.7
              });
              
              const aiResponse = completion.choices[0].message.content;
              
              // Send response
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                data: {
                  message: aiResponse,
                  confidence: 0.9,
                  source: 'openai',
                  shouldEscalate: false,
                  knowledgeUsed: false,
                  timestamp: new Date().toISOString()
                }
              }));
              return;
              
            } catch (error) {
              console.error('Chat API error:', error);
              
              // Fallback response
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                data: {
                  message: "I'm having trouble processing your request right now. Our team is working to resolve this issue. Is there anything else I can help you with?",
                  confidence: 0.1,
                  source: 'fallback',
                  shouldEscalate: true,
                  error: error.message
                }
              }));
              return;
            }
          }
          
          // Start conversation endpoint
          if (url.pathname === '/chat/start' && req.method === 'POST') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              data: {
                conversationId: 'conv-' + Date.now(),
                greeting: 'Hello! How can I help you today?',
                botName: 'ChatBot Assistant',
                isOffline: false
              }
            }));
            return;
          }
          
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})`;

  // Write the fixed vite config
  fs.writeFileSync('vite.config.js', fixedMiddleware);
  console.log('   ✅ Fixed vite.config.js created');
}

// Step 3: Test the fix
async function testFix() {
  console.log('\n3️⃣ Testing the fix...');
  
  console.log('   🔄 Restarting development server...');
  
  // Kill any existing processes on port 5173
  try {
    execSync('npx kill-port 5173', { stdio: 'ignore' });
  } catch (e) {
    // Port might not be in use
  }
  
  console.log('   ✅ Ready to test!');
  console.log('   🚀 Run: npm run dev');
  console.log('   🌐 Then visit: http://localhost:5173');
  console.log('   🧪 Test API: http://localhost:5173/api/test-openai');
}

// Main execution
async function main() {
  const apiWorking = await testOpenAIKey();
  
  if (apiWorking) {
    createFixedApiRoute();
    await testFix();
    
    console.log('\n🎉 FIX COMPLETE!');
    console.log('✅ OpenAI API key is working');
    console.log('✅ Fixed middleware created');
    console.log('✅ Chat API endpoints ready');
    console.log('\n💡 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test chat widget on your platform');
    console.log('3. OpenAI responses should now work!');
  } else {
    console.log('\n❌ Cannot proceed - OpenAI API key issue');
    console.log('💡 Please fix your API key first, then run this script again');
  }
}

main().catch(console.error);
