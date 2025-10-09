// Enhanced Test Chat Component - AI-Powered Automated Responses
import React, { useState, useEffect } from 'react';
import simpleAiResponseManager from '../../services/simpleAiResponseManager';

const TestChat = ({ botConfig, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      content: botConfig?.greeting || 'Hello! I\'m your AI assistant powered by advanced automated responses. How can I help you today?', 
      sender: 'bot',
      timestamp: new Date(),
      confidence: 1.0,
      source: 'greeting'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(`test-${Date.now()}`);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [aiAnalytics, setAiAnalytics] = useState(null);

  // Initialize AI system when component mounts
  useEffect(() => {
    if (isOpen && botConfig) {
      // Initialize AI Response Manager with bot configuration
      console.log('🤖 Initializing Simple AI Response System...');
      initializeAISystem();
    }
  }, [isOpen, botConfig]);

  const initializeAISystem = async () => {
    try {
      // Set up knowledge base if available
      if (botConfig.knowledgeBase && botConfig.knowledgeBase.length > 0) {
        console.log('📚 Setting up knowledge base with', botConfig.knowledgeBase.length, 'items');
        // Knowledge base is automatically handled by simpleAiResponseManager
      }
      
      // Initialize conversation
      const analytics = simpleAiResponseManager.getConversationAnalytics(conversationId);
      setAiAnalytics(analytics);
      
      console.log('✅ AI Response System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI system:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('🤖 Sending message to AI Response Manager...');
      
      // Generate AI-powered automated response
      const aiResponse = await simpleAiResponseManager.generateAutomatedResponse(
        userInput,
        conversationId,
        {
          customerName: null, // Could be extracted from context
          customerEmail: null,
          organizationId: 'test-org'
        }
      );
      
      console.log('🎉 AI Response received:', aiResponse);
      
      // Simulate response delay based on bot config
      const delay = botConfig?.responseDelay || 1500;
      
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          content: aiResponse.response,
          sender: 'bot',
          timestamp: new Date(),
          confidence: aiResponse.confidence,
          source: aiResponse.source,
          shouldEscalate: aiResponse.shouldEscalate,
          suggestions: aiResponse.suggestions,
          knowledgeUsed: aiResponse.knowledgeUsed,
          knowledgeSources: aiResponse.knowledgeSources,
          flowName: aiResponse.flowName,
          intent: aiResponse.intent,
          sentiment: aiResponse.sentiment
        };

        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        
        // Update analytics
        const updatedAnalytics = simpleAiResponseManager.getConversationAnalytics(conversationId);
        setAiAnalytics(updatedAnalytics);
      }, delay);
      
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      
      // Fallback response
      setTimeout(() => {
        const fallbackResponse = {
          id: Date.now() + 1,
          content: "I apologize, but I'm having trouble processing your request right now. Could you please try again?",
          sender: 'bot',
          timestamp: new Date(),
          confidence: 0.1,
          source: 'error_fallback'
        };

        setMessages(prev => [...prev, fallbackResponse]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {botConfig?.avatar || '🤖'}
            </div>
            <div>
              <h3 className="font-semibold">{botConfig?.name || 'ChatBot'}</h3>
              <p className="text-xs text-gray-500">Test Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg relative ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  
                  {/* AI Response Metadata */}
                  {message.sender === 'bot' && message.confidence && (
                    <div className="mt-2 text-xs opacity-75">
                      {message.source && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span>AI: {message.source}</span>
                          <span className="ml-1 font-mono">({Math.round(message.confidence * 100)}%)</span>
                        </div>
                      )}
                      
                      {message.knowledgeUsed && message.knowledgeSources && (
                        <div className="text-xs text-blue-600">
                          📚 Used: {message.knowledgeSources.slice(0, 2).join(', ')}
                        </div>
                      )}
                      
                      {message.shouldEscalate && (
                        <div className="text-xs text-orange-600 font-semibold">
                          🚨 Escalation Suggested
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Follow-up Suggestions */}
                  {message.sender === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium">Quick actions:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInputValue(suggestion)}
                            className="bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-blue-700 text-xs px-2 py-1 rounded transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 text-xs text-gray-500">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">🤖 AI Response System</span>
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
            </button>
          </div>
          
          {showDebugInfo && (
            <div className="space-y-2 p-2 bg-gray-50 rounded text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">Bot Configuration:</p>
                  <p>Name: {botConfig?.name}</p>
                  <p>Q&A Entries: {Array.isArray(botConfig?.qaDatabase) ? botConfig.qaDatabase.filter(qa => qa.enabled).length : 0} active</p>
                  <p>Knowledge Items: {Array.isArray(botConfig?.knowledgeBase) ? botConfig.knowledgeBase.length : 0}</p>
                  <p>Total Chunks: {Array.isArray(botConfig?.knowledgeBase) ? botConfig.knowledgeBase.reduce((total, item) => total + (item.chunkCount || 0), 0) : 0}</p>
                  <p>Response Delay: {botConfig?.responseDelay}ms</p>
                </div>
                
                <div>
                  <p className="font-semibold text-gray-700">AI Analytics:</p>
                  {aiAnalytics ? (
                    <div>
                      <p>Messages: {aiAnalytics.messageCount}</p>
                      <p>Session Duration: {Math.round((Date.now() - aiAnalytics.startTime) / 1000)}s</p>
                      <p>Topics: {aiAnalytics.topics?.join(', ') || 'None'}</p>
                      <p>Intents: {aiAnalytics.intents?.slice(-3).join(', ') || 'None'}</p>
                      <p>Escalation Attempts: {aiAnalytics.escalationAttempts || 0}</p>
                      {aiAnalytics.aiResponses && aiAnalytics.aiResponses.length > 0 && (
                        <p>Avg Confidence: {Math.round(aiAnalytics.aiResponses.reduce((sum, r) => sum + r.confidence, 0) / aiAnalytics.aiResponses.length * 100)}%</p>
                      )}
                    </div>
                  ) : (
                    <p>No analytics available</p>
                  )}
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-gray-700">AI Features Active:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Intent Classification</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Sentiment Analysis</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Entity Extraction</span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Urgency Detection</span>
                  <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded">Knowledge Search</span>
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Flow Automation</span>
                </div>
              </div>
              
              {Array.isArray(botConfig?.knowledgeBase) && botConfig.knowledgeBase.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700">Knowledge Base:</p>
                  {botConfig.knowledgeBase.map((item, idx) => (
                    <p key={idx} className="ml-2">• {item.name} ({item.chunkCount || 0} chunks)</p>
                  ))}
                </div>
              )}
              
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="font-semibold text-gray-700">Test Scenarios:</p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <button 
                    onClick={() => setInputValue('I need urgent help!')}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-left"
                  >
                    🚨 High Urgency
                  </button>
                  <button 
                    onClick={() => setInputValue('I want to speak to a human')}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded text-left"
                  >
                    👤 Escalation
                  </button>
                  <button 
                    onClick={() => setInputValue('This is terrible service!')}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-left"
                  >
                    😠 Negative Sentiment
                  </button>
                  <button 
                    onClick={() => setInputValue('What are your business hours?')}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-left"
                  >
                    ❓ Q&A Test
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestChat;