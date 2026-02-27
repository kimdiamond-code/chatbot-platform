import React, { useState, useEffect } from 'react';
import { enhancedBotService } from '../services/enhancedBotService.js';
import { shopifyService } from '../services/integrations/shopifyService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

const ChatPreview = ({ botConfig, onSaveTraining }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null); // Track which product is being added
  
  // Get customization settings
  const customization = botConfig.customization || {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    botMessageBg: '#F3F4F6',
    userMessageBg: '#3B82F6',
    fontFamily: 'system-ui',
    fontSize: 'medium',
    borderRadius: 'rounded',
    logo: null,
    brandName: 'ChatBot',
    showBranding: true
  };
  
  // Font size mapping
  const fontSizeMap = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };
  
  // Border radius mapping
  const borderRadiusMap = {
    square: 'rounded-none',
    rounded: 'rounded-lg',
    pill: 'rounded-full'
  };

  // Initialize chat with greeting
  useEffect(() => {
    if (chatMessages.length === 0 && botConfig.greeting) {
      setChatMessages([{
        id: 1,
        content: botConfig.greeting,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [botConfig.greeting]);

  const findBestQAMatch = (userMessage) => {
    if (!botConfig.qaDatabase || botConfig.qaDatabase.length === 0) return null;
    
    const message = userMessage.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    
    botConfig.qaDatabase.forEach(qa => {
      if (!qa.enabled) return;
      
      let score = 0;
      qa.keywords.forEach(keyword => {
        if (message.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });
      
      const questionWords = qa.question.toLowerCase().split(' ');
      questionWords.forEach(word => {
        if (word.length > 3 && message.includes(word)) {
          score += 1;
        }
      });
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    });
    
    return bestScore > 0 ? bestMatch : null;
  };

  const sendPreviewMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || isTyping) return;

    const userMsg = {
      id: Date.now(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const userInput = newMessage;
    setNewMessage('');
    setIsTyping(true);

    try {
      // ✅ MULTI-TENANT FIX: Pass organization ID to load correct bot config
      console.log('🤖 Sending message with org context:', DEFAULT_ORG_ID);
      
      const botResult = await enhancedBotService.processMessage(
        userInput, 'bot-builder-preview', null, DEFAULT_ORG_ID
      );
      
      const botMsg = {
        id: Date.now() + 1,
        content: botResult.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        metadata: botResult.metadata || {  // ← Pass metadata through
          source: botResult.source,
          confidence: botResult.confidence
        }
      };
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        
        // Save to training data
        if (onSaveTraining) {
          onSaveTraining(userInput, botMsg.content);
        }
      }, botConfig.responseDelay || 1500);
      
    } catch (error) {
      console.error('Error:', error);
      
      const hasEscalationKeyword = botConfig.escalationKeywords?.some(keyword => 
        userInput.toLowerCase().includes(keyword.toLowerCase())
      );

      let botResponse = '';
      if (hasEscalationKeyword) {
        botResponse = "I understand you'd like to speak with a human agent. Let me connect you with someone from our team.";
      } else {
        const qaMatch = findBestQAMatch(userInput);
        botResponse = qaMatch ? qaMatch.answer : (botConfig.fallback || "I'm not sure about that.");
      }

      const botMsg = {
        id: Date.now() + 1,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        if (onSaveTraining) {
          onSaveTraining(userInput, botMsg.content);
        }
      }, botConfig.responseDelay || 1500);
    }
  };

  const clearPreviewChat = () => {
    setChatMessages([{
      id: 1,
      content: botConfig.greeting,
      sender: 'bot',
      timestamp: new Date().toISOString()
    }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping && newMessage.trim()) {
      e.preventDefault();
      sendPreviewMessage(e);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    
    try {
      console.log('🛒 Adding to cart:', product.title);
      
      // Create draft order (cart) in Shopify
      const draftOrder = await shopifyService.createDraftOrder({
        product: product,
        quantity: 1,
        customerEmail: 'preview@demo.com', // Demo email for preview
        variantId: product.variants?.[0]?.id
      }, DEFAULT_ORG_ID);
      
      console.log('✅ Added to cart:', draftOrder);
      
      // Show success message in chat
      const successMsg = {
        id: Date.now(),
        content: `✅ **${product.title}** has been added to your cart!\n\n💰 Price: ${product.variants?.[0]?.price}\n\nWould you like to continue shopping or checkout?`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'cart_action',
          confidence: 1.0
        }
      };
      
      setChatMessages(prev => [...prev, successMsg]);
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      
      // Show error message
      const errorMsg = {
        id: Date.now(),
        content: `Sorry, I couldn't add **${product.title}** to your cart right now. ${error.message || 'Please try again later.'}`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'cart_error',
          confidence: 0.5
        }
      };
      
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="h-full flex flex-col items-end justify-end p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Preview Label */}
      <div className="mb-2 text-right">
        <p className="text-sm font-semibold text-gray-700">Website Widget Preview</p>
        <p className="text-xs text-gray-500">This is how visitors will see your chatbot</p>
      </div>
      
      {/* Widget Preview Container - positioned like on a website */}
      <div 
        className={`w-96 h-[600px] flex flex-col ${borderRadiusMap[customization.borderRadius]} shadow-2xl border border-gray-200 overflow-hidden`}
        style={{ 
          backgroundColor: customization.backgroundColor,
          fontFamily: customization.fontFamily
        }}
      >
        {/* Header */}
        <div 
          className="p-3 border-b border-gray-200 text-white relative flex-shrink-0"
          style={{ 
            backgroundColor: customization.primaryColor
          }}
        >
          <div className="flex items-center gap-2">
            {customization.logo ? (
              <img 
                src={customization.logo} 
                alt="Logo" 
                className="w-8 h-8 rounded-full object-cover bg-white p-1"
              />
            ) : botConfig.customAvatarUrl ? (
              <img src={botConfig.customAvatarUrl} alt="Bot" className="w-8 h-8 rounded-full object-cover bg-white" />
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/${['robot','cipher','bolt'].includes(botConfig.avatar) ? 'bottts' : 'personas'}/svg?seed=${botConfig.avatar || 'robot'}&backgroundColor=b6e3f4`}
                alt="Bot"
                className="w-8 h-8 rounded-full bg-white"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{customization.brandName || botConfig.name}</h3>
              <p className="text-xs opacity-90">Online • Live Preview</p>
            </div>
            <button 
              onClick={clearPreviewChat}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1.5 rounded text-xs"
              title="Clear chat"
            >
              🔄
            </button>
          </div>
        </div>
      
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[280px] px-3 py-2 ${borderRadiusMap[customization.borderRadius]} ${fontSizeMap[customization.fontSize]} ${
                  msg.sender === 'user' 
                    ? 'text-white rounded-br-sm' 
                    : 'shadow-sm rounded-bl-sm'
                }`}
                style={{
                  backgroundColor: msg.sender === 'user' ? customization.userMessageBg : customization.botMessageBg,
                  color: msg.sender === 'user' ? '#FFFFFF' : customization.textColor
                }}
              >
                {msg.content}
              </div>
              
              {/* Display products if present */}
              {msg.metadata?.products && msg.metadata.products.length > 0 && (
                <div className="mt-2 space-y-2 max-w-[280px]">
                  {msg.metadata.products.map(product => (
                    <div 
                      key={product.id} 
                      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {product.images && product.images[0] && (
                        <img 
                          src={product.images[0].src} 
                          alt={product.images[0].alt}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                      )}
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">{product.title}</h4>
                      {product.variants && product.variants[0] && (
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold" style={{ color: customization.primaryColor }}>
                            ${product.variants[0].price}
                          </p>
                          <button
                            className="text-xs px-3 py-1.5 rounded text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: customization.primaryColor }}
                            onClick={() => handleAddToCart(product)}
                            disabled={addingToCart === product.id}
                          >
                            {addingToCart === product.id ? '⏳ Adding...' : '🛒 Add to Cart'}
                          </button>
                        </div>
                      )}
                      {product.vendor && (
                        <p className="text-xs text-gray-500 mt-1">by {product.vendor}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div 
                className={`px-3 py-2 ${borderRadiusMap[customization.borderRadius]} rounded-bl-sm shadow-sm`}
                style={{
                  backgroundColor: customization.botMessageBg,
                  color: customization.textColor
                }}
              >
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: customization.primaryColor }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: customization.primaryColor, animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: customization.primaryColor, animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className={`flex-1 px-3 py-2 border border-gray-300 ${borderRadiusMap[customization.borderRadius]} focus:ring-2 ${fontSizeMap[customization.fontSize]}`}
              style={{
                focusRing: customization.primaryColor
              }}
              disabled={isTyping}
            />
            <button
              type="button"
              onClick={(e) => sendPreviewMessage(e)}
              disabled={!newMessage.trim() || isTyping}
              className={`text-white px-4 py-2 ${borderRadiusMap[customization.borderRadius]} disabled:opacity-50 disabled:cursor-not-allowed ${fontSizeMap[customization.fontSize]} font-medium transition-colors cursor-pointer`}
              style={{
                backgroundColor: customization.primaryColor,
                ':hover': { backgroundColor: customization.secondaryColor }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = customization.secondaryColor}
              onMouseLeave={(e) => e.target.style.backgroundColor = customization.primaryColor}
            >
              {isTyping ? '...' : 'Send'}
            </button>
          </div>
          
          {/* Branding - Always show AgenStack.ai */}
          {customization.showBranding && (
            <div className="mt-2 text-center">
              <a 
                href="https://agenstack.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs opacity-60 hover:opacity-100 transition-opacity inline-flex items-center gap-1"
                style={{ color: customization.textColor }}
              >
                Powered by <span className="font-semibold">AgenStack.ai</span>
              </a>
              <p className="text-xs opacity-40 mt-1" style={{ color: customization.textColor }}>
                Remove branding on Business & Enterprise plans
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;

