import React, { useState, useEffect } from 'react';
import { chatBotService } from '../services/openaiService.js';

const ChatPreview = ({ botConfig, onSaveTraining }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
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
      const botResult = await chatBotService.generateResponse(
        userInput,
        'bot-builder-preview',
        {
          systemPrompt: botConfig.systemPrompt,
          name: botConfig.name,
          tone: botConfig.tone
        }
      );
      
      const botMsg = {
        id: Date.now() + 1,
        content: botResult.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        metadata: {
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

  return (
    <div 
      className={`h-full flex flex-col ${borderRadiusMap[customization.borderRadius]} shadow-lg border border-gray-200 overflow-hidden`}
      style={{ 
        backgroundColor: customization.backgroundColor,
        fontFamily: customization.fontFamily
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-200 text-white relative"
        style={{ 
          background: `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`
        }}
      >
        <div className="flex items-center gap-3">
          {customization.logo ? (
            <img 
              src={customization.logo} 
              alt="Logo" 
              className="w-10 h-10 rounded-full object-cover bg-white p-1"
            />
          ) : (
            <span className="text-3xl">{botConfig.avatar}</span>
          )}
          <div>
            <h3 className="font-semibold">{customization.brandName || botConfig.name}</h3>
            <p className="text-xs opacity-90">Online • Live Preview</p>
          </div>
        </div>
        <button 
          onClick={clearPreviewChat}
          className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg text-xs"
        >
          🔄 Clear
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-xs px-4 py-2 ${borderRadiusMap[customization.borderRadius]} ${fontSizeMap[customization.fontSize]} ${
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
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div 
              className={`px-4 py-2 ${borderRadiusMap[customization.borderRadius]} rounded-bl-sm shadow-sm`}
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Test your bot..."
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
        
        {/* Branding */}
        {customization.showBranding && (
          <div className="mt-3 text-center">
            <p className="text-xs opacity-50" style={{ color: customization.textColor }}>
              Powered by {customization.brandName || 'ChatBot Platform'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPreview;
