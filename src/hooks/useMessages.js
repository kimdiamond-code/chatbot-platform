import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { dbService } from '../services/databaseService'
import { enhancedBotService } from '../services/enhancedBotService'
import { useAuth } from './useAuth'
import analyticsService from '../services/analyticsService'
import { analyticsTracker } from '../services/analyticsTracker'
import { shopifyService } from '../services/integrations/shopifyService'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const useMessages = (conversationId) => {
  const { user } = useAuth()

  // Fetch messages from Neon database
  const { data: messages = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      try {
        const msgs = await dbService.getMessages(conversationId);
        console.log('📨 Loaded messages from database:', msgs.length);
        return msgs;
      } catch (error) {
        console.error('❌ Failed to load messages:', error);
        // Return demo messages as fallback
        return getDemoMessages(conversationId);
      }
    },
    enabled: !!conversationId,
    refetchInterval: 5000 // Refetch every 5 seconds for real-time feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      console.log('📤 Sending message:', messageData);
      
      try {
        // Save message to Neon database
        const savedMessage = await dbService.createMessage({
          conversation_id: messageData.conversation_id,
          sender_type: messageData.sender_type,
          content: messageData.content,
          metadata: messageData.metadata || {}
        });

        console.log('✅ Message saved to database:', savedMessage.id);

        // 📊 ANALYTICS: Track message sent with new comprehensive tracker
        try {
          await analyticsTracker.trackMessage(messageData.conversation_id, {
            sender_type: messageData.sender_type,
            content: messageData.content
          });
        } catch (analyticsError) {
          console.error('⚠️ Analytics tracking error:', analyticsError);
        }

        // If this is a customer/user message, generate bot response
        if (messageData.sender_type === 'user' || 
            enhancedBotService.shouldProcessMessage(messageData.sender_type, messageData.content)) {
          
          console.log('🤖 Generating bot response...');
          
          try {
            // Generate smart bot response
            const botResult = await enhancedBotService.processMessage(
              messageData.content,
              messageData.conversation_id,
              messageData.customer_email
            );

            console.log('🤖 Bot response generated:', botResult.source);

            // 📊 ANALYTICS: Track AI insights from bot response using comprehensive tracker
            try {
              // Detect product mentions
              if (botResult.metadata?.products && botResult.metadata.products.length > 0) {
                for (const product of botResult.metadata.products) {
                  await analyticsTracker.trackProductDiscussion(
                    messageData.conversation_id,
                    product
                  );
                }
                console.log('📊 Tracked product views:', botResult.metadata.products.length);
              }

              // Detect categories discussed
              if (botResult.metadata?.categories && botResult.metadata.categories.length > 0) {
                for (const category of botResult.metadata.categories) {
                  await analyticsTracker.trackCategoryDiscussion(
                    messageData.conversation_id,
                    category
                  );
                }
                console.log('📊 Tracked category discussion:', botResult.metadata.categories);
              }

              // Detect order-related activity
              if (botResult.metadata?.orderTracking) {
                await analyticsTracker.trackEvent(
                  messageData.conversation_id,
                  'order_inquiry',
                  botResult.metadata.orderTracking
                );
                console.log('📊 Tracked order inquiry');
              }

              // Detect missing information and track bot confidence
              if (botResult.confidence < 0.7) {
                await analyticsTracker.trackBotConfidence(
                  messageData.conversation_id,
                  botResult.confidence,
                  extractIntent(messageData.content)
                );
              }
              
              if (botResult.confidence < 0.5 || botResult.source === 'fallback') {
                const intent = extractIntent(messageData.content);
                if (intent) {
                  await analyticsTracker.trackMissingInfo(
                    messageData.conversation_id,
                    intent,
                    messageData.content
                  );
                  console.log('📊 Tracked missing info:', intent);
                }
              }

              // Track escalation
              if (botResult.shouldEscalate) {
                await analyticsTracker.updateConversationMetadata(
                  messageData.conversation_id,
                  { escalated: true, escalationReason: botResult.metadata?.escalationReason }
                );
                console.log('📊 Tracked escalation');
              }
            } catch (analyticsError) {
              console.error('⚠️ Analytics tracking error (bot insights):', analyticsError);
            }

            // Save bot message to database
            const botMessage = await dbService.createMessage({
              conversation_id: messageData.conversation_id,
              sender_type: 'bot',
              content: botResult.response,
              metadata: {
                source: botResult.source,
                confidence: botResult.confidence,
                actions: botResult.actions || [],
                shouldEscalate: botResult.shouldEscalate || false,
                ...botResult.metadata
              }
            });

            console.log('✅ Bot message saved to database:', botMessage.id);

            // Refetch messages to update UI
            await refetch();

            return {
              userMessage: savedMessage,
              botMessage: botMessage,
              escalated: botResult.shouldEscalate
            };

          } catch (botError) {
            console.error('❌ Bot response error:', botError);
            return { userMessage: savedMessage, error: botError.message };
          }
        }

        // Refetch messages to update UI
        await refetch();
        return { userMessage: savedMessage };

      } catch (error) {
        console.error('❌ Failed to send message:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('✅ Message sent successfully');
    }
  });

  const sendMessage = async (messageData) => {
    const messageToSend = {
      ...messageData,
      sender_id: user?.id,
      created_at: new Date().toISOString()
    };

    return sendMessageMutation.mutateAsync(messageToSend);
  };

  // Send a test customer message (for testing smart responses)
  const sendCustomerMessage = async (content, customerEmail = null) => {
    return sendMessage({
      conversation_id: conversationId,
      content: content,
      sender_type: 'user',
      customer_email: customerEmail // Only pass if explicitly provided
    });
  };

  // Handle smart response actions
  const handleActionClick = async (action) => {
    console.log('🎯 Handling action:', action);
    
    switch (action.type) {
      case 'escalate':
        console.log('🚀 Escalating conversation...');
        // Could update conversation status in a real app
        break;
        
      case 'quick_reply':
        await sendCustomerMessage(action.value);
        break;

      case 'add_to_cart':
        console.log('🛒 Adding to cart:', action.data);
        
        // Get customer email from enhanced bot service session
        const sessionEmail = enhancedBotService.getCustomerEmail(conversationId) || 'guest@example.com';
        console.log('📧 Using customer email for cart:', sessionEmail);
        
        // Check if we're in demo mode by verifying Shopify connection
        let isDemoMode = false;
        try {
          isDemoMode = !(await shopifyService.verifyConnection());
          
          if (isDemoMode) {
            console.log('🎭 DEMO MODE: Mock add to cart');
            // Use demo service
            const { demoShopifyService } = await import('../services/demoShopifyService');
            const result = await demoShopifyService.mockAddToCart({
              ...action.data,
              customerEmail: sessionEmail
            });
            console.log('✅ Demo cart created:', result);
          } else {
            console.log('✅ Real Shopify: Adding to cart');
            // Real Shopify - create draft order with session email
            const result = await shopifyService.createDraftOrder({
              ...action.data,
              customerEmail: sessionEmail
            });
            console.log('✅ Added to cart:', result);
          }
          
          // Send confirmation message
          await sendMessage({
            conversation_id: conversationId,
            content: `✅ Added ${action.data.product?.title || 'item'} to cart!${isDemoMode ? ' (Demo Mode)' : ''}`,
            sender_type: 'bot',
            metadata: {
              source: 'shopify',
              action: 'add_to_cart',
              cartItem: action.data,
              demoMode: isDemoMode
            }
          });
          
          // Track analytics - Add to Cart
          await analyticsTracker.trackAddToCart(
            conversationId,
            action.data.product,
            action.data.quantity || 1
          );
          
          console.log('📊 Tracked add to cart:', action.data.product?.title);
          
        } catch (error) {
          console.error('❌ Failed to add to cart:', error);
          console.error('❌ Error details:', error.message);
          console.error('❌ Action data:', action.data);
          
          // Send detailed error message
          const errorMessage = isDemoMode 
            ? `❌ Demo mode: ${error.message || 'Failed to create mock cart'}. The demo cart feature is being set up.`
            : `❌ Sorry, I couldn't add that item to your cart. ${error.message || 'Please try again or contact support.'}`;
          
          await sendMessage({
            conversation_id: conversationId,
            content: errorMessage,
            sender_type: 'bot',
            metadata: {
              error: true,
              errorMessage: error.message,
              errorType: 'add_to_cart_failed'
            }
          });
        }
        break;
        
      default:
        console.log('🔧 Action not handled:', action.type);
    }
  };

  return {
    messages: messages || [],
    loading,
    error: null,
    sendMessage,
    sendCustomerMessage, // For testing
    handleActionClick,
    sending: sendMessageMutation.isPending || sendMessageMutation.isLoading,
    smartBotEnabled: enhancedBotService.getStatus().enabled,
    refetch
  }
}

// Helper function to extract intent from message for missing info tracking
function extractIntent(message) {
  const lower = message.toLowerCase();
  
  // Common intents that might be missing from knowledge base
  const intentPatterns = {
    'shipping-cost': /shipping.*cost|how much.*ship|shipping.*price/,
    'return-policy': /return.*policy|can i return|refund.*policy/,
    'warranty': /warranty|guarantee/,
    'payment-methods': /payment.*method|how.*pay|accept.*payment/,
    'delivery-time': /delivery.*time|how long.*deliver|when.*arrive/,
    'product-availability': /in stock|available|out of stock/,
    'discount-code': /discount.*code|promo.*code|coupon/,
    'size-guide': /size.*guide|sizing|what size/,
    'product-specs': /specification|specs|details/,
    'customer-service': /contact|phone.*number|email.*support/
  };
  
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(lower)) {
      return intent;
    }
  }
  
  return null;
}

// Demo messages fallback
function getDemoMessages(conversationId) {
  const demoMessages = {
    '10000000-0000-0000-0000-000000000001': [
      {
        id: 'msg_1_1',
        conversation_id: conversationId,
        content: 'Hi, I placed an order last week but I haven\'t received any tracking information. Can you help me?',
        sender_type: 'user',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'msg_1_2',
        conversation_id: conversationId,
        content: 'I\'d be happy to help you track your order! Let me look that up for you.',
        sender_type: 'agent',
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      }
    ]
  };
  
  return demoMessages[conversationId] || [];
}

export default useMessages;
