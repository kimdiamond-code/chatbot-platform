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
  constructor() {
    this.conversations = new Map(); // Store conversation contexts
    this.knowledgeBase = new Map(); // Store bot knowledge bases
    this.openaiClient = null; // Initialize lazily
    this.maxPromptLength = 4000; // Maximum length for system prompts
    this.maxRetries = 3; // Maximum number of retries for API calls
    this.defaultSystemPrompt = "You are a helpful customer service assistant for True Citrus. You are professional, friendly, and concise.\n\n" + 
      "You help customers with their questions and try to resolve their issues.\n\n" +
      "For order tracking and product inquiries:\n" +
      "1. Ask for the customer's email address if not provided\n" +
      "2. Help search for products when customers ask about them\n" +
      "3. Assist with shopping cart operations when needed\n\n" +
      "Always gather required information in a friendly way:\n" +
      "- For orders: \"I'll help you track your order! Could you please provide your email address?\"\n" +
      "- For products: \"I'll help you find what you're looking for! What type of products are you interested in?\"\n\n" +
      "After getting the required information:\n" +
      "- Use the available integrations to look up order status\n" +
      "- Search product catalog for relevant items\n" +
      "- Help with cart management\n\n" +
      "Never promise to do something you cannot do. Always ask for necessary information first.";

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
}

// Create singleton instance
const service = new ChatBotService();

// Add diagnostic functions in browser environment
if (typeof window !== 'undefined') {
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