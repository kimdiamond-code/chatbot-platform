import { botConfigService } from '../services/botConfigService.js';
import { chatBotService } from '../services/openaiService.js';
import { operatingHoursService } from '../services/operatingHoursService.js';
import { knowledgeBaseService } from '../services/knowledgeBaseService.js';

// Simple API router for bot configuration endpoints
const apiRoutes = {
  // Get public bot configuration for widget
  'GET /bot-config': async (req, res) => {
    try {
      const orgId = req.query.org || req.query.organization_id;
      const config = await botConfigService.getPublicBotConfig(orgId);
      
      // Add CORS headers for cross-origin requests
      res.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      };
      
      return {
        status: 200,
        body: { success: true, data: config }
      };
    } catch (error) {
      console.error('API Error getting bot config:', error);
      return {
        status: 500,
        body: { success: false, error: 'Failed to load bot configuration' }
      };
    }
  },

  // Chat API endpoints for real-time conversations
  'POST /chat': async (req, res) => {
    try {
      const { message, conversationId, organizationId } = req.body;
      
      if (!message || !conversationId) {
        return {
          status: 400,
          body: { success: false, error: 'Message and conversationId required' }
        };
      }
      
      // Load bot configuration
      const botConfig = await botConfigService.getPublicBotConfig(organizationId);
      
      // ✅ CRITICAL FIX: Check operating hours FIRST before processing
      const operatingHours = botConfig.settings?.operatingHours;
      const isWithinHours = operatingHoursService.isWithinOperatingHours(operatingHours);
      
      if (!isWithinHours) {
        // Bot is offline - return operating hours message
        const offlineResponse = operatingHoursService.generateOfflineMessage(
          operatingHours, 
          botConfig.name || 'ChatBot'
        );
        
        const nextOpening = operatingHoursService.getNextOpeningTime(operatingHours);
        
        return {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: {
              message: offlineResponse.message,
              confidence: 1.0,
              source: 'operating_hours_check',
              shouldEscalate: false,
              knowledgeUsed: false,
              knowledgeSources: [],
              isOffline: true,
              operatingHours: offlineResponse.operatingHours,
              nextOpening: nextOpening
            }
          }
        };
      }
      
      // Bot is online - proceed with normal processing
      try {
        // Update chatbot service with current configuration
        chatBotService.updateBotConfig(conversationId, {
          systemPrompt: botConfig.systemPrompt || 'You are a helpful customer service assistant.',
          operatingHours: operatingHours // Pass operating hours to service
        });
        
        // Set knowledge base
        if (botConfig.knowledgeBase && botConfig.knowledgeBase.length > 0) {
          chatBotService.setKnowledgeBase(conversationId, botConfig.knowledgeBase);
        }
        
        // Generate AI response
        const result = await chatBotService.generateResponse(message, conversationId, botConfig);
        
        return {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: {
              message: result.response,
              confidence: result.confidence,
              source: result.source,
              shouldEscalate: result.shouldEscalate,
              knowledgeUsed: result.knowledgeUsed,
              knowledgeSources: result.knowledgeSources || [],
              isOffline: false
            }
          }
        };
      } catch (aiError) {
        console.error('AI processing failed, using Q&A fallback:', aiError);
        
        // Fallback to Q&A matching when AI fails
        try {
          const fallbackResponse = await this.processQAFallback(message, botConfig);
          return {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: {
              success: true,
              data: {
                ...fallbackResponse,
                source: fallbackResponse.source + ' (AI fallback)',
                isOffline: false
              }
            }
          };
        } catch (fallbackError) {
          console.error('All processing failed, using emergency fallback:', fallbackError);
          
          // Emergency fallback
          return {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: {
              success: true,
              data: {
                message: "I'm having trouble processing your request right now. Please try again in a moment, or contact our support team for immediate assistance.",
                confidence: 0.1,
                source: 'emergency_fallback',
                shouldEscalate: true,
                knowledgeUsed: false,
                knowledgeSources: [],
                isOffline: false
              }
            }
          };
        }
      }
      
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        status: 500,
        body: { 
          success: false, 
          error: 'Failed to process chat message',
          fallback: "I'm having trouble responding right now. Please try again or contact support."
        }
      };
    }
  },
  
  // Start new conversation with operating hours awareness
  'POST /chat/start': async (req, res) => {
    try {
      const { conversationId, organizationId } = req.body;
      
      // Load bot configuration
      const botConfig = await botConfigService.getPublicBotConfig(organizationId);
      
      // ✅ Check operating hours for initial greeting
      const operatingHours = botConfig.settings?.operatingHours;
      const isWithinHours = operatingHoursService.isWithinOperatingHours(operatingHours);
      
      let greeting = botConfig.greeting || 'Hello! How can I help you today?';
      let isOffline = false;
      
      if (!isWithinHours) {
        // Generate offline greeting
        const offlineResponse = operatingHoursService.generateOfflineMessage(
          operatingHours, 
          botConfig.name || 'ChatBot'
        );
        greeting = offlineResponse.message;
        isOffline = true;
      } else {
        // Initialize conversation with bot config for online hours
        chatBotService.updateBotConfig(conversationId, {
          systemPrompt: botConfig.systemPrompt || 'You are a helpful customer service assistant.',
          operatingHours: operatingHours
        });
        
        // Set knowledge base and Q&A database
        if (botConfig.knowledgeBase) {
          chatBotService.setKnowledgeBase(conversationId, botConfig.knowledgeBase);
        }
      }
      
      const nextOpening = isOffline ? operatingHoursService.getNextOpeningTime(operatingHours) : null;
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          data: {
            conversationId,
            greeting,
            botName: botConfig.name || 'ChatBot',
            isOffline,
            nextOpening,
            operatingHours: isOffline ? {
              enabled: operatingHours?.enabled,
              start: operatingHoursService.formatTime(operatingHours?.start),
              end: operatingHoursService.formatTime(operatingHours?.end),
              timezone: operatingHoursService.formatTimezone(operatingHours?.timezone)
            } : null
          }
        }
      };
      
    } catch (error) {
      console.error('Chat start API error:', error);
      return {
        status: 500,
        body: { success: false, error: 'Failed to start conversation' }
      };
    }
  },
  
  // Q&A matching endpoint (enhanced with operating hours awareness)
  'POST /chat/qa-match': async (req, res) => {
    try {
      const { message, organizationId } = req.body;
      
      // Load bot configuration
      const botConfig = await botConfigService.getPublicBotConfig(organizationId);
      
      // ✅ Check operating hours first
      const operatingHours = botConfig.settings?.operatingHours;
      const isWithinHours = operatingHoursService.isWithinOperatingHours(operatingHours);
      
      if (!isWithinHours) {
        // Return offline message for Q&A fallback too
        const offlineResponse = operatingHoursService.generateOfflineMessage(
          operatingHours, 
          botConfig.name || 'ChatBot'
        );
        
        return {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: {
            success: true,
            data: {
              message: offlineResponse.message,
              confidence: 1.0,
              source: 'operating_hours_check',
              shouldEscalate: false,
              isOffline: true
            }
          }
        };
      }
      
      // Process Q&A normally during operating hours
      const qaResponse = await this.processQAFallback(message, botConfig);
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          data: {
            ...qaResponse,
            isOffline: false
          }
        }
      };
      
    } catch (error) {
      console.error('Q&A match API error:', error);
      return {
        status: 500,
        body: { success: false, error: 'Failed to process Q&A matching' }
      };
    }
  },

  // ✅ ENHANCED: Q&A and Knowledge Base Processing with Honest Fallback
  async processQAFallback(message, botConfig) {
    const qaDatabase = botConfig.qaDatabase || [];
    const knowledgeBase = botConfig.knowledgeBase || [];
    const escalationKeywords = botConfig.escalationKeywords || [];
    const messageLower = message.toLowerCase().trim();
    
    console.log('🔍 Processing fallback for:', message);
    console.log('📊 Available Q&A entries:', qaDatabase.length);
    console.log('📚 Available knowledge base items:', knowledgeBase.length);
    
    // Step 1: Check escalation keywords first
    for (const keyword of escalationKeywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        console.log('🚨 Escalation keyword detected:', keyword);
        return {
          message: "I understand you'd like to speak with a human agent. Let me connect you with someone who can help you better.",
          confidence: 0.9,
          source: 'escalation_detection',
          shouldEscalate: true,
          knowledgeUsed: false
        };
      }
    }
    
    // Step 2: Search Q&A database
    console.log('🔍 Searching Q&A database...');
    for (const qa of qaDatabase) {
      if (!qa.enabled) continue;
      
      // Check direct question match
      if (qa.question.toLowerCase().includes(messageLower) || messageLower.includes(qa.question.toLowerCase())) {
        console.log('✅ Q&A direct match found:', qa.question);
        return {
          message: qa.answer,
          confidence: 0.85,
          source: 'qa_database',
          shouldEscalate: false,
          knowledgeUsed: false
        };
      }
      
      // Check keyword matches
      for (const keyword of qa.keywords || []) {
        if (messageLower.includes(keyword.toLowerCase())) {
          console.log('✅ Q&A keyword match found:', keyword);
          return {
            message: qa.answer,
            confidence: 0.75,
            source: 'qa_database',
            shouldEscalate: false,
            knowledgeUsed: false
          };
        }
      }
    }
    
    // Step 3: Search Knowledge Base
    console.log('📚 Searching knowledge base...');
    if (knowledgeBase.length > 0) {
      try {
        const preparedKnowledgeBase = knowledgeBaseService.prepareKnowledgeBase(knowledgeBase);
        const knowledgeResponse = knowledgeBaseService.searchAndRespond(preparedKnowledgeBase, message, botConfig);
        
        if (knowledgeResponse && knowledgeResponse.knowledgeUsed) {
          console.log('✅ Knowledge base match found');
          return {
            message: knowledgeResponse.message,
            confidence: knowledgeResponse.confidence,
            source: knowledgeResponse.source,
            shouldEscalate: knowledgeResponse.shouldEscalate,
            knowledgeUsed: true,
            knowledgeSources: knowledgeResponse.knowledgeSources
          };
        } else if (knowledgeResponse) {
          // Honest "I don't know" response from knowledge service
          console.log('❌ No knowledge base matches - returning honest response');
          return {
            message: knowledgeResponse.message,
            confidence: knowledgeResponse.confidence,
            source: knowledgeResponse.source,
            shouldEscalate: knowledgeResponse.shouldEscalate,
            knowledgeUsed: false
          };
        }
      } catch (error) {
        console.error('Knowledge base search error:', error);
      }
    }
    
    // Step 4: Final honest fallback - no matches found anywhere
    console.log('❌ No matches found in Q&A or Knowledge Base');
    const isSpecificQuestion = knowledgeBaseService.isSpecificQuestion(message);
    
    if (isSpecificQuestion) {
      // For specific questions, be honest and suggest human help
      return {
        message: "I don't have specific information about that topic in my current knowledge base. For accurate details, I'd recommend speaking with one of our human agents who can provide you with the most up-to-date information.",
        confidence: 0.8, // High confidence in being honest
        source: 'honest_no_match',
        shouldEscalate: true,
        knowledgeUsed: false
      };
    } else {
      // For unclear questions, ask for clarification
      return {
        message: "I'm not sure I understand what you're looking for. Could you provide more details or rephrase your question? Alternatively, I can connect you with a human agent who might be better able to assist you.",
        confidence: 0.7,
        source: 'clarification_needed',
        shouldEscalate: false,
        knowledgeUsed: false
      };
    }
  },

  // Check operating hours status endpoint
  'GET /operating-hours/status': async (req, res) => {
    try {
      const orgId = req.query.org || req.query.organization_id;
      const botConfig = await botConfigService.getPublicBotConfig(orgId);
      const operatingHours = botConfig.settings?.operatingHours;
      
      const isWithinHours = operatingHoursService.isWithinOperatingHours(operatingHours);
      const nextOpening = !isWithinHours ? operatingHoursService.getNextOpeningTime(operatingHours) : null;
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          data: {
            isOnline: isWithinHours,
            operatingHours: operatingHours ? {
              enabled: operatingHours.enabled,
              start: operatingHoursService.formatTime(operatingHours.start),
              end: operatingHoursService.formatTime(operatingHours.end),
              timezone: operatingHoursService.formatTimezone(operatingHours.timezone)
            } : null,
            nextOpening,
            currentTime: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      console.error('Operating hours status error:', error);
      return {
        status: 500,
        body: { success: false, error: 'Failed to check operating hours status' }
      };
    }
  },

  // Save bot configuration (from Bot Builder)
  'POST /bot-config': async (req, res) => {
    try {
      const config = req.body;
      
      // Validate operating hours if present
      if (config.operatingHours) {
        const validation = operatingHoursService.validateOperatingHours(config.operatingHours);
        if (!validation.valid) {
          return {
            status: 400,
            body: { success: false, error: validation.error }
          };
        }
      }
      
      const result = await botConfigService.saveBotConfig(config);
      
      return {
        status: result.success ? 200 : 500,
        body: result
      };
    } catch (error) {
      console.error('API Error saving bot config:', error);
      return {
        status: 500,
        body: { success: false, error: 'Failed to save bot configuration' }
      };
    }
  },

  // Load bot configuration (for Bot Builder)
  'GET /bot-config/load': async (req, res) => {
    try {
      const botId = req.query.bot_id || 'default';
      const result = await botConfigService.loadBotConfig(botId);
      
      return {
        status: result.success ? 200 : 500,
        body: result
      };
    } catch (error) {
      console.error('API Error loading bot config:', error);
      return {
        status: 500,
        body: { success: false, error: 'Failed to load bot configuration' }
      };
    }
  },

  // Health check endpoint (enhanced with operating hours status)
  'GET /health': async (req, res) => {
    try {
      const dbConnected = await botConfigService.testConnection();
      
      // Check a sample operating hours configuration
      const sampleHours = {
        enabled: true,
        start: '09:00',
        end: '17:00',
        timezone: 'UTC'
      };
      const hoursValidation = operatingHoursService.validateOperatingHours(sampleHours);
      
      return {
        status: 200,
        body: { 
          status: 'ok',
          database: dbConnected ? 'connected' : 'localStorage fallback',
          operatingHours: hoursValidation.valid ? 'functional' : 'error',
          openai: 'check browser console for OpenAI status',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 500,
        body: { status: 'error', error: error.message }
      };
    }
  },

  // Test endpoint to verify fixes are loaded
  'GET /test-fix': async (req, res) => {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: {
        success: true,
        message: 'Knowledge base fix is loaded!',
        timestamp: new Date().toISOString(),
        knowledgeServiceLoaded: !!knowledgeBaseService,
        apiRoutesUpdated: true,
        openaiFixed: true
      }
    };
  },
  
  // Debug endpoint to check knowledge base content
  'GET /debug/knowledge-base': async (req, res) => {
    try {
      const orgId = req.query.org || req.query.organization_id;
      const botConfig = await botConfigService.getPublicBotConfig(orgId);
      
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: {
          success: true,
          knowledgeBase: botConfig.knowledgeBase || [],
          qaDatabase: botConfig.qaDatabase || [],
          knowledgeCount: (botConfig.knowledgeBase || []).length,
          qaCount: (botConfig.qaDatabase || []).length,
          sampleKnowledge: (botConfig.knowledgeBase || []).slice(0, 2).map(item => ({
            name: item.name,
            type: item.type,
            hasContent: !!item.content,
            contentLength: item.content?.length || 0,
            hasChunks: !!item.chunks,
            chunksLength: item.chunks?.length || 0,
            keywords: item.keywords,
            enabled: item.enabled
          }))
        }
      };
    } catch (error) {
      console.error('Debug knowledge base error:', error);
      return {
        status: 500,
        body: { success: false, error: error.message }
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

// Simple request handler
export const handleApiRequest = async (method, url, body = null, query = {}) => {
  const route = `${method.toUpperCase()} ${url}`;
  
  if (apiRoutes[route]) {
    const req = { body, query, method };
    const res = { headers: {} };
    return await apiRoutes[route](req, res);
  }
  
  // Handle OPTIONS requests for any path
  if (method.toUpperCase() === 'OPTIONS') {
    return await apiRoutes['OPTIONS']();
  }
  
  return {
    status: 404,
    body: { error: 'API endpoint not found' }
  };
};

// Export for use in development server
export default apiRoutes;