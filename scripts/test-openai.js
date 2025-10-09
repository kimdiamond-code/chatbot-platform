// Quick OpenAI Connection Test
// Run this with: node test-openai.js

import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

async function testOpenAI() {
    console.log('🔍 Testing OpenAI Integration...');
    console.log('');
    
    // Check API key
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    console.log('📋 Environment Check:');
    console.log('- API Key exists:', !!apiKey);
    console.log('- API Key length:', apiKey ? apiKey.length : 'N/A');
    console.log('- API Key format:', apiKey ? (apiKey.startsWith('sk-proj-') ? '✅ Project key' : '❌ Invalid format') : 'N/A');
    console.log('');
    
    if (!apiKey) {
        console.error('❌ No API key found in environment variables');
        console.log('💡 Make sure VITE_OPENAI_API_KEY is set in .env file');
        return;
    }
    
    try {
        // Initialize OpenAI client
        console.log('🤖 Initializing OpenAI client...');
        const openai = new OpenAI({
            apiKey: apiKey,
        });
        
        // Test API call
        console.log('📡 Testing API call...');
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant. Respond with "OpenAI connection test successful!"' },
                { role: 'user', content: 'Test connection' }
            ],
            max_tokens: 50,
            temperature: 0.1
        });
        
        const response = completion.choices[0].message.content;
        console.log('✅ OpenAI API Response:', response);
        console.log('');
        console.log('🎉 OpenAI integration is working correctly!');
        console.log('💡 The issue might be in the browser/widget connection');
        
    } catch (error) {
        console.error('❌ OpenAI API Error:', error.message);
        console.log('');
        
        if (error.code === 'invalid_api_key') {
            console.log('💡 Fix: Check your API key in .env file');
        } else if (error.code === 'insufficient_quota') {
            console.log('💡 Fix: Add credits to your OpenAI account');
        } else if (error.code === 'rate_limit_exceeded') {
            console.log('💡 Fix: Wait a moment and try again');
        } else {
            console.log('💡 Fix: Check your internet connection and API key');
        }
    }
}

testOpenAI();
