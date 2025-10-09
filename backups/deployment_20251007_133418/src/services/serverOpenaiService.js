// ✅ FIXED: Server-Side OpenAI Service (Secure Implementation)
// This file handles OpenAI API calls on the server-side only, keeping API keys secure

// Server-side OpenAI service that works properly in Node.js environment
class ServerOpenAIService {
  constructor() {
    this.openaiClient = null;
    this.conversations = new Map(); // Store conversation contexts
    this.isInitialized = false;
  }

  // Initialize OpenAI client - server-side only
  async initializeOpenAI() {
    if (this.isInitialized) {
      return this.openaiClient !== null;
    }

    try {
      console.log('🔧 Initializing server-side OpenAI service...');
      
      // Get API key from environment - server-side only
      let apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      
      // Manual .env loading if needed
      if (!apiKey) {
        try {
          const fs = await import('fs');
          const envContent = fs.readFileSync('.env', 'utf8');
          const envLines = envContent.split('\n');
          for (const line of envLines) {
            if (line.startsWith('VITE_OPENAI_API_KEY=')) {
              apiKey = line.split('=')[1];
              break;
            }
          }
        } catch (envError) {
          console.warn('⚠️ Could not read .env file:', envError.message);
        }
      }
      
      console.log('🔍 OpenAI API Key Status:', {
        hasKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        keyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'none',
        isValidFormat: apiKey ? apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-') : false
      });
      
      if (!apiKey || apiKey === 'your-openai-key' || apiKey.trim() === '') {
        console.error('❌ OpenAI API key not configured properly');
        console.log('💡 Expected format: sk-proj-... or sk-...');
        console.log('💡 Check .env file for VITE_OPENAI_API_KEY');
        this.isInitialized = true;
        return false;
      }

      // Import OpenAI dynamically - server-side only
      const { default: OpenAI } = await import('openai');
      
      // Create client WITHOUT dangerouslyAllowBrowser (server-side only)
      this.openaiClient = new OpenAI({
        apiKey: apiKey.trim()
        // NO dangerouslyAllowBrowser - this is server-side only
      });
      
      // Test the connection
      console.log('🧪 Testing OpenAI connection...');
      const testResponse = await this.openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Respond with exactly: "Server OpenAI connection successful!"' },
          { role: 'user', content: 'test' }
        ],
        max_tokens: 20,
        temperature: 0
      });
      
      const testResult = testResponse.choices[0].message.content;
      console.log('✅ OpenAI Test Response:', testResult);
      console.log('✅ Server-side OpenAI client initialized successfully');
      
      this.isInitialized = true;
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize server-side OpenAI client:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      this.isInitialized = true;
      return false;
    }
  }

  // Generate AI response - server-side only
  async generateResponse(message, conversationId, botConfig = null, knowledgeContext = null) {
    console.log('🤖 ServerOpenAIService.generateResponse called:', message);
    console.log('🤖 Conversation ID:', conversationId);
    
    try {
      // Ensure OpenAI is initialized
      const initialized = await this.initializeOpenAI();
      
      if (!initialized || !this.openaiClient) {
        console.log('⚡ OpenAI not available - using fallback');
        return this.getFallbackResponse(message);
      }

      // Get or create conversation context
      let conversation = this.conversations.get(conversationId) || {
        messages: [],
        systemPrompt: botConfig?.systemPrompt || 'You are a helpful customer service assistant. You are professional, friendly, and concise. You help customers with their questions and try to resolve their issues. If you cannot help with something, you suggest they speak with a human agent.'
      };

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: message
      });

      // Prepare system prompt with knowledge base context if available
      let enhancedSystemPrompt = conversation.systemPrompt;
      
      if (knowledgeContext && knowledgeContext.length > 0) {
        console.log('✅ Adding knowledge base context to OpenAI prompt');
        enhancedSystemPrompt += `\n\nRELEVANT INFORMATION:\n`;
        
        for (let i = 0; i < knowledgeContext.length; i++) {
          const context = knowledgeContext[i];
          enhancedSystemPrompt += `\n${context.content}\n`;
          console.log(`📚 Added knowledge from: ${context.source} (score: ${context.score})`);
        }
        
        enhancedSystemPrompt += `\nUse the above information to help answer the user's question. Be natural and helpful, but don't mention where the information came from. If the provided information doesn't fully answer the question, be honest about limitations and suggest speaking with a human agent.`;
      } else {
        enhancedSystemPrompt += `\n\nIf you don't have specific information about something the user asks, be honest about it and suggest they speak with a human agent for accurate details.`;
      }

      // Prepare messages for OpenAI (include enhanced system prompt)
      const messages = [
        { role: 'system', content: enhancedSystemPrompt },
        ...conversation.messages.slice(-10) // Keep last 10 messages for context
      ];
      
      console.log('🤖 Calling OpenAI API...');
      console.log('🤖 System prompt length:', enhancedSystemPrompt.length);

      // Call OpenAI API - server-side only
      const completion = await this.openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 400,
        temperature: 0.7,
        stream: false
      });

      const aiResponse = completion.choices[0].message.content;
      console.log('✅ OpenAI response received:', aiResponse.substring(0, 100) + '...');

      // Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse
      });

      // Update conversation context
      this.conversations.set(conversationId, conversation);

      console.log('✅ Server-side OpenAI response generated successfully');
      return {
        response: aiResponse,
        confidence: knowledgeContext && knowledgeContext.length > 0 ? 0.95 : 0.85,
        source: knowledgeContext && knowledgeContext.length > 0 ? 'openai+knowledge' : 'openai',
        knowledgeUsed: knowledgeContext && knowledgeContext.length > 0,
        knowledgeSources: knowledgeContext ? knowledgeContext.map(k => k.source) : [],
        shouldEscalate: this.shouldEscalateToHuman(message, aiResponse)
      };

    } catch (error) {
      console.error('❌ Server-side OpenAI API Error:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        status: error.status
      });
      
      return this.getFallbackResponse(message);
    }
  }

  // Enhanced fallback response
  getFallbackResponse(message) {
    console.log('🔄 Using server-side fallback response for:', message);
    
    const lowerMessage = message.toLowerCase();
    
    // Smart fallback based on message content
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return {
        response: "Hello! I'm here to help you with any questions you might have. What can I assist you with today?",
        confidence: 0.9,
        source: 'fallback_greeting',
        shouldEscalate: false,
        knowledgeUsed: false
      };
    }
    
    if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('person')) {
      return {
        response: "I understand you'd like to speak with a human agent. Let me connect you with someone who can better assist you.",
        confidence: 0.9,
        source: 'fallback_escalation',
        shouldEscalate: true,
        knowledgeUsed: false
      };
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return {
        response: "I'd be happy to help you! While I'm having some technical difficulties right now, I can try to assist with basic questions or connect you with a human agent for more detailed support.",
        confidence: 0.7,
        source: 'fallback_help',
        shouldEscalate: false,
        knowledgeUsed: false
      };
    }
    
    // Default honest fallback
    return {
      response: "I'm having trouble processing your request right now. For the best assistance, I'd recommend speaking with one of our human agents who can provide you with accurate information and help resolve your inquiry.",
      confidence: 0.8,
      source: 'fallback_default',
      shouldEscalate: true,
      knowledgeUsed: false
    };
  }

  // Determine if conversation should be escalated to human
  shouldEscalateToHuman(userMessage, aiResponse) {
    const escalationKeywords = [
      'human', 'agent', 'person', 'representative', 'manager', 
      'speak to someone', 'talk to someone', 'real person',
      'urgent', 'complaint', 'angry', 'frustrated'
    ];

    const userLower = userMessage.toLowerCase();
    const responseLower = aiResponse.toLowerCase();
    
    // Check if user explicitly requested human
    const userWantsHuman = escalationKeywords.some(keyword => userLower.includes(keyword));
    
    // Check if AI response suggests human help
    const aiSuggestsHuman = responseLower.includes('human agent') || 
                           responseLower.includes('speak with') ||
                           responseLower.includes('contact') ||
                           responseLower.includes("don't have") ||
                           responseLower.includes("can't help");
    
    return userWantsHuman || aiSuggestsHuman;
  }

  // Update bot configuration
  updateBotConfig(conversationId, config) {
    let conversation = this.conversations.get(conversationId) || { messages: [] };
    conversation.systemPrompt = config.systemPrompt || 'You are a helpful customer service assistant.';
    this.conversations.set(conversationId, conversation);
  }

  // Clear conversation context
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }

  // Get conversation context
  getConversationContext(conversationId) {
    return this.conversations.get(conversationId) || { messages: [] };
  }

  // Test connection endpoint
  async testConnection() {
    const initialized = await this.initializeOpenAI();
    
    if (!initialized || !this.openaiClient) {
      return {
        success: false,
        error: 'OpenAI client not initialized',
        message: 'Check API key configuration in .env file'
      };
    }
    
    try {
      const response = await this.openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a test assistant. Respond with exactly: "Server-side OpenAI is working perfectly!"' },
          { role: 'user', content: 'test connection' }
        ],
        max_tokens: 20,
        temperature: 0
      });
      
      return {
        success: true,
        response: response.choices[0].message.content,
        message: 'Server-side OpenAI connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'OpenAI API call failed'
      };
    }
  }
}

// Export singleton instance
export const serverOpenAIService = new ServerOpenAIService();
export default serverOpenAIService;
