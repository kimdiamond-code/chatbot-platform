// ✅ FIXED: Secure Server-Side API Routes with Proper OpenAI Integration
// This file handles all API requests securely on the server-side

import { serverOpenAIService } from './serverOpenaiService.js';

// Simple bot configuration - this would normally come from database
const getSecureBotConfig = () => {
  return {
    botId: 'secure-bot',
    name: 'ChatBot Assistant',
    greeting: 'Hello! How can I help you today?',
    systemPrompt: `You are a helpful customer service assistant for our company. You are professional, friendly, and concise. 

Your primary goals:
1. Help customers with their questions using the information available to you
2. Be honest when you don't have specific information
3. Suggest speaking with a human agent when appropriate
4. Maintain a helpful and professional tone

If you don't have specific information about a topic, be honest about it and offer to connect the customer with a human agent who can provide accurate details.`,
    qaDatabase: [
      {
        id: 'qa1',
        question: 'What are your business hours?',
        answer: 'We are open Monday through Friday from 9:00 AM to 6:00 PM EST. Our customer support team is available during these hours to assist you with any questions or concerns.',
        keywords: ['hours', 'open', 'business', 'time', 'when', 'schedule'],
        enabled: true,
        category: 'general'
      },
      {
        id: 'qa2',
        question: 'How can I contact support?',
        answer: 'You can contact our support team through this chat, email us at support@example.com, or call us at (555) 123-4567 during business hours. We aim to respond to all inquiries within 24 hours.',
        keywords: ['contact', 'support', 'help', 'phone', 'email', 'reach', 'call'],
        enabled: true,
        category: 'support'
      },
      {
        id: 'qa3',
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all products. Items must be returned in their original condition with all packaging and accessories included. To initiate a return, please contact our customer service team with your order number.',
        keywords: ['return', 'refund', 'policy', 'exchange', 'money back', 'send back'],
        enabled: true,
        category: 'policies'
      },
      {
        id: 'qa4',
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship internationally to most countries. International shipping typically takes 7-14 business days, and additional duties or taxes may apply depending on your location. Please contact us for specific country availability and shipping costs.',
        keywords: ['international', 'shipping', 'global', 'overseas', 'abroad', 'worldwide'],
        enabled: true,
        category: 'shipping'
      },
      {
        id: 'qa5',
        question: 'How do I track my order?',
        answer: 'Once your order ships, you will receive a tracking number via email. You can use this number to track your package on our website or the carrier\'s website. If you need help finding your tracking information, please contact our support team.',
        keywords: ['track', 'tracking', 'order', 'package', 'delivery', 'shipment'],
        enabled: true,
        category: 'orders'
      }
    ],
    knowledgeBase: [],
    escalationKeywords: ['human', 'agent', 'manager', 'speak to someone', 'person', 'representative'],
    settings: {
      operatingHours: { enabled: false }
    }
  };
};

// Enhanced Q&A matching with better accuracy
function findQAMatch(message, qaDatabase) {
  const messageLower = message.toLowerCase().trim();
  
  console.log('🔍 Searching Q&A database for:', message);
  console.log('📊 Available Q&A entries:', qaDatabase.length);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const qa of qaDatabase) {
    if (!qa.enabled) continue;
    
    let score = 0;
    let matchedKeywords = [];
    
    // Check keyword matches
    for (const keyword of qa.keywords || []) {
      if (messageLower.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }
    
    // Check question similarity
    const questionLower = qa.question.toLowerCase();
    const questionWords = questionLower.split(' ').filter(word => word.length > 3);
    for (const word of questionWords) {
      if (messageLower.includes(word)) {
        score += 0.5;
      }
    }
    
    // Bonus for multiple keyword matches
    if (matchedKeywords.length > 1) {
      score += matchedKeywords.length * 0.5;
    }
    
    console.log(`🔍 Q&A "${qa.question}" - Score: ${score}, Keywords: [${matchedKeywords.join(', ')}]`);
    
    if (score > bestScore && score >= 1) { // Require at least 1 point to match
      bestScore = score;
      bestMatch = {
        answer: qa.answer,
        confidence: Math.min(0.9, 0.6 + (score * 0.1)),
        source: 'qa_database',
        category: qa.category,
        matchedKeywords,
        score
      };
    }
  }
  
  if (bestMatch) {
    console.log(`✅ Q&A match found: ${bestMatch.category} (confidence: ${bestMatch.confidence})`);
  } else {
    console.log('❌ No Q&A matches found');
  }
  
  return bestMatch;
}

// Enhanced fallback responses
function getEnhancedFallback(message) {
  const messageLower = message.toLowerCase().trim();
  
  console.log('🤔 Generating enhanced fallback for:', message);
  
  // Greeting detection
  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  if (greetings.some(greeting => messageLower.includes(greeting))) {
    console.log('👋 Greeting detected');
    return {
      response: "Hello! I'm here to help you with any questions about our products or services. What can I assist you with today?",
      confidence: 0.9,
      source: 'greeting_detection',
      shouldEscalate: false
    };
  }
  
  // Escalation request detection
  const escalationKeywords = ['human', 'agent', 'person', 'representative', 'manager', 'speak to someone', 'talk to someone'];
  if (escalationKeywords.some(keyword => messageLower.includes(keyword))) {
    console.log('🚨 Escalation request detected');
    return {
      response: "I understand you'd like to speak with a human agent. Let me connect you with one of our customer service representatives who can provide you with more personalized assistance.",
      confidence: 0.95,
      source: 'escalation_detection',
      shouldEscalate: true
    };
  }
  
  // Help/support detection
  const helpKeywords = ['help', 'support', 'assist', 'problem', 'issue'];
  if (helpKeywords.some(keyword => messageLower.includes(keyword))) {
    console.log('❓ Help request detected');
    return {
      response: "I'd be happy to help you! I can assist with questions about our products, services, policies, and more. What specific information are you looking for? If I can't help with your particular question, I can connect you with a human agent.",
      confidence: 0.8,
      source: 'help_detection',
      shouldEscalate: false
    };
  }
  
  // Question detection (specific inquiries)
  const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which'];
  const hasQuestionWord = questionWords.some(word => messageLower.includes(word));
  const hasQuestionMark = message.includes('?');
  
  if (hasQuestionWord || hasQuestionMark) {
    console.log('❓ Specific question detected');
    return {
      response: "I don't have specific information about that topic in my current knowledge base. For accurate and detailed information, I'd recommend speaking with one of our human agents who can provide you with the most up-to-date details and personalized assistance.",
      confidence: 0.85,
      source: 'honest_no_match',
      shouldEscalate: true
    };
  }
  
  // Default fallback for unclear messages
  console.log('🤷 Unclear message - requesting clarification');
  return {
    response: "I'm not sure I understand what you're looking for. Could you provide more details about what you need help with? Alternatively, I can connect you with a human agent who might be better able to assist you with your specific needs.",
    confidence: 0.7,
    source: 'clarification_needed',
    shouldEscalate: false
  };
}

// Main API routes with secure OpenAI integration
const secureApiRoutes = {
  // Health check
  'GET /health': async (req, res) => {
    try {
      const openaiStatus = await serverOpenAIService.testConnection();
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          status: 'ok',
          message: 'Secure API routes working',
          openai: {
            available: openaiStatus.success,
            message: openaiStatus.message
          },
          timestamp: new Date().toISOString(),
          environment: 'server-side'
        }
      };
    } catch (error) {
      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          status: 'error',
          error: error.message
        }
      };
    }
  },

  // Test OpenAI connection
  'GET /test-openai': async (req, res) => {
    try {
      const result = await serverOpenAIService.testConnection();
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          ...result,
          secure: true,
          clientSide: false,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: false,
          error: error.message,
          secure: true,
          clientSide: false
        }
      };
    }
  },

  // Get bot configuration
  'GET /bot-config': async (req, res) => {
    try {
      const config = getSecureBotConfig();
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          data: {
            ...config,
            // Remove sensitive information from public config
            qaDatabase: config.qaDatabase.map(qa => ({
              id: qa.id,
              category: qa.category,
              enabled: qa.enabled
              // Don't expose actual Q&A content to client
            }))
          }
        }
      };
    } catch (error) {
      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: false,
          error: 'Failed to load bot configuration'
        }
      };
    }
  },

  // Main chat endpoint with secure OpenAI integration
  'POST /chat': async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      
      if (!message || !conversationId) {
        return {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: {
            success: false,
            error: 'Message and conversationId are required'
          }
        };
      }

      console.log('🤖 Processing secure chat message:', message);
      console.log('🤖 Conversation ID:', conversationId);
      
      const botConfig = getSecureBotConfig();
      
      // Step 1: Try OpenAI first (server-side, secure)
      try {
        console.log('🚀 Attempting OpenAI response...');
        const openaiResult = await serverOpenAIService.generateResponse(
          message, 
          conversationId, 
          botConfig
        );
        
        if (openaiResult && openaiResult.response) {
          console.log('✅ OpenAI response successful');
          return {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: {
              success: true,
              data: {
                message: openaiResult.response,
                confidence: openaiResult.confidence,
                source: openaiResult.source,
                shouldEscalate: openaiResult.shouldEscalate,
                knowledgeUsed: openaiResult.knowledgeUsed,
                knowledgeSources: openaiResult.knowledgeSources || [],
                secure: true,
                timestamp: new Date().toISOString()
              }
            }
          };
        }
      } catch (openaiError) {
        console.log('🔄 OpenAI failed, trying Q&A fallback:', openaiError.message);
      }
      
      // Step 2: Fallback to Q&A matching
      console.log('📚 Trying Q&A database match...');
      const qaMatch = findQAMatch(message, botConfig.qaDatabase);
      if (qaMatch) {
        console.log('✅ Q&A match found');
        return {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: {
              message: qaMatch.answer,
              confidence: qaMatch.confidence,
              source: qaMatch.source,
              shouldEscalate: false,
              knowledgeUsed: false,
              knowledgeSources: [],
              category: qaMatch.category,
              matchedKeywords: qaMatch.matchedKeywords,
              secure: true,
              timestamp: new Date().toISOString()
            }
          }
        };
      }
      
      // Step 3: Enhanced fallback
      console.log('🤔 Using enhanced fallback...');
      const fallback = getEnhancedFallback(message);
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          data: {
            message: fallback.response,
            confidence: fallback.confidence,
            source: fallback.source,
            shouldEscalate: fallback.shouldEscalate,
            knowledgeUsed: false,
            knowledgeSources: [],
            secure: true,
            timestamp: new Date().toISOString()
          }
        }
      };

    } catch (error) {
      console.error('❌ Secure chat API error:', error);
      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: false,
          error: 'Failed to process chat message',
          fallback: "I'm having trouble processing your request right now. Please try again in a moment or contact our support team for immediate assistance."
        }
      };
    }
  },

  // Start conversation
  'POST /chat/start': async (req, res) => {
    try {
      const { conversationId, organizationId } = req.body;
      const botConfig = getSecureBotConfig();
      
      // Initialize conversation with server-side OpenAI service
      await serverOpenAIService.updateBotConfig(conversationId, {
        systemPrompt: botConfig.systemPrompt
      });
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          data: {
            conversationId: conversationId || `conv-${Date.now()}`,
            greeting: botConfig.greeting,
            botName: botConfig.name,
            isOffline: false,
            secure: true,
            timestamp: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      console.error('❌ Chat start error:', error);
      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: false,
          error: 'Failed to start conversation'
        }
      };
    }
  },

  // Debug endpoint
  'GET /debug/config': async (req, res) => {
    try {
      const config = getSecureBotConfig();
      const openaiStatus = await serverOpenAIService.testConnection();
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          botConfig: {
            name: config.name,
            qaEntries: config.qaDatabase.length,
            knowledgeBase: config.knowledgeBase.length,
            escalationKeywords: config.escalationKeywords.length
          },
          openai: openaiStatus,
          secure: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: false,
          error: error.message
        }
      };
    }
  },

  // Options handler for CORS
  'OPTIONS': async (req, res) => {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: ''
    };
  }
};

// Secure request handler
export const handleSecureApiRequest = async (method, url, body = null, query = {}) => {
  const route = `${method.toUpperCase()} ${url}`;
  console.log('🔒 Secure API handling:', route);
  
  if (secureApiRoutes[route]) {
    const req = { body, query, method };
    const res = { headers: {} };
    return await secureApiRoutes[route](req, res);
  }
  
  // Handle OPTIONS for any path
  if (method.toUpperCase() === 'OPTIONS') {
    return await secureApiRoutes['OPTIONS']();
  }
  
  return {
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: { 
      error: 'API endpoint not found',
      availableEndpoints: Object.keys(secureApiRoutes)
    }
  };
};

export default secureApiRoutes;
