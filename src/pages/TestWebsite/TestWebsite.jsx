import React, { useState, useEffect, useRef } from 'react';
import { chatBotService } from '../../services/openaiService';

const Globe = () => <span className="text-xl">🌐</span>;
const Play = () => <span className="text-xl">▶️</span>;
const MessageSquare = () => <span className="text-xl">💬</span>;
const Settings = () => <span className="text-xl">⚙️</span>;
const Send = () => <span className="text-xl">📤</span>;
const Bot = () => <span className="text-xl">🤖</span>;
const X = () => <span className="text-xl">✕</span>;

const TestWebsite = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Widget customization
  const [widgetConfig, setWidgetConfig] = useState({
    position: 'bottom-right',
    primaryColor: '#2563eb',
    botName: 'Support Bot',
    greeting: 'Hi! How can I help you today?',
    avatar: '🤖'
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const startSimulation = () => {
    if (!websiteUrl.trim()) {
      alert('Please enter a website URL');
      return;
    }
    setIsSimulating(true);
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: widgetConfig.greeting,
        timestamp: new Date()
      }
    ]);
    setTimeout(() => setIsChatOpen(true), 1000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setIsChatOpen(false);
    setMessages([]);
    setInputMessage('');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatBotService.chat(inputMessage, messages.map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      })));

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPositionClasses = () => {
    switch (widgetConfig.position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <Globe />
          <h1 className="text-3xl font-bold text-gray-900">Test Website Simulator</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Try your chatbot on a simulated website before deploying it live. Enter any website URL to see how your bot will appear and interact with visitors.
        </p>
      </div>

      {/* Configuration Panel */}
      {!isSimulating && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Website URL Input */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe /> Website URL
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Enter Website URL
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is just for visualization - any URL will work
                </p>
              </div>

              <button
                onClick={startSimulation}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Play /> Start Simulation
              </button>
            </div>
          </div>

          {/* Widget Customization */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings /> Widget Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Position
                </label>
                <select
                  value={widgetConfig.position}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={widgetConfig.botName}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, botName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Support Bot"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={widgetConfig.primaryColor}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Greeting Message
                </label>
                <textarea
                  value={widgetConfig.greeting}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, greeting: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Hi! How can I help you today?"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulation View */}
      {isSimulating && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Mock Browser Header */}
          <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600 flex items-center gap-2">
              <span>🔒</span> {websiteUrl || 'https://example.com'}
            </div>
            <button
              onClick={stopSimulation}
              className="px-4 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
            >
              Stop Simulation
            </button>
          </div>

          {/* Mock Website Content */}
          <div className="relative h-[600px] bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
            {/* Placeholder Website Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-6xl mb-4">🌐</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Website</h2>
                <p className="text-gray-600 max-w-md">
                  This is a simulation of your website. The chatbot widget appears in the {widgetConfig.position.replace('-', ' ')} corner.
                </p>
              </div>
            </div>

            {/* Chatbot Widget */}
            <div className={`fixed ${getPositionClasses()} z-50`}>
              {/* Chat Button */}
              {!isChatOpen && (
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center text-2xl"
                  style={{ backgroundColor: widgetConfig.primaryColor }}
                >
                  <MessageSquare />
                </button>
              )}

              {/* Chat Window */}
              {isChatOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-[380px] h-[600px] flex flex-col border border-gray-200">
                  {/* Chat Header */}
                  <div
                    className="px-4 py-3 rounded-t-2xl flex items-center justify-between"
                    style={{ backgroundColor: widgetConfig.primaryColor }}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-2xl">{widgetConfig.avatar}</span>
                      <div>
                        <div className="font-bold">{widgetConfig.botName}</div>
                        <div className="text-xs opacity-90">Online</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChatOpen(false)}
                      className="text-white hover:bg-white/20 rounded p-1"
                    >
                      <X />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-none">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="px-4 py-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: widgetConfig.primaryColor }}
                      >
                        <Send />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isSimulating && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <MessageSquare /> How It Works
          </h3>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Enter your website URL (any URL works for testing)</li>
            <li>Customize your widget appearance and position</li>
            <li>Click "Start Simulation" to see your bot in action</li>
            <li>Test conversations just like your customers would</li>
            <li>When satisfied, deploy the bot to your live website</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default TestWebsite;
