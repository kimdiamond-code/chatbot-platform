// Simple OpenAI Test - Add to your API routes
// Test direct OpenAI without fallback complexity

import OpenAI from 'openai';

export const testOpenAIEndpoint = async () => {
  console.log('🧪 Direct OpenAI Test Started');
  
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length,
      format: apiKey?.startsWith('sk-proj-') ? 'Valid' : 'Invalid'
    });
    
    if (!apiKey) {
      throw new Error('No API key found');
    }
    
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    console.log('🤖 Making OpenAI API call...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OpenAI is working correctly!"' }
      ],
      max_tokens: 50,
      temperature: 0.1
    });
    
    const result = response.choices[0].message.content;
    console.log('✅ OpenAI Response:', result);
    
    return {
      success: true,
      response: result,
      source: 'direct_openai'
    };
    
  } catch (error) {
    console.error('❌ OpenAI Test Failed:', error);
    return {
      success: false,
      error: error.message,
      source: 'openai_error'
    };
  }
};

// Test function you can call in console
window.testOpenAI = testOpenAIEndpoint;
