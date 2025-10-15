// ChatBot Service with OpenAI Integration
// Handles AI responses, knowledge base, and conversation management

// Utility functions
const retryDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000);

const safeJSONParse = async (response) => {
  try {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      console.log('📝 Raw response:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  } catch (e) {
    console.error('❌ Response Text Error:', e);
    throw new Error('Failed to read response body');
  }
};

const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await safeJSONParse(response);
  } catch (error) {
    console.error(`❌ Fetch Error (${url}):`, error);
    throw error;
  }
};

// Custom error classes for better error handling
class ChatBotError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ChatBotError';
    this.code = code;
    this.details = details;
  }
}

class APIError extends ChatBotError {
  constructor(message, details = {}) {
    super(message, 'API_ERROR', details);
    this.name = 'APIError';
  }
}

class ValidationError extends ChatBotError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

class ChatBotService {
  // Error handler methods
  handleApiError(error) {
    console.error('❌ API Error:', error);
    throw new APIError('OpenAI API error', { originalError: error });
  }

  handleConnectionError(error) {
    console.error('❌ Connection Error:', error);
    throw new APIError('Connection error', { originalError: error });
  }

  constructor() {
    this.conversations = new Map(); // Store conversation contexts
    this.knowledgeBase = new Map(); // Store bot knowledge bases
    this.openaiClient = null; // Initialize lazily
    this.maxPromptLength = 4000; // Maximum length for system prompts
    this.maxRetries = 3; // Maximum number of retries for API calls
    this.defaultSystemPrompt = "You are a helpful customer service assistant for the connected e-commerce store. You are professional, friendly, and concise.\n\n" + 
      "IMPORTANT RULES:\n" +
      "- You work ONLY for this store - NEVER suggest other websites, competitors, or external retailers\n" +
      "- NEVER say 'I don't have access to' or 'I cannot browse' - you DO have access to this store's data\n" +
      "- When customers ask about products, ALWAYS search the store's catalog\n" +
      "- If a product isn't found, say it's not currently available in THIS store, offer alternatives from THIS store\n" +
      "- NEVER recommend customers go elsewhere\n\n" +
      "You help customers with:\n" +
      "1. Product search and recommendations (use store's catalog)\n" +
      "2. Order tracking (ask for email if needed)\n" +
      "3. Shopping assistance (help with cart)\n" +
      "4. Store policies and information\n\n" +
      "For product questions:\n" +
      "- Search the store's products immediately\n" +
      "- Show relevant items with details and prices\n" +
      "- Offer alternatives from the same store if needed\n\n" +
      "For order tracking:\n" +
      "- Ask for customer's email address politely\n" +
      "- Look up their order status\n" +
      "- Provide tracking information\n\n" +
      "Always be helpful and focused on THIS store's offerings only.";

    // Initialize error handlers
    this.handleApiError = this.handleApiError.bind(this);
    this.handleConnectionError = this.handleConnectionError.bind(this);
  }

  // Sanitize and validate prompt content
  sanitizePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      console.warn('⚠️ Invalid prompt format, using default');
      return this.defaultSystemPrompt;
    }

    try {
      // Remove any potential JSON-breaking characters
      let sanitized = prompt
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\u2028/g, '\\n') // Line separator
        .replace(/\u2029/g, '\\n\\n'); // Paragraph separator

      // Ensure it's valid JSON when wrapped in quotes (basic JSON safety check)
      JSON.parse(`"${sanitized}"`);

      // Truncate if too long
      if (sanitized.length > this.maxPromptLength) {
        sanitized = sanitized.substring(0, this.maxPromptLength - 3) + '...';
      }

      return sanitized;
    } catch (error) {
      console.error('❌ Prompt sanitization error:', error);
      return this.defaultSystemPrompt;
    }
  }

  // Update bot configuration
  updateBotConfig(conversationId, config) {
    let conversation = this.conversations.get(conversationId) || { messages: [] };
    conversation.systemPrompt = config.systemPrompt || this.defaultSystemPrompt;
    this.conversations.set(conversationId, conversation);
  }

  // Get conversation context
  getConversationContext(conversationId) {
    return this.conversations.get(conversationId) || { messages: [] };
  }

  // Clear conversation context
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }

  /**
   * Generate AI response using OpenAI API via backend proxy
   */
  async generateResponse(userMessage, conversationId, customerContext = {}) {
    try {
      console.log('🤖 Generating OpenAI response for:', userMessage.substring(0, 50));
      
      // Get or create conversation context
      let conversation = this.conversations.get(conversationId) || {
        messages: [],
        systemPrompt: this.defaultSystemPrompt
      };

      // Build messages array for OpenAI
      const messages = [
        { role: 'system', content: conversation.systemPrompt },
        ...conversation.messages.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage }
      ];

      // Call OpenAI API via backend proxy
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: 'openai',
          action: 'chat',
          messages: messages,
          model: 'gpt-4o-mini',
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate response');
      }

      const result = await response.json();
      const data = result.data;
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I\'m having trouble generating a response right now.';

      // Update conversation history
      conversation.messages.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      );
      this.conversations.set(conversationId, conversation);

      console.log('✅ OpenAI response generated');
      
      return {
        response: aiResponse,
        confidence: 0.8,
        source: 'openai',
        metadata: {
          model: 'gpt-4o-mini',
          tokens: data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('❌ OpenAI generateResponse error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const service = new ChatBotService();

// Add diagnostic functions in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
    if (event.reason instanceof SyntaxError && event.reason.message.includes('JSON')) {
      console.log('📝 JSON Parse Error Details:', {
        message: event.reason.message,
        stack: event.reason.stack
      });
    }
  });

  // Add safe diagnostic function
  window.diagnoseOpenAI = async () => {
    try {
      return await service.diagnoseOpenAI();
    } catch (error) {
      console.error('Diagnostic error:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Add safe test function
  window.testChatBot = async (message = 'Hello, test message') => {
    try {
      if (!message || typeof message !== 'string') {
        throw new ValidationError('Invalid message format');
      }
      return await service.generateResponse(message, 'browser-test');
    } catch (error) {
      console.error('Test error:', error);
      return { success: false, error: error.message };
    }
  };
}

// Export both default and named exports
export const chatBotService = service;
export default service;