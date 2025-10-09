// ChatBot Service with OpenAI Integration
// Handles AI responses, knowledge base, and conversation management

class ChatBotService {
  constructor() {
    this.conversations = new Map(); // Store conversation contexts
    this.knowledgeBase = new Map(); // Store bot knowledge bases
    this.openaiClient = null; // Initialize lazily
    this.defaultSystemPrompt = `You are a helpful customer service assistant for True Citrus. You are professional, friendly, and concise. 
    You help customers with their questions and try to resolve their issues.
    
    IMPORTANT LIMITATIONS:
    - You CANNOT look up order information, track packages, or access customer accounts
    - You CANNOT search product catalogs or check inventory 
    - You CANNOT access billing information or process payments
    
    Instead of promising to "look up" or "check" information you cannot access:
    - Direct them to the True Citrus order tracking page: https://truecitrus.com/pages/track-your-order
    - Provide the customer care email: customercare@truecitrus.com
    - Suggest they log into their account at truecitrus.com
    
    For order tracking requests: "To track your order #[number], please visit our order tracking page at https://truecitrus.com/pages/track-your-order or contact customercare@truecitrus.com for assistance."
    
    Never promise to do something you cannot actually do. Always provide specific, actionable alternatives with real URLs and contact information.`;
  }

  // FIXED: Proper async initialization of OpenAI client
  async getOpenAIClient() {
    // Return cached client if already initialized
    if (this.openaiClient) {
      return this.openaiClient;
    }

    try {
      // Get API key from environment
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      console.log('🔍 OpenAI API Key Check:', {
        hasKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        keyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'none',
        environment: import.meta.env.MODE,
        productionMode: localStorage.getItem('PRODUCTION_MODE')
      });
      
      if (!apiKey || apiKey === 'your-openai-key' || apiKey === 'demo-mode' || apiKey.trim() === '') {
        console.log('🎮 Demo Mode: OpenAI API not configured - using fallback responses');
        console.log('💡 To enable OpenAI: Get API key from https://platform.openai.com/api-keys');
        console.log('💡 Expected format: sk-proj-...');
        this.openaiClient = null; // Explicitly cache null to avoid re-attempts
        return null;
      }

      // FIXED: Proper async import with error handling and module structure detection
      console.log('🔄 Importing OpenAI module...');
      const openaiModule = await import('openai');
      
      // Handle different module export patterns
      let OpenAI;
      if (openaiModule.default) {
        OpenAI = openaiModule.default;
        console.log('📦 Using default export from OpenAI module');
      } else if (openaiModule.OpenAI) {
        OpenAI = openaiModule.OpenAI;
        console.log('📦 Using named export from OpenAI module');
      } else {
        throw new Error('OpenAI class not found in module exports');
      }
      
      // Create and cache the client
      console.log('🔧 Creating OpenAI client instance...');
      this.openaiClient = new OpenAI({
        apiKey: apiKey.trim(),
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      
      // Test the client by checking if it has required methods
      if (typeof this.openaiClient.chat?.completions?.create !== 'function') {
        throw new Error('OpenAI client missing required chat.completions.create method');
      }
      
      console.log('✅ OpenAI client initialized and cached successfully');
      console.log('🚀 Ready to process AI requests');
      
      return this.openaiClient;
      
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Cache null to prevent repeated failed attempts
      this.openaiClient = null;
      
      if (error.message.includes('not found')) {
        console.log('⚠️ OpenAI package not installed - install with: npm install openai');
      } else if (error.message.includes('module')) {
        console.log('⚠️ OpenAI module import failed - check package version compatibility');
      }
      
      console.log('🎮 Using fallback responses until OpenAI is available');
      return null;
    }
  }

  // Set knowledge base for a specific bot/conversation
  setKnowledgeBase(conversationId, knowledgeItems) {
    console.log('📚 Setting knowledge base for conversation:', conversationId);
    console.log('📚 Knowledge items received:', knowledgeItems?.length || 0);
    
    if (knowledgeItems && knowledgeItems.length > 0) {
      // Log each knowledge item to see the structure
      knowledgeItems.forEach((item, index) => {
        console.log(`📚 Knowledge item ${index}:`, {
          name: item.name,
          type: item.type,
          hasContent: !!item.content,
          contentLength: item.content?.length || 0,
          hasChunks: !!item.chunks,
          chunksLength: item.chunks?.length || 0,
          keywords: item.keywords
        });
      });
    }
    
    this.knowledgeBase.set(conversationId, knowledgeItems || []);
    console.log('📚 Knowledge base set successfully');
  }

  // Search knowledge base for relevant information
  searchKnowledgeBase(conversationId, query, maxResults = 3) {
    console.log('🔍 Searching knowledge base for:', query);
    
    const knowledge = this.knowledgeBase.get(conversationId);
    console.log('🔍 Knowledge base for conversation:', {
      conversationId,
      hasKnowledge: !!knowledge,
      itemCount: knowledge?.length || 0
    });
    
    if (!knowledge || knowledge.length === 0) {
      console.log('⚠️ No knowledge base found for conversation');
      return [];
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    const results = [];
    
    console.log('🔍 Query words:', queryWords);

    // Search through all knowledge items
    for (const item of knowledge) {
      if (!item || !item.enabled) {
        console.log('🙄 Skipping disabled item:', item?.name);
        continue;
      }
      
      console.log('🔍 Processing item:', item.name);

      // Handle chunked content
      if (item.chunks && Array.isArray(item.chunks)) {
        console.log('🔍 Item has chunks:', item.chunks.length);
        
        for (let i = 0; i < item.chunks.length; i++) {
          const chunk = item.chunks[i];
          const score = this.calculateRelevanceScore(chunk, queryWords, item.keywords || []);
          
          if (score > 0) {
            console.log('✅ Found relevant chunk with score:', score);
            results.push({
              content: chunk,
              score,
              source: item.name,
              type: item.type,
              chunkIndex: i
            });
          }
        }
      } 
      // Handle full content (not chunked)
      else if (item.content) {
        console.log('🔍 Item has full content:', item.content.length, 'characters');
        
        const score = this.calculateRelevanceScore(item.content, queryWords, item.keywords || []);
        
        if (score > 0) {
          console.log('✅ Found relevant content with score:', score);
          
          // Extract relevant snippet from content
          const snippet = this.extractRelevantSnippet(item.content, queryWords);
          
          results.push({
            content: snippet,
            score,
            source: item.name,
            type: item.type,
            chunkIndex: 0
          });
        }
      } else {
        console.log('⚠️ Item has no content or chunks:', item.name);
      }
    }

    // Sort by score and return top results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
      
    console.log('📈 Knowledge search results:', {
      totalFound: results.length,
      returned: sortedResults.length,
      topScores: sortedResults.map(r => ({ source: r.source, score: r.score }))
    });
    
    return sortedResults;
  }
  
  // Calculate relevance score for content
  calculateRelevanceScore(content, queryWords, keywords = []) {
    const contentLower = content.toLowerCase();
    let score = 0;

    // Score based on query word matches
    for (const word of queryWords) {
      const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += matches;
      
      // Bonus for exact phrase matches
      if (matches > 0 && word.length > 4) {
        score += 0.5;
      }
    }

    // Score based on item keywords (higher weight)
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      for (const queryWord of queryWords) {
        if (keywordLower.includes(queryWord) || queryWord.includes(keywordLower)) {
          score += 2;
        }
      }
    }

    // Bonus for multiple query words appearing close together
    const queryPhrase = queryWords.join(' ');
    if (contentLower.includes(queryPhrase)) {
      score += 2;
    }

    return score;
  }
  
  // Extract relevant snippet from content
  extractRelevantSnippet(content, queryWords, snippetLength = 300) {
    const contentLower = content.toLowerCase();
    let bestMatch = { index: 0, score: 0 };

    // Find the position with the highest concentration of query words
    for (let i = 0; i < content.length - snippetLength; i += 50) {
      const snippet = content.substring(i, i + snippetLength).toLowerCase();
      let score = 0;
      
      for (const word of queryWords) {
        score += (snippet.match(new RegExp(word, 'g')) || []).length;
      }
      
      if (score > bestMatch.score) {
        bestMatch = { index: i, score };
      }
    }

    // Extract snippet around the best match
    let start = Math.max(0, bestMatch.index - 50);
    let end = Math.min(content.length, bestMatch.index + snippetLength + 50);
    
    // Try to end at sentence boundaries
    const snippet = content.substring(start, end);
    const sentences = snippet.split(/[.!?]+/);
    
    if (sentences.length > 1) {
      // Remove incomplete first and last sentences
      const completeSentences = sentences.slice(1, -1);
      if (completeSentences.length > 0) {
        return completeSentences.join('. ') + '.';
      }
    }
    
    // Fallback to character-based snippet
    let result = snippet.trim();
    if (start > 0) result = '...' + result;
    if (end < content.length) result = result + '...';
    
    return result;
  }

  // Generate AI response with knowledge base integration
  async generateResponse(message, conversationId, botConfig = null) {
    console.log('🤖 ChatBotService.generateResponse called:', message);
    console.log('🤖 Conversation ID:', conversationId);
    console.log('🤖 Bot config available:', !!botConfig);
    console.log('🤖 Production mode:', localStorage.getItem('PRODUCTION_MODE'));
    
    try {
      // FIXED: Await the OpenAI client initialization with better error handling
      console.log('🔄 Attempting to get OpenAI client...');
      const openaiClient = await this.getOpenAIClient();
      
      if (!openaiClient) {
        console.log('⚡ No OpenAI client available - using enhanced fallback response');
        return this.getFallbackResponse(message, conversationId);
      }
      
      console.log('✅ OpenAI client ready - proceeding with API call...');

      console.log('🚀 OpenAI client ready - generating AI response...');

      // Search knowledge base for relevant information
      console.log('📚 Starting knowledge base search...');
      const knowledgeResults = this.searchKnowledgeBase(conversationId, message);
      console.log('📚 Knowledge search complete. Results found:', knowledgeResults.length);
      
      // Get or create conversation context
      let conversation = this.conversations.get(conversationId) || {
        messages: [],
        systemPrompt: botConfig?.systemPrompt || this.defaultSystemPrompt
      };

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: message
      });

      // Prepare system prompt with knowledge base context
      let enhancedSystemPrompt = conversation.systemPrompt;
      
      if (knowledgeResults.length > 0) {
        console.log('✅ Adding knowledge base context to OpenAI prompt');
        enhancedSystemPrompt += `\n\nRELEVANT INFORMATION:\n`;
        
        for (let i = 0; i < knowledgeResults.length; i++) {
          const result = knowledgeResults[i];
          enhancedSystemPrompt += `\n${result.content}\n`;
          console.log(`📚 Added knowledge from: ${result.source} (score: ${result.score})`);
        }
        
        enhancedSystemPrompt += `\nUse the above information naturally to help answer the user's question. Do not mention sources or where the information came from. Respond as if this is your own knowledge.`;
      } else {
        console.log('⚠️ No knowledge base results found, using OpenAI general knowledge only');
      }

      // Prepare messages for OpenAI (include enhanced system prompt)
      const messages = [
        { role: 'system', content: enhancedSystemPrompt },
        ...conversation.messages.slice(-10) // Keep last 10 messages for context
      ];
      
      // Check if we should handle this with Shopify integration first
      console.log('🛍️ Checking for Shopify-specific inquiries...');
      const shopifyResponse = await this.checkShopifyIntegration(message, conversationId);
      
      if (shopifyResponse && shopifyResponse.hasShopifyResponse) {
        console.log('✅ Shopify provided specific response:', shopifyResponse.type);
        
        // Add Shopify response to conversation
        conversation.messages.push({
          role: 'assistant',
          content: shopifyResponse.response
        });
        
        this.conversations.set(conversationId, conversation);
        
        return {
          response: shopifyResponse.response,
          confidence: shopifyResponse.confidence || 0.95,
          source: 'shopify',
          knowledgeUsed: false,
          shopifyData: shopifyResponse.data,
          shouldEscalate: false
        };
      }
      
      console.log('🤖 Calling OpenAI API with enhanced prompt...');
      console.log('🤖 System prompt length:', enhancedSystemPrompt.length);
      console.log('🤖 Messages to send:', messages.length);

      // FIXED: Call OpenAI API with better error handling
      console.log('📡 Making OpenAI API call...');
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      });
      
      console.log('📡 OpenAI API response received successfully');

      const aiResponse = completion.choices[0].message.content;
      console.log('✅ OpenAI response received:', aiResponse.substring(0, 100) + '...');

      // Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse
      });

      // Update conversation context
      this.conversations.set(conversationId, conversation);

      console.log('✅ OpenAI response generated successfully');
      const responseData = {
        response: aiResponse,
        confidence: knowledgeResults.length > 0 ? 0.95 : 0.8, // Higher confidence with knowledge base
        source: knowledgeResults.length > 0 ? 'openai+kb' : 'openai',
        knowledgeUsed: knowledgeResults.length > 0,
        knowledgeSources: knowledgeResults.map(r => r.source),
        shouldEscalate: this.shouldEscalateToHuman(message, aiResponse)
      };
      
      console.log('📈 Response summary:', {
        source: responseData.source,
        knowledgeUsed: responseData.knowledgeUsed,
        knowledgeSources: responseData.knowledgeSources,
        confidence: responseData.confidence
      });
      
      return responseData;

    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      if (error.message?.includes('API key')) {
        console.error('🔑 OpenAI API Key Error - check your key is valid');
      }
      return this.getFallbackResponse(message, conversationId);
    }
  }

  // Check if message should be handled by Multi-Store Shopify integration
  async checkShopifyIntegration(message, conversationId) {
    try {
      console.log('🏢 Attempting Multi-Store Shopify integration check...');
      
      // Import the Multi-Store Shopify service
      const { multiStoreShopifyService } = await import('./integrations/multiStoreShopifyService.js');
      
      // Set organization context (use default for now, can be dynamic later)
      multiStoreShopifyService.setOrganization('00000000-0000-0000-0000-000000000001');
      
      // Check if any stores are connected
      if (!await multiStoreShopifyService.isConnected()) {
        console.log('⚠️ No Shopify stores connected, skipping integration');
        return { hasShopifyResponse: false };
      }
      
      console.log('✅ Multi-store Shopify connected, processing customer message...');
      
      // Get customer data from conversation context if available
      const conversation = this.conversations.get(conversationId) || {};
      const customerData = conversation.customerData || {};
      
      // Process the message with Multi-Store Shopify service
      const result = await multiStoreShopifyService.processCustomerMessage(message, customerData);
      
      console.log('📈 Multi-store Shopify processing result:', {
        hasResponse: result.hasShopifyResponse,
        type: result.type,
        store: result.store,
        confidence: result.confidence
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in Multi-Store Shopify integration:', error);
      return { hasShopifyResponse: false, error: error.message };
    }
  }

  // Enhanced fallback response that can also search knowledge base
  getFallbackResponse(message, conversationId = null) {
    console.log('🔄 Using fallback response for:', message);
    console.log('🔄 Production mode active:', localStorage.getItem('PRODUCTION_MODE') === 'true');
    
    let knowledgeResults = [];
    
    // Try to search knowledge base even in fallback mode
    if (conversationId) {
      knowledgeResults = this.searchKnowledgeBase(conversationId, message, 1);
    }
    
    if (knowledgeResults.length > 0) {
      // Use knowledge base for fallback response
      const result = knowledgeResults[0];
      let response = "";
      
      // Extract a relevant snippet
      const snippet = result.content.substring(0, 200);
      response += snippet;
      
      if (result.content.length > 200) {
        response += "...";
      }
      
      console.log('✅ Knowledge base fallback used');
      return {
        response,
        confidence: 0.7,
        source: 'knowledge_base',
        knowledgeUsed: true,
        knowledgeSources: [result.source],
        shouldEscalate: false
      };
    }

    // Improved context-aware fallback responses
    const responses = {
      greeting: [
        "Hello! I'm here to help you. What can I assist you with today?",
        "Hi there! How can I help you?",
        "Welcome! What questions do you have for me?"
      ],
      help: [
        "I'd be happy to help you with that. Can you provide more details?",
        "Let me assist you with that. What specific issue are you facing?",
        "I'm here to help! Could you tell me more about what you need?"
      ],
      order: [
        "I can help you with order-related questions. Could you provide your order number or more details?",
        "Let me help you track your order. Can you share your order number?",
        "I'm here to assist with your order. What specific information do you need?"
      ],
      product: [
        "I'd be happy to help you find the right product. What are you looking for?",
        "Let me help you with product information. What would you like to know?",
        "I can assist with product recommendations. What are your needs?"
      ],
      technical: [
        "I can help with technical issues. Can you describe what problem you're experiencing?",
        "Let me assist with that technical question. What specifically isn't working?",
        "I'm here to help troubleshoot. What issue are you having?"
      ],
      billing: [
        "I can help with billing questions. What do you need assistance with?",
        "Let me help with your billing inquiry. Can you provide more details?",
        "I'm here to assist with billing matters. What's your concern?"
      ],
      escalation: [
        "I understand this is important. Let me connect you with a human agent who can better assist you.",
        "For this type of request, I'll transfer you to one of our specialists.",
        "I think a human agent would be better suited to help you with this. Let me get someone for you."
      ],
      default: [
        "Thank you for your message. I'm here to help! Could you tell me more about what you need assistance with?",
        "I appreciate you reaching out. I'd like to help - can you provide more details about your question?",
        "I'm ready to assist you. What specific information or help are you looking for?"
      ]
    };

    // Smart keyword matching for better responses
    const lowerMessage = message.toLowerCase();
    let responseCategory = 'default';

    // Check for greetings
    if (lowerMessage.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
      responseCategory = 'greeting';
    }
    // Check for order-related queries
    else if (lowerMessage.match(/\b(order|track|tracking|shipped|delivery|status)\b/)) {
      responseCategory = 'order';
    }
    // Check for product queries
    else if (lowerMessage.match(/\b(product|item|buy|purchase|recommend|suggest)\b/)) {
      responseCategory = 'product';
    }
    // Check for technical issues
    else if (lowerMessage.match(/\b(broken|not working|error|problem|issue|bug|technical)\b/)) {
      responseCategory = 'technical';
    }
    // Check for billing
    else if (lowerMessage.match(/\b(billing|charge|payment|refund|money|cost|price)\b/)) {
      responseCategory = 'billing';
    }
    // Check for help requests
    else if (lowerMessage.match(/\b(help|support|assist|need)\b/)) {
      responseCategory = 'help';
    }
    // Check for escalation
    else if (lowerMessage.match(/\b(human|agent|person|representative|manager|speak to someone|talk to someone|real person)\b/)) {
      responseCategory = 'escalation';
    }

    const responseOptions = responses[responseCategory];
    const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];

    console.log(`📝 Smart fallback response used (category: ${responseCategory})`);
    return {
      response: randomResponse,
      confidence: responseCategory === 'escalation' ? 0.9 : 0.6,
      source: 'smart_fallback',
      knowledgeUsed: false,
      shouldEscalate: responseCategory === 'escalation',
      category: responseCategory
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
    return escalationKeywords.some(keyword => userLower.includes(keyword));
  }

  // Update bot configuration
  updateBotConfig(conversationId, config) {
    let conversation = this.conversations.get(conversationId) || { messages: [] };
    conversation.systemPrompt = config.systemPrompt || this.defaultSystemPrompt;
    this.conversations.set(conversationId, conversation);
  }

  // FIXED: Diagnostic function to test OpenAI client initialization
  async diagnoseOpenAI() {
    console.log('🔍 DIAGNOSING OPENAI CLIENT INITIALIZATION...');
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: [],
      success: false,
      error: null
    };
    
    try {
      // Step 1: Check API key
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const keyStep = {
        step: 'API Key Check',
        success: !!apiKey && apiKey !== 'demo-mode' && apiKey.startsWith('sk-'),
        details: {
          hasKey: !!apiKey,
          keyLength: apiKey?.length || 0,
          validFormat: apiKey?.startsWith('sk-') || false,
          isDemoMode: apiKey === 'demo-mode'
        }
      };
      results.steps.push(keyStep);
      
      if (!keyStep.success) {
        results.error = 'Invalid or missing API key';
        return results;
      }
      
      // Step 2: Test async import
      const importStep = { step: 'Module Import', success: false, details: {} };
      try {
        const openaiModule = await import('openai');
        importStep.success = true;
        importStep.details = {
          hasDefault: !!openaiModule.default,
          hasNamedExport: !!openaiModule.OpenAI,
          moduleKeys: Object.keys(openaiModule)
        };
      } catch (error) {
        importStep.error = error.message;
      }
      results.steps.push(importStep);
      
      if (!importStep.success) {
        results.error = 'Module import failed';
        return results;
      }
      
      // Step 3: Test client creation
      const clientStep = { step: 'Client Creation', success: false, details: {} };
      try {
        // Clear any existing client to force fresh creation
        this.openaiClient = null;
        const client = await this.getOpenAIClient();
        
        clientStep.success = !!client;
        clientStep.details = {
          clientExists: !!client,
          hasChatMethod: !!client?.chat?.completions?.create,
          isCached: this.openaiClient === client
        };
      } catch (error) {
        clientStep.error = error.message;
      }
      results.steps.push(clientStep);
      
      if (!clientStep.success) {
        results.error = 'Client creation failed';
        return results;
      }
      
      // Step 4: Test simple API call (optional - may fail due to CORS)
      const apiStep = { step: 'API Test', success: false, details: {}, optional: true };
      try {
        const testResponse = await this.generateResponse('Test message', 'diagnostic-test');
        apiStep.success = !!testResponse?.response;
        apiStep.details = {
          gotResponse: !!testResponse,
          source: testResponse?.source || 'unknown'
        };
      } catch (error) {
        apiStep.error = error.message;
        apiStep.details.note = 'API test may fail due to CORS in browser - this is normal';
      }
      results.steps.push(apiStep);
      
      // Overall success if key steps passed
      results.success = results.steps.slice(0, 3).every(step => step.success);
      
    } catch (error) {
      results.error = error.message;
    }
    
    console.log('🔍 DIAGNOSIS COMPLETE:', results);
    return results;
  }
  
  // Set up default knowledge base for testing
  initializeDefaultKnowledge() {
    const defaultKnowledge = [
      {
        id: 'kb_business_hours',
        name: 'Business Hours',
        type: 'faq',
        enabled: true,
        content: 'Our customer support is available Monday through Friday from 9 AM to 6 PM EST. We are closed on weekends and major holidays. For urgent matters outside business hours, please email support@company.com.',
        keywords: ['hours', 'time', 'open', 'closed', 'business', 'when', 'schedule']
      },
      {
        id: 'kb_contact_info',
        name: 'Contact Information',
        type: 'faq',
        enabled: true,
        content: 'You can contact us through this chat, email us at support@company.com, or call us at (555) 123-4567 during business hours. For billing questions, use billing@company.com.',
        keywords: ['contact', 'phone', 'email', 'support', 'help', 'reach']
      },
      {
        id: 'kb_shipping',
        name: 'Shipping Information',
        type: 'faq',
        enabled: true,
        content: 'We offer free standard shipping on orders over $50. Standard shipping takes 3-5 business days. Express shipping is available for $15 and takes 1-2 business days. International shipping is available to most countries.',
        keywords: ['shipping', 'delivery', 'ship', 'send', 'mail', 'fast', 'express', 'international']
      },
      {
        id: 'kb_returns',
        name: 'Return Policy',
        type: 'faq',
        enabled: true,
        content: 'We accept returns within 30 days of purchase. Items must be in original condition with tags attached. To start a return, email us with your order number. We provide prepaid return labels for your convenience.',
        keywords: ['return', 'refund', 'exchange', 'policy', 'money back', 'warranty']
      }
    ];

    // Set knowledge base for demo conversations
    const demoConversations = ['conv_demo_1', 'conv_demo_2', 'conv_demo_3', 'demo-conv-1', 'demo-conv-2', 'demo-conv-3'];
    demoConversations.forEach(convId => {
      this.setKnowledgeBase(convId, defaultKnowledge);
    });

    console.log('📚 Default knowledge base initialized for demo conversations');
  }

  // Clear conversation context
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }

  // Get conversation context
  getConversationContext(conversationId) {
    return this.conversations.get(conversationId) || { messages: [] };
  }
}

// Export singleton instance
export const chatBotService = new ChatBotService();

// FIXED: Add global diagnostic function for easy testing
window.diagnoseOpenAI = () => chatBotService.diagnoseOpenAI();
window.testChatBot = (message = 'Hello, test message') => 
  chatBotService.generateResponse(message, 'browser-test');

// Add Shopify integration test function
window.testShopifyIntegration = async () => {
  console.log('🧪 Testing Dynamic Shopify Integration...');
  
  try {
    // Test service import
    console.log('📦 Testing service import...');
    const { dynamicShopifyService } = await import('./integrations/dynamicShopifyService.js');
    console.log('✅ Dynamic Shopify service imported successfully');
    
    // Test configuration loading
    console.log('🔗 Testing configuration loading...');
    const config = await dynamicShopifyService.loadConfiguration();
    console.log('Configuration loaded:', {
      hasConfig: !!config,
      storeName: config?.storeName,
      hasToken: !!config?.accessToken
    });
    
    // Test connection status
    console.log('🔗 Testing connection status...');
    const isConnected = await dynamicShopifyService.isConnected();
    console.log('Connection Status:', isConnected ? '✅ Connected' : '❌ Not Connected');
    
    if (isConnected) {
      // Test API connection
      console.log('🌐 Testing API connection...');
      const connectionResult = await dynamicShopifyService.testConnection();
      console.log('API Test Result:', connectionResult);
      
      // Test product search
      console.log('🔍 Testing product search...');
      try {
        const searchResult = await dynamicShopifyService.searchProducts('product', 3);
        console.log('Search Results:', searchResult.length, 'products found');
      } catch (error) {
        console.log('❌ Product search failed:', error.message);
      }
      
      // Test store info
      console.log('🏢 Testing store info...');
      try {
        const storeInfo = await dynamicShopifyService.getStoreInfo();
        console.log('Store Info:', {
          name: storeInfo.name,
          domain: storeInfo.domain,
          currency: storeInfo.currency
        });
      } catch (error) {
        console.log('❌ Store info failed:', error.message);
      }
    } else {
      console.log('⚠️ Not connected - skipping API tests');
      console.log('💡 Configure Shopify in the Integrations tab to enable');
    }
    
    // Test customer inquiry handling
    console.log('💬 Testing customer inquiry handling...');
    const inquiryResponse = await dynamicShopifyService.handleCustomerInquiry('I\'m looking for products');
    console.log('Inquiry Response:', inquiryResponse);
    
    // Test chatbot integration
    console.log('🤖 Testing chatbot integration...');
    const chatResponse = await chatBotService.generateResponse('I need help finding products', 'test-shopify');
    console.log('Chatbot Response:', {
      source: chatResponse.source,
      hasResponse: !!chatResponse.response,
      confidence: chatResponse.confidence
    });
    
    console.log('✅ Dynamic Shopify integration test completed!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Shopify integration test failed:', error);
    return { success: false, error: error.message };
  }
};

// Quick Shopify test function
window.quickShopifyTest = async () => {
  console.log('⚡ Quick Dynamic Shopify Test');
  
  try {
    const { dynamicShopifyService } = await import('./integrations/dynamicShopifyService.js');
    
    // Check configuration status
    const status = dynamicShopifyService.getConfigurationStatus();
    console.log('📊 Configuration Status:', status);
    
    // Try to load configuration
    const config = await dynamicShopifyService.loadConfiguration();
    console.log('🔗 Configuration Load Result:', {
      hasConfig: !!config,
      storeName: config?.storeName || '❌ Not configured',
      hasToken: config?.accessToken ? '✅ Configured' : '❌ Missing'
    });
    
    if (config) {
      const testResult = await dynamicShopifyService.testConnection();
      console.log('🌐 Connection Test:', testResult.success ? '✅ Success' : '❌ Failed', testResult.message);
    } else {
      console.log('⚠️ No Shopify configuration found');
      console.log('💡 Go to Integrations tab to set up your Shopify store');
    }
  } catch (error) {
    console.log('❌ Test Failed:', error.message);
  }
};

// Shopify configuration helper
window.configureShopify = (storeName, accessToken) => {
  if (!storeName || !accessToken) {
    console.log('❌ Please provide both store name and access token');
    console.log('Usage: configureShopify("your-store", "shpat_your_token")');
    return;
  }
  
  window.SHOPIFY_CONFIG = {
    storeName,
    accessToken
  };
  
  console.log('✅ Shopify configured in runtime');
  console.log('Run quickShopifyTest() to verify connection');
};

console.log('🧪 Dynamic Shopify test functions loaded:');
console.log('- Run: testShopifyIntegration() for full test');
console.log('- Run: quickShopifyTest() for quick status check');
console.log('- Run: configureShopify("store", "token") for quick setup');

export default chatBotService;
