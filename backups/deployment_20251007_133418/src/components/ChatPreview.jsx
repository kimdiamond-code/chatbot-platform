import React, { useState, useEffect } from 'react';
import { chatBotService } from '../services/openaiService.js';

const ChatPreview = ({ botConfig, onSaveTraining }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

  const sendPreviewMessage = async () => {
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
    if (e.key === 'Enter' && !isTyping && newMessage.trim()) {
      sendPreviewMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{botConfig.avatar}</span>
          <div>
            <h3 className="font-semibold">{botConfig.name}</h3>
            <p className="text-xs opacity-90">Live Preview</p>
          </div>
        </div>
        <button 
          onClick={clearPreviewChat}
          className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg text-sm"
        >
          🔄 Clear
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white rounded-br-sm' 
                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-2 rounded-lg rounded-bl-sm shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Test your bot..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isTyping}
          />
          <button
            onClick={sendPreviewMessage}
            disabled={!newMessage.trim() || isTyping}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
