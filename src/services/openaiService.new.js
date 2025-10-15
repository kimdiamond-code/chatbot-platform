// OpenAI Service with Enhanced Error Handling
import OpenAI from 'openai';

// Utility functions
function retryDelay(attempt) {
  return Math.min(1000 * Math.pow(2, attempt), 10000);
}

async function safeJSONParse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('❌ JSON Parse Error:', e);
    console.log('📝 Raw response:', text);
    throw new Error(`Invalid JSON: ${text.substring(0, 100)}...`);
  }
}

async function safeFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await safeJSONParse(response);
}

class ChatBotService {
  constructor() {
    this.client = null;
    this.conversations = new Map();
    this.maxRetries = 3;
  }

  async getClient() {
    if (this.client) return this.client;

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    return this.client;
  }

  async generateResponse(message, conversationId) {
    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay(attempt)));
        }

        const client = await this.getClient();
        const conversation = this.conversations.get(conversationId) || { messages: [] };

        const messages = [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...conversation.messages.slice(-5),
          { role: 'user', content: message }
        ];

        const completion = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500,
          temperature: 0.7
        });

        const response = completion.choices[0].message.content;

        // Verify response can be safely stringified
        JSON.parse(JSON.stringify({ response }));

        conversation.messages.push(
          { role: 'user', content: message },
          { role: 'assistant', content: response }
        );

        this.conversations.set(conversationId, conversation);

        return {
          response,
          source: 'openai',
          confidence: 0.9
        };

      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error;

        if (error.message?.includes('API key') || error.status === 401) {
          break; // Don't retry auth errors
        }
      }
    }

    // All retries failed
    console.error('All retries failed:', lastError);
    return {
      response: "I'm having trouble connecting right now. Please try again in a moment.",
      source: 'fallback',
      confidence: 0.5,
      error: lastError.message
    };
  }
}

// Create singleton instance
const chatBotService = new ChatBotService();

// Add global error handler for uncaught promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    if (event.reason instanceof SyntaxError && event.reason.message.includes('JSON')) {
      console.log('JSON Parse Error Details:', {
        message: event.reason.message,
        stack: event.reason.stack
      });
    }
  });
}

export default chatBotService;