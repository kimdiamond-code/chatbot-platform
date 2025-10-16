import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Icon Components
const MessageCircle = () => <span className="text-xl">💬</span>;
const Send = () => <span className="text-xl">📤</span>;
const Phone = () => <span className="text-xl">📱</span>;
const Settings = () => <span className="text-xl">⚙️</span>;
const User = () => <span className="text-xl">👤</span>;
const Clock = () => <span className="text-xl">🕐</span>;
const CheckCircle = () => <span className="text-xl">✅</span>;
const AlertCircle = () => <span className="text-xl">⚠️</span>;

const SMSAgent = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [smsConfig, setSmsConfig] = useState({
    enabled: false,
    provider: 'twilio',
    phoneNumber: '',
    autoReply: true,
    businessHours: {
      enabled: false,
      timezone: 'UTC',
      start: '09:00',
      end: '17:00'
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSMSConfig();
    loadConversations();
  }, []);

  const loadSMSConfig = async () => {
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        if (settings.smsAgent) {
          setSmsConfig(settings.smsAgent);
        }
      }
    } catch (error) {
      console.error('Error loading SMS config:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        setConversations(settings.smsConversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveSMSConfig = async () => {
    setSaveStatus('saving');
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        settings.smsAgent = smsConfig;
        settings.smsConversations = conversations;
        
        await dbService.saveBotConfig({
          ...dbConfig,
          settings: JSON.stringify(settings)
        });
        
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Error saving SMS config:', error);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    setIsSending(true);

    const newMessage = {
      id: Date.now(),
      text: messageInput,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Update conversation
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          lastMessageAt: newMessage.timestamp,
          unreadCount: 0
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage]
    });
    setMessageInput('');

    // In production, this would send via Twilio API
    console.log('SMS sent:', newMessage);

    setTimeout(() => {
      setIsSending(false);
    }, 500);

    await saveSMSConfig();
  };

  const markAsRead = (conversationId) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    });
    setConversations(updatedConversations);
    saveSMSConfig();
  };

  const formatPhoneNumber = (phone) => {
    // Format: (123) 456-7890
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'text-green-600';
      case 'delivered': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle /> SMS Conversations
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Settings"
            >
              <Settings />
            </button>
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
            smsConfig.enabled 
              ? 'bg-green-50 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              smsConfig.enabled ? 'bg-green-600 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {smsConfig.enabled ? 'SMS Active' : 'SMS Inactive'}
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle />
              <p className="text-gray-600 mt-2 text-sm">
                No SMS conversations yet
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Configure SMS settings to start
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    markAsRead(conv.id);
                  }}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <User />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {conv.customerName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatPhoneNumber(conv.phoneNumber)}
                        </div>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock />
                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {showSettings ? (
          /* Settings Panel */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">SMS Agent Settings</h2>
              
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                {/* Enable/Disable */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <h3 className="font-semibold text-gray-900">Enable SMS Agent</h3>
                      <p className="text-sm text-gray-600">Allow customers to reach you via SMS</p>
                    </div>
                    <button
                      onClick={() => setSmsConfig({ ...smsConfig, enabled: !smsConfig.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        smsConfig.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          smsConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Provider
                  </label>
                  <select
                    value={smsConfig.provider}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="messagebird">MessageBird</option>
                    <option value="plivo">Plivo</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone Number
                  </label>
                  <input
                    type="tel"
                    value={smsConfig.phoneNumber}
                    onChange={(e) => setSmsConfig({ ...smsConfig, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This number will be used to send and receive SMS
                  </p>
                </div>

                {/* Auto Reply */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <h3 className="font-semibold text-gray-900">Auto Reply</h3>
                      <p className="text-sm text-gray-600">Automatically respond to incoming messages</p>
                    </div>
                    <button
                      onClick={() => setSmsConfig({ ...smsConfig, autoReply: !smsConfig.autoReply })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        smsConfig.autoReply ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          smsConfig.autoReply ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Business Hours */}
                <div>
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={smsConfig.businessHours.enabled}
                      onChange={(e) => setSmsConfig({
                        ...smsConfig,
                        businessHours: { ...smsConfig.businessHours, enabled: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="font-semibold text-gray-900">Enable Business Hours</span>
                  </label>

                  {smsConfig.businessHours.enabled && (
                    <div className="grid grid-cols-3 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timezone
                        </label>
                        <select
                          value={smsConfig.businessHours.timezone}
                          onChange={(e) => setSmsConfig({
                            ...smsConfig,
                            businessHours: { ...smsConfig.businessHours, timezone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern</option>
                          <option value="America/Chicago">Central</option>
                          <option value="America/Denver">Mountain</option>
                          <option value="America/Los_Angeles">Pacific</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={smsConfig.businessHours.start}
                          onChange={(e) => setSmsConfig({
                            ...smsConfig,
                            businessHours: { ...smsConfig.businessHours, start: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={smsConfig.businessHours.end}
                          onChange={(e) => setSmsConfig({
                            ...smsConfig,
                            businessHours: { ...smsConfig.businessHours, end: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Integration Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle /> Integration Setup Required
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">
                    To use SMS functionality, you need to configure your Twilio account:
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Sign up for a Twilio account</li>
                    <li>Get your Account SID and Auth Token</li>
                    <li>Purchase a phone number</li>
                    <li>Add credentials to your .env file</li>
                  </ol>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveSMSConfig}
                  disabled={saveStatus === 'saving'}
                  className={`w-full px-4 py-3 rounded-lg font-medium ${
                    saveStatus === 'saved' ? 'bg-green-600 text-white' :
                    saveStatus === 'error' ? 'bg-red-600 text-white' :
                    saveStatus === 'saving' ? 'bg-blue-400 text-white cursor-not-allowed' :
                    'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saveStatus === 'saved' ? '✅ Saved!' : 
                   saveStatus === 'error' ? '❌ Error' :
                   saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        ) : selectedConversation ? (
          /* Chat Interface */
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                    <User />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.customerName || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatPhoneNumber(selectedConversation.phoneNumber)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Settings />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'agent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <div className={`flex items-center gap-1 text-xs mt-1 ${
                      msg.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {msg.sender === 'agent' && (
                        <span className={getStatusColor(msg.status)}>
                          • {msg.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isSending}
                />
                <button
                  onClick={sendMessage}
                  disabled={isSending || !messageInput.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send /> Send
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle />
              <h3 className="text-xl font-semibold text-gray-900 mt-4">
                Select a conversation
              </h3>
              <p className="text-gray-600 mt-2">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSAgent;
