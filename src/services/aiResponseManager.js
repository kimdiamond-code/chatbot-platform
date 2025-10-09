// ✅ FIXED AI Response Manager - No external dependencies
// Intelligent automated response system with fallback handling

import { botConfigService } from './botConfigService.js';

/**
 * Advanced AI-Powered Automated Response System
 * 
 * This service orchestrates intelligent, contextual, and automated responses
 * using multiple AI techniques including:
 * - Intent classification and conversation flows
 * - Sentiment analysis and emotion detection
 * - Proactive engagement triggers
 * - Multi-turn conversation management
 * - Automated escalation detection
 */
class AIResponseManager {
  constructor() {
    this.activeConversations = new Map();
    this.responseTemplates = new Map();
    this.sentimentCache = new Map();
    this.automationRules = new Map();
    this.conversationFlows = new Map();
    this.engagementTriggers = [];
    
    // Response confidence thresholds
    this.thresholds = {
      highConfidence: 0.85,
      mediumConfidence: 0.65,
      lowConfidence: 0.45,
      escalationThreshold: 0.3
    };
    
    this.initializeDefaultFlows();
  }

  /**
   * Main method to generate intelligent automated responses
   */
  async generateAutomatedResponse(message, conversationId, context = {}) {
    console.log('🤖 AI Response Manager processing message:', { message, conversationId });
    
    try {
      // Step 1: Analyze message context and intent
      const analysis = await this.analyzeMessage(message, conversationId, context);
      console.log('📊 Message analysis:', analysis);
      
      // Step 2: Check for automated flow triggers
      const flowResponse = await this.checkAutomatedFlows(message, conversationId, analysis);
      if (flowResponse) {
        console.log('🔄 Flow-based response generated');
        return flowResponse;
      }
      
      // Step 3: Check for proactive engagement triggers
      const proactiveResponse = await this.checkProactiveEngagement(conversationId, analysis);
      if (proactiveResponse) {
        console.log('⚡ Proactive engagement triggered');
        return proactiveResponse;
      }
      
      // Step 4: Generate contextual AI response
      const aiResponse = await this.generateContextualResponse(message, conversationId, analysis, context);
      
      // Step 5: Apply response enhancement and personalization
      const enhancedResponse = await this.enhanceResponse(aiResponse, analysis, context);
      
      // Step 6: Update conversation state and learning
      await this.updateConversationState(conversationId, message, enhancedResponse, analysis);
      
      console.log('✅ AI automated response generated successfully');
      return enhancedResponse;
      
    } catch (error) {
      console.error('❌ AI Response Manager error:', error);
      return await this.getFallbackResponse(message, conversationId);
    }
  }

  /**
   * Analyze message for intent, sentiment, and context
   */
  async analyzeMessage(message, conversationId, context = {}) {
    const analysis = {
      intent: await this.classifyIntent(message),
      sentiment: await this.analyzeSentiment(message),
      entities: this.extractEntities(message),
      urgency: this.detectUrgency(message),
      conversationStage: this.getConversationStage(conversationId),
      topics: this.extractTopics(message),
      language: this.detectLanguage(message),
      complexity: this.assessComplexity(message)
    };
    
    // Check conversation history for context
    const conversation = this.activeConversations.get(conversationId);
    if (conversation) {
      analysis.previousIntent = conversation.lastIntent;
      analysis.conversationLength = conversation.messageCount;
      analysis.userSatisfaction = conversation.satisfaction;
      analysis.escalationAttempts = conversation.escalationAttempts || 0;
    }
    
    return analysis;
  }

  /**
   * Intent classification using keyword analysis and patterns
   */
  async classifyIntent(message) {
    const intents = {
      greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'greetings'],
        patterns: [/^(hi|hello|hey)\\b/i, /good (morning|afternoon|evening)/i],
        confidence: 0.9
      },
      question: {
        keywords: ['what', 'how', 'when', 'where', 'why', 'which', 'can you', 'do you'],
        patterns: [/^(what|how|when|where|why|which)\\b/i, /(\\?|help me)/],
        confidence: 0.8
      },
      complaint: {
        keywords: ['problem', 'issue', 'wrong', 'broken', 'not working', 'disappointed', 'angry'],
        patterns: [/(not working|doesn't work|broken)/i, /(angry|frustrated|disappointed)/i],
        confidence: 0.85
      },
      request: {
        keywords: ['please', 'can you', 'could you', 'would you', 'i need', 'i want'],
        patterns: [/^(please|can you|could you|would you)/i, /(i need|i want|i would like)/i],
        confidence: 0.8
      },
      escalation: {
        keywords: ['human', 'agent', 'person', 'manager', 'supervisor', 'speak to someone'],
        patterns: [/(speak to|talk to).*(human|person|agent)/i, /(human|real person)/i],
        confidence: 0.95
      },
      support: {
        keywords: ['help', 'support', 'assist', 'guidance', 'advice'],
        patterns: [/(help me|need help|can you help)/i, /(support|assistance)/i],
        confidence: 0.8
      },
      order_inquiry: {
        keywords: ['order', 'purchase', 'delivery', 'shipping', 'track', 'status'],
        patterns: [/(order|purchase)\\s+(status|tracking|number)/i, /(where is my|track my)/i],
        confidence: 0.9
      },
      technical_issue: {
        keywords: ['login', 'password', 'error', 'bug', 'technical', 'website', 'app'],
        patterns: [/(can't login|password|technical issue)/i, /(error|bug|not loading)/i],
        confidence: 0.85
      }
    };
    
    const messageLower = message.toLowerCase();
    let bestMatch = { intent: 'general', confidence: 0.3 };
    
    for (const [intentName, intentData] of Object.entries(intents)) {
      let score = 0;
      
      // Keyword matching
      for (const keyword of intentData.keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          score += 0.1;
        }
      }
      
      // Pattern matching (higher weight)
      for (const pattern of intentData.patterns) {
        if (pattern.test(message)) {
          score += 0.3;
        }
      }
      
      const finalScore = Math.min(score, intentData.confidence);
      
      if (finalScore > bestMatch.confidence) {
        bestMatch = { intent: intentName, confidence: finalScore };
      }
    }
    
    return bestMatch;
  }

  /**
   * Sentiment analysis
   */
  async analyzeSentiment(message) {
    const cacheKey = message.toLowerCase().trim();
    if (this.sentimentCache.has(cacheKey)) {
      return this.sentimentCache.get(cacheKey);
    }
    
    // Simple rule-based sentiment analysis
    const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'love', 'like', 'happy', 'satisfied', 'thank', 'thanks', 'appreciate'];
    const negative = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed', 'upset', 'problem', 'issue', 'wrong', 'broken', 'not working'];
    const neutral = ['okay', 'fine', 'alright', 'normal', 'average'];
    
    const messageLower = message.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;
    
    positive.forEach(word => {
      if (messageLower.includes(word)) positiveScore++;
    });
    
    negative.forEach(word => {
      if (messageLower.includes(word)) negativeScore++;
    });
    
    neutral.forEach(word => {
      if (messageLower.includes(word)) neutralScore++;
    });
    
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      sentiment = 'positive';
      confidence = Math.min(0.9, 0.6 + (positiveScore * 0.1));
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.6 + (negativeScore * 0.1));
    }
    
    const result = { sentiment, confidence, scores: { positive: positiveScore, negative: negativeScore, neutral: neutralScore } };
    this.sentimentCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Extract entities (names, emails, order numbers, etc.)
   */
  extractEntities(message) {
    const entities = {};
    
    // Email extraction
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g);
    if (emailMatch) entities.emails = emailMatch;
    
    // Phone number extraction
    const phoneMatch = message.match(/(\\+?\\d{1,4}[\\s-]?)?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}/g);
    if (phoneMatch) entities.phones = phoneMatch;
    
    // Order number extraction
    const orderMatch = message.match(/(order|purchase|transaction)\\s*(#|number|id)?\\s*:?\\s*([A-Z0-9-]{6,})/gi);
    if (orderMatch) entities.orderNumbers = orderMatch.map(m => m.split(/\\s+/).pop());
    
    // URL extraction
    const urlMatch = message.match(/(https?:\\/\\/[^\\s]+)/g);
    if (urlMatch) entities.urls = urlMatch;
    
    // Monetary amounts
    const moneyMatch = message.match(/\\$\\d+(?:\\.\\d{2})?/g);
    if (moneyMatch) entities.amounts = moneyMatch;
    
    // Product names (common patterns)
    const productMatch = message.match(/\\b(product|item|model)\\s*([A-Z0-9-]+)/gi);
    if (productMatch) entities.products = productMatch;
    
    return entities;
  }

  /**
   * Detect message urgency
   */
  detectUrgency(message) {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'now', 'fast', 'quick', 'right away'];
    const messageLower = message.toLowerCase();
    
    const urgentCount = urgentKeywords.filter(keyword => messageLower.includes(keyword)).length;
    
    // Check for multiple exclamation marks or caps
    const hasExclamations = (message.match(/!/g) || []).length > 1;
    const hasCaps = message === message.toUpperCase() && message.length > 10;
    
    let urgencyLevel = 'low';
    if (urgentCount > 0 || hasExclamations || hasCaps) {
      urgencyLevel = 'medium';
    }
    if (urgentCount > 1 || (urgentCount > 0 && (hasExclamations || hasCaps))) {
      urgencyLevel = 'high';
    }
    
    return {
      level: urgencyLevel,
      indicators: {
        urgentWords: urgentCount,
        exclamations: hasExclamations,
        allCaps: hasCaps
      }
    };
  }

  /**
   * Get conversation stage
   */
  getConversationStage(conversationId) {
    const conversation = this.activeConversations.get(conversationId);
    if (!conversation) return 'initial';
    
    const messageCount = conversation.messageCount || 0;
    const hasResolution = conversation.hasResolution || false;
    
    if (messageCount === 0) return 'initial';
    if (messageCount <= 2) return 'greeting';
    if (messageCount <= 5) return 'information_gathering';
    if (hasResolution) return 'resolution';
    if (messageCount > 10) return 'extended';
    return 'problem_solving';
  }

  /**
   * Extract topics from message
   */
  extractTopics(message) {
    const topicKeywords = {
      billing: ['bill', 'payment', 'charge', 'invoice', 'cost', 'price', 'refund'],
      shipping: ['delivery', 'shipping', 'ship', 'arrived', 'package', 'tracking'],
      technical: ['login', 'password', 'error', 'bug', 'website', 'app', 'technical'],
      account: ['account', 'profile', 'settings', 'personal', 'information'],
      product: ['product', 'item', 'quality', 'defective', 'broken', 'feature'],
      service: ['service', 'support', 'help', 'assistance', 'customer service']
    };
    
    const messageLower = message.toLowerCase();
    const detectedTopics = [];
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(keyword => messageLower.includes(keyword));
      if (matches.length > 0) {
        detectedTopics.push({ topic, matches, confidence: matches.length / keywords.length });
      }
    }
    
    return detectedTopics.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Detect language (basic implementation)
   */
  detectLanguage(message) {
    // Simple language detection based on common words
    const languagePatterns = {
      english: ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they'],
      spanish: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
      french: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir']
    };
    
    const messageLower = message.toLowerCase();
    let bestMatch = { language: 'english', confidence: 0.5 };
    
    for (const [lang, words] of Object.entries(languagePatterns)) {
      const matches = words.filter(word => messageLower.includes(word)).length;
      const confidence = matches / words.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { language: lang, confidence };
      }
    }
    
    return bestMatch;
  }

  /**
   * Assess message complexity
   */
  assessComplexity(message) {
    const wordCount = message.split(/\\s+/).length;
    const sentenceCount = message.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    // Complex words (more than 6 letters)
    const complexWords = message.split(/\\s+/).filter(word => word.length > 6).length;
    const complexityRatio = complexWords / wordCount;
    
    let complexity = 'simple';
    if (wordCount > 30 || avgWordsPerSentence > 15 || complexityRatio > 0.3) {
      complexity = 'medium';
    }
    if (wordCount > 60 || avgWordsPerSentence > 25 || complexityRatio > 0.5) {
      complexity = 'complex';
    }
    
    return {
      level: complexity,
      metrics: {
        wordCount,
        sentenceCount,
        avgWordsPerSentence,
        complexityRatio
      }
    };
  }

  /**
   * Check for automated conversation flows
   */
  async checkAutomatedFlows(message, conversationId, analysis) {
    const flows = this.conversationFlows.get('default') || [];
    
    for (const flow of flows) {
      if (this.matchesFlowTrigger(message, analysis, flow.triggers)) {
        return await this.executeFlow(flow, conversationId, analysis);
      }
    }
    
    return null;
  }

  /**
   * Check flow trigger conditions
   */
  matchesFlowTrigger(message, analysis, triggers) {
    if (!triggers) return false;
    
    for (const trigger of triggers) {
      let matches = true;
      
      if (trigger.intent && analysis.intent.intent !== trigger.intent) {
        matches = false;
      }
      
      if (trigger.sentiment && analysis.sentiment.sentiment !== trigger.sentiment) {
        matches = false;
      }
      
      if (trigger.keywords) {
        const hasKeyword = trigger.keywords.some(keyword => 
          message.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasKeyword) matches = false;
      }
      
      if (trigger.urgency && analysis.urgency.level !== trigger.urgency) {
        matches = false;
      }
      
      if (matches) return true;
    }
    
    return false;
  }

  /**
   * Execute automated flow
   */
  async executeFlow(flow, conversationId, analysis) {
    console.log('🔄 Executing automated flow:', flow.name);
    
    const response = {
      response: flow.response,
      confidence: 0.9,
      source: 'automated_flow',
      flowName: flow.name,
      actions: flow.actions || [],
      shouldEscalate: flow.escalate || false,
      followUpActions: flow.followUp || []
    };
    
    // Execute any immediate actions
    if (flow.actions) {
      for (const action of flow.actions) {
        await this.executeAction(action, conversationId, analysis);
      }
    }
    
    return response;
  }

  /**
   * Execute flow actions
   */
  async executeAction(action, conversationId, analysis) {
    console.log('⚡ Executing action:', action.type);
    
    switch (action.type) {
      case 'tag_conversation':
        // Add tags to conversation
        break;
      case 'set_priority':
        // Set conversation priority
        break;
      case 'notify_agent':
        // Send notification to human agent
        break;
      case 'create_ticket':
        // Create support ticket
        break;
      case 'send_email':
        // Send automated email
        break;
      case 'schedule_followup':
        // Schedule follow-up message
        break;
    }
  }

  /**
   * Check for proactive engagement opportunities
   */
  async checkProactiveEngagement(conversationId, analysis) {
    const conversation = this.activeConversations.get(conversationId);
    if (!conversation) return null;
    
    // Check for abandonment (user hasn't responded)
    const timeSinceLastMessage = Date.now() - (conversation.lastActivity || Date.now());
    const abandonmentThreshold = 5 * 60 * 1000; // 5 minutes
    
    if (timeSinceLastMessage > abandonmentThreshold && !conversation.proactiveEngaged) {
      conversation.proactiveEngaged = true;
      return {
        response: "I noticed you might need additional help. Is there anything specific I can assist you with?",
        confidence: 0.8,
        source: 'proactive_engagement',
        type: 'abandonment_recovery'
      };
    }
    
    return null;
  }

  /**
   * Generate contextual AI response - simplified without external dependencies
   */
  async generateContextualResponse(message, conversationId, analysis, context) {
    console.log('🤖 Generating contextual response for:', analysis.intent.intent);
    
    // Generate intelligent response based on intent and context
    let response = '';
    let confidence = 0.7;
    
    switch (analysis.intent.intent) {
      case 'greeting':
        response = context.customerName 
          ? `Hello ${context.customerName}! How can I assist you today?`
          : "Hello! I'm here to help you. What can I assist you with today?";
        confidence = 0.9;
        break;
        
      case 'question':
        if (analysis.topics.length > 0) {
          const primaryTopic = analysis.topics[0].topic;
          response = `I'd be happy to help answer your question about ${primaryTopic}. Could you provide more details so I can give you the most accurate information?`;
        } else {
          response = "I'd be glad to help answer your question. Could you provide a bit more detail about what you're looking for?";
        }
        confidence = 0.75;
        break;
        
      case 'complaint':
        response = "I understand your concern and I want to help resolve this issue for you. Can you tell me more about what happened so I can assist you better?";
        if (analysis.sentiment.sentiment === 'negative') {
          response = "I'm sorry to hear about this issue. " + response;
        }
        confidence = 0.8;
        break;
        
      case 'escalation':
        response = "I understand you'd like to speak with a human representative. I'll make sure to connect you with someone who can provide the assistance you need.";
        confidence = 0.95;
        break;
        
      case 'order_inquiry':
        if (analysis.entities.orderNumbers && analysis.entities.orderNumbers.length > 0) {
          response = `I can help you with your order inquiry. I see you've mentioned order ${analysis.entities.orderNumbers[0]}. Let me check the status for you.`;
        } else {
          response = "I can help you with your order inquiry. Could you please provide your order number so I can look up the details for you?";
        }
        confidence = 0.85;
        break;
        
      case 'technical_issue':
        response = "I understand you're experiencing a technical issue. Let me help you troubleshoot this. Can you describe what specific problem you're encountering?";
        confidence = 0.8;
        break;
        
      case 'support':
        response = "I'm here to help! What specific assistance do you need today? I can help with orders, account questions, technical issues, and more.";
        confidence = 0.85;
        break;
        
      default:
        response = "Thank you for contacting us. I'm here to help with any questions or concerns you may have. How can I assist you today?";
        confidence = 0.6;
    }
    
    return {
      response,
      confidence,
      source: 'contextual_ai',
      intent: analysis.intent.intent,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enhance response with personalization and context
   */
  async enhanceResponse(response, analysis, context) {
    let enhancedResponse = { ...response };
    
    // Adjust response based on sentiment
    if (analysis.sentiment.sentiment === 'negative' && analysis.sentiment.confidence > 0.7) {
      enhancedResponse.response = this.addEmpathy(enhancedResponse.response);
      enhancedResponse.tone = 'empathetic';
    }
    
    // Add urgency handling
    if (analysis.urgency.level === 'high') {
      enhancedResponse.response = this.addUrgencyAcknowledgment(enhancedResponse.response);
      enhancedResponse.priority = 'high';
    }
    
    // Add personalization if customer info available
    if (context.customerName && !enhancedResponse.response.includes(context.customerName)) {
      enhancedResponse.response = enhancedResponse.response.replace(
        /^(Hi|Hello)/i, 
        `$1 ${context.customerName}`
      );
    }
    
    // Add follow-up suggestions based on intent
    enhancedResponse.suggestions = this.generateFollowUpSuggestions(analysis);
    
    return enhancedResponse;
  }

  /**
   * Add empathy to responses for negative sentiment
   */
  addEmpathy(response) {
    const empathyPhrases = [
      "I understand how frustrating this must be. ",
      "I'm sorry to hear you're experiencing this issue. ",
      "I can see why this would be concerning. ",
      "I apologize for the inconvenience. "
    ];
    
    const randomPhrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    return randomPhrase + response;
  }

  /**
   * Add urgency acknowledgment
   */
  addUrgencyAcknowledgment(response) {
    return "I understand this is urgent. " + response + " Let me prioritize this for you.";
  }

  /**
   * Generate follow-up suggestions based on analysis
   */
  generateFollowUpSuggestions(analysis) {
    const suggestions = [];
    
    switch (analysis.intent.intent) {
      case 'order_inquiry':
        suggestions.push(
          "Check order status",
          "Track delivery",
          "Contact shipping"
        );
        break;
      case 'technical_issue':
        suggestions.push(
          "Try basic troubleshooting",
          "Contact technical support",
          "Access user guide"
        );
        break;
      case 'complaint':
        suggestions.push(
          "Speak with supervisor",
          "File formal complaint",
          "Request compensation"
        );
        break;
      default:
        suggestions.push(
          "Get more information",
          "Speak with human agent",
          "Browse help center"
        );
    }
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Update conversation state for learning and tracking
   */
  async updateConversationState(conversationId, message, response, analysis) {
    let conversation = this.activeConversations.get(conversationId) || {
      messageCount: 0,
      startTime: Date.now(),
      intents: [],
      topics: [],
      satisfaction: null,
      escalationAttempts: 0
    };
    
    // Update conversation data
    conversation.messageCount++;
    conversation.lastActivity = Date.now();
    conversation.lastIntent = analysis.intent.intent;
    conversation.intents.push(analysis.intent.intent);
    conversation.topics = [...new Set([...conversation.topics, ...analysis.topics.map(t => t.topic)])];
    
    // Track escalation attempts
    if (analysis.intent.intent === 'escalation') {
      conversation.escalationAttempts++;
    }
    
    // Update AI response confidence tracking
    conversation.aiResponses = conversation.aiResponses || [];
    conversation.aiResponses.push({
      confidence: response.confidence,
      source: response.source,
      timestamp: Date.now()
    });
    
    this.activeConversations.set(conversationId, conversation);
    
    // Update learning data for improving future responses
    this.updateLearningData(analysis, response);
  }

  /**
   * Update learning data to improve AI responses over time
   */
  updateLearningData(analysis, response) {
    // This would typically update a machine learning model or feedback system
    // For now, we'll just track patterns
    const pattern = {
      intent: analysis.intent.intent,
      sentiment: analysis.sentiment.sentiment,
      topics: analysis.topics.map(t => t.topic),
      responseSource: response.source,
      confidence: response.confidence,
      timestamp: Date.now()
    };
    
    // Store learning patterns (in production, this would go to a database)
    console.log('📈 Learning pattern recorded:', pattern);
  }

  /**
   * Get bot configuration for a conversation
   */
  async getBotConfiguration(conversationId) {
    try {
      const result = await botConfigService.loadBotConfig();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error loading bot config:', error);
      return null;
    }
  }

  /**
   * Enhanced fallback response
   */
  async getFallbackResponse(message, conversationId) {
    const analysis = await this.analyzeMessage(message, conversationId);
    
    let fallbackResponse = "I apologize, but I'm having trouble understanding your request right now. ";
    
    // Customize based on detected intent
    switch (analysis.intent.intent) {
      case 'escalation':
        fallbackResponse = "I'll connect you with a human agent who can better assist you.";
        break;
      case 'complaint':
        fallbackResponse = "I understand your concern. Let me get a specialist to help resolve this issue for you.";
        break;
      case 'technical_issue':
        fallbackResponse = "For technical issues, I recommend contacting our technical support team or checking our troubleshooting guide.";
        break;
      default:
        fallbackResponse += "Could you please rephrase your question, or would you like to speak with a human agent?";
    }
    
    return {
      response: fallbackResponse,
      confidence: 0.5,
      source: 'intelligent_fallback',
      shouldEscalate: analysis.intent.intent === 'escalation' || analysis.sentiment.sentiment === 'negative',
      suggestions: this.generateFollowUpSuggestions(analysis)
    };
  }

  /**
   * Initialize default conversation flows
   */
  initializeDefaultFlows() {
    const defaultFlows = [
      {
        name: 'greeting_flow',
        triggers: [{ intent: 'greeting' }],
        response: "Hello! I'm here to help you today. What can I assist you with?",
        actions: [{ type: 'tag_conversation', value: 'greeting' }]
      },
      {
        name: 'escalation_flow',
        triggers: [{ intent: 'escalation' }],
        response: "I understand you'd like to speak with a human agent. Let me connect you right away.",
        escalate: true,
        actions: [{ type: 'notify_agent', urgency: 'high' }]
      },
      {
        name: 'complaint_flow',
        triggers: [{ intent: 'complaint', sentiment: 'negative' }],
        response: "I'm sorry to hear about this issue. Let me help resolve this for you or connect you with someone who can.",
        actions: [
          { type: 'tag_conversation', value: 'complaint' },
          { type: 'set_priority', value: 'high' }
        ]
      },
      {
        name: 'order_inquiry_flow',
        triggers: [{ intent: 'order_inquiry' }],
        response: "I can help you with your order inquiry. Could you please provide your order number?",
        actions: [{ type: 'tag_conversation', value: 'order_inquiry' }]
      }
    ];
    
    this.conversationFlows.set('default', defaultFlows);
  }

  /**
   * Add custom conversation flow
   */
  addConversationFlow(orgId, flow) {
    let flows = this.conversationFlows.get(orgId) || [];
    flows.push(flow);
    this.conversationFlows.set(orgId, flows);
  }

  /**
   * Get conversation analytics
   */
  getConversationAnalytics(conversationId) {
    return this.activeConversations.get(conversationId) || null;
  }

  /**
   * Clear conversation data
   */
  clearConversation(conversationId) {
    this.activeConversations.delete(conversationId);
  }
}

// Export singleton instance
export const aiResponseManager = new AIResponseManager();
export default aiResponseManager;
