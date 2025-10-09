// Simple API routes for development - bypasses complex service imports
import { createClient } from '@supabase/supabase-js'

// Simple environment variable access that works in both contexts
function getEnvVar(key) {
  // Try Vite environment first (browser/client)
  if (typeof window !== 'undefined' && import.meta?.env) {
    return import.meta.env[key];
  }
  // Try Node.js environment (server/middleware) - should be loaded by Vite
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  // Fallback for debugging
  console.warn(`Environment variable ${key} not found in either context`);
  return undefined;
}

// Simple bot configuration without complex dependencies
const getSimpleBotConfig = () => {
  return {
    botId: 'demo',
    name: 'ChatBot Assistant',
    greeting: 'Hello! How can I help you today?',
    systemPrompt: 'You are a helpful customer service assistant. You are professional, friendly, and concise.',
    qaDatabase: [
      {
        id: 'qa1',
        question: 'What are your business hours?',
        answer: 'We are open Monday through Friday from 9 AM to 6 PM EST. Our customer support team is available during these hours to assist you.',
        keywords: ['hours', 'open', 'business', 'time', 'when'],
        enabled: true,
        category: 'general'
      },
      {
        id: 'qa2',
        question: 'How can I contact support?',
        answer: 'You can contact our support team through this chat, email us at support@example.com, or call us at (555) 123-4567 during business hours.',
        keywords: ['contact', 'support', 'help', 'phone', 'email'],
        enabled: true,
        category: 'support'
      },
      {
        id: 'qa3',
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all products. Items must be returned in their original condition with all packaging and accessories. Contact our customer service team to initiate a return.',
        keywords: ['return', 'refund', 'policy', 'exchange', 'money back'],
        enabled: true,
        category: 'policies'
      },
      {
        id: 'qa4',
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship internationally to most countries. Shipping typically takes 7-14 business days and duties/taxes may apply. Contact us for specific country availability.',
        keywords: ['international', 'shipping', 'global', 'overseas', 'abroad'],
        enabled: true,
        category: 'shipping'
      }
    ],
    knowledgeBase: [],
    escalationKeywords: ['human', 'agent', 'manager', 'speak to someone'],
    settings: {
      operatingHours: { enabled: false }
    }
  };
};

// Simple OpenAI test function
async function testOpenAIConnection() {
  try {
    const apiKey = getEnvVar('VITE_OPENAI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'No API key found',
        source: 'env_check'
      };
    }

    console.log('🤖 Testing OpenAI with key:', apiKey.substring(0, 20) + '...');

    // Dynamic import OpenAI to avoid early binding issues
    const { default: OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: apiKey,
      // Only use dangerouslyAllowBrowser in browser context
      ...(typeof window !== 'undefined' && { dangerouslyAllowBrowser: true })
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond with exactly: "OpenAI connection successful!"' },
        { role: 'user', content: 'test connection' }
      ],
      max_tokens: 20,
      temperature: 0.1
    });

    const result = response.choices[0].message.content;
    console.log('✅ OpenAI Test Response:', result);

    return {
      success: true,
      response: result,
      source: 'openai_direct'
    };

  } catch (error) {
    console.error('❌ OpenAI Test Failed:', error);
    return {
      success: false,
      error: error.message,
      code: error.code,
      source: 'openai_error'
    };
  }
}

// Simple Q&A matching with improved logic
function findQAMatch(message, qaDatabase) {
  const messageLower = message.toLowerCase().trim();
  
  console.log('🔍 Q&A Matching for:', message);
  
  for (const qa of qaDatabase) {
    if (!qa.enabled) continue;
    
    console.log('🔍 Testing Q&A:', qa.question);
    
    // Check for strong keyword matches (multiple keywords or exact phrases)
    let keywordScore = 0;
    let matchedKeywords = [];
    
    for (const keyword of qa.keywords || []) {
      if (messageLower.includes(keyword.toLowerCase())) {
        keywordScore++;
        matchedKeywords.push(keyword);
        console.log('  📌 Keyword match:', keyword);
      }
    }
    
    // Require at least 2 keyword matches OR specific strong matches for business hours
    if (qa.question.toLowerCase().includes('business hours') || qa.question.toLowerCase().includes('hours')) {
      // For hours questions, require stronger matching
      const hoursKeywords = ['hours', 'open', 'closed', 'time', 'when'];
      const strongMatch = hoursKeywords.some(word => messageLower.includes(word));
      const isTimeQuestion = messageLower.includes('what time') || messageLower.includes('when are you') || messageLower.includes('hours');
      
      if (strongMatch && isTimeQuestion && keywordScore >= 1) {
        console.log('✅ Strong hours Q&A match found');
        return {
          answer: qa.answer,
          confidence: 0.85,
          source: 'qa_database',
          matchType: 'hours_specific',
          matchedKeywords
        };
      }
    } else {
      // For other Q&As, require at least 2 keyword matches
      if (keywordScore >= 2) {
        console.log('✅ Q&A match found with', keywordScore, 'keywords');
        return {
          answer: qa.answer,
          confidence: 0.75,
          source: 'qa_database',
          matchType: 'keyword',
          matchedKeywords
        };
      }
    }
    
    console.log('  ❌ No strong match (score:', keywordScore, ')');
  }
  
  console.log('❌ No Q&A matches found');
  return null;
}

// Simple fallback responses
function getHonestFallback(message) {
  const messageLower = message.toLowerCase().trim();
  
  // Check if it's a greeting
  if (['hello', 'hi', 'hey', 'good morning', 'good afternoon'].some(greeting => 
      messageLower.includes(greeting))) {
    return {
      response: "Hello! I'm here to help you with any questions you might have. What can I assist you with today?",
      confidence: 0.9,
      source: 'greeting_detection',
      shouldEscalate: false
    };
  }
  
  // Check escalation keywords
  const escalationKeywords = ['human', 'agent', 'person', 'representative', 'manager', 'speak to someone'];
  if (escalationKeywords.some(keyword => messageLower.includes(keyword))) {
    return {
      response: "I understand you'd like to speak with a human agent. Let me connect you with someone who can better assist you.",
      confidence: 0.9,
      source: 'escalation_detection',
      shouldEscalate: true
    };
  }
  
  // For specific questions, be honest
  const questionWords = ['what', 'how', 'when', 'where', 'why', 'who', 'which'];
  const hasQuestionWord = questionWords.some(word => messageLower.includes(word));
  const hasQuestionMark = message.includes('?');
  
  if (hasQuestionWord || hasQuestionMark) {
    return {
      response: "I don't have specific information about that topic in my current knowledge base. For accurate details, I'd recommend speaking with one of our human agents who can provide you with the most up-to-date information.",
      confidence: 0.8,
      source: 'honest_no_match',
      shouldEscalate: true
    };
  }
  
  // For unclear requests
  return {
    response: "I'm not sure I understand what you're looking for. Could you provide more details or rephrase your question? Alternatively, I can connect you with a human agent who might be better able to assist you.",
    confidence: 0.7,
    source: 'clarification_needed',
    shouldEscalate: false
  };
}

// Simple API routes
const simpleApiRoutes = {
  // Health check
  'GET /health': async (req, res) => {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: {
        status: 'ok',
        message: 'Simple API routes working',
        timestamp: new Date().toISOString(),
        environment: typeof window !== 'undefined' ? 'browser' : 'node'
      }
    };
  },

  // Get bot configuration
  'GET /bot-config': async (req, res) => {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: {
        success: true,
        data: getSimpleBotConfig()
      }
    };
  },

  // Test OpenAI
  'GET /test-openai': async (req, res) => {
    const result = await testOpenAIConnection();
    
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: result
    };
  },

  // Chat endpoint with OpenAI integration
  'POST /chat': async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      
      if (!message || !conversationId) {
        return {
          status: 400,
          body: { success: false, error: 'Message and conversationId required' }
        };
      }

      console.log('🤖 Processing chat message:', message);
      const botConfig = getSimpleBotConfig();
      
      // First try OpenAI
      try {
        const openaiResult = await testOpenAIConnection();
        
        if (openaiResult.success) {
          console.log('✅ Using OpenAI for response');
          
          // Make actual OpenAI call with user message
          const apiKey = getEnvVar('VITE_OPENAI_API_KEY');
          const { default: OpenAI } = await import('openai');
          
          const openai = new OpenAI({
            apiKey: apiKey,
            ...(typeof window !== 'undefined' && { dangerouslyAllowBrowser: true })
          });

          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { 
                role: 'system', 
                content: botConfig.systemPrompt + "\n\nIf you don't know something specific, be honest about it and suggest speaking with a human agent."
              },
              { role: 'user', content: message }
            ],
            max_tokens: 300,
            temperature: 0.7
          });

          const aiResponse = response.choices[0].message.content;

          return {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: {
              success: true,
              data: {
                message: aiResponse,
                confidence: 0.9,
                source: 'openai',
                shouldEscalate: aiResponse.toLowerCase().includes('human agent'),
                knowledgeUsed: false,
                knowledgeSources: []
              }
            }
          };
        }
      } catch (openaiError) {
        console.log('🔄 OpenAI failed, using Q&A fallback:', openaiError.message);
      }
      
      // Fallback to Q&A matching
      const qaMatch = findQAMatch(message, botConfig.qaDatabase);
      if (qaMatch) {
        console.log('✅ Using Q&A database match');
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
              knowledgeSources: []
            }
          }
        };
      }
      
      // Final fallback
      console.log('🔄 Using honest fallback');
      const fallback = getHonestFallback(message);
      
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
            knowledgeSources: []
          }
        }
      };

    } catch (error) {
      console.error('❌ Chat API error:', error);
      return {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: false,
          error: 'Failed to process chat message',
          message: error.message
        }
      };
    }
  },

  // Start conversation
  'POST /chat/start': async (req, res) => {
    const botConfig = getSimpleBotConfig();
    
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: {
        success: true,
        data: {
          greeting: botConfig.greeting,
          botName: botConfig.name,
          isOffline: false
        }
      }
    };
  },

  // Options for CORS
  'OPTIONS': async (req, res) => {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }
};

// Simple request handler
export const handleApiRequest = async (method, url, body = null, query = {}) => {
  const route = `${method.toUpperCase()} ${url}`;
  console.log('🔍 Simple API handling:', route);
  
  if (simpleApiRoutes[route]) {
    const req = { body, query, method };
    const res = { headers: {} };
    return await simpleApiRoutes[route](req, res);
  }
  
  // Handle OPTIONS for any path
  if (method.toUpperCase() === 'OPTIONS') {
    return await simpleApiRoutes['OPTIONS']();
  }
  
  return {
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: { error: 'API endpoint not found' }
  };
};

export default simpleApiRoutes;
