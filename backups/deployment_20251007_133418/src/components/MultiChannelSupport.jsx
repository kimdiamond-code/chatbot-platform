import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Globe, Send, Facebook, Instagram, Smartphone, Settings, CheckCircle, AlertCircle } from 'lucide-react';

const MultiChannelSupport = () => {
  const [channels, setChannels] = useState([
    {
      id: 'web',
      name: 'Web Chat',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      status: 'connected',
      activeConversations: 23,
      totalMessages: 1542,
      avgResponseTime: '2 min',
      config: {
        widgetPosition: 'bottom-right',
        autoGreeting: true,
        offlineMessage: true
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      enabled: true,
      status: 'connected',
      activeConversations: 15,
      totalMessages: 892,
      avgResponseTime: '3 min',
      config: {
        phoneNumber: '+1-555-123-4567',
        businessAccount: 'verified',
        twilioConnected: true
      }
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      icon: <Facebook className="w-5 h-5" />,
      enabled: true,
      status: 'connected',
      activeConversations: 8,
      totalMessages: 456,
      avgResponseTime: '5 min',
      config: {
        pageId: 'your-business-page',
        accessToken: 'configured'
      }
    },
    {
      id: 'instagram',
      name: 'Instagram DM',
      icon: <Instagram className="w-5 h-5" />,
      enabled: false,
      status: 'disconnected',
      activeConversations: 0,
      totalMessages: 0,
      avgResponseTime: '-',
      config: {
        businessAccount: null,
        apiVersion: '17.0'
      }
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <Phone className="w-5 h-5" />,
      enabled: true,
      status: 'connected',
      activeConversations: 5,
      totalMessages: 234,
      avgResponseTime: '1 min',
      config: {
        provider: 'Twilio',
        phoneNumber: '+1-555-987-6543',
        shortCode: '12345'
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      enabled: true,
      status: 'connected',
      activeConversations: 12,
      totalMessages: 789,
      avgResponseTime: '30 min',
      config: {
        supportEmail: 'support@company.com',
        smtpConfigured: true,
        autoResponder: true
      }
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [unifiedInbox, setUnifiedInbox] = useState([
    {
      id: 1,
      channel: 'whatsapp',
      customer: 'Sarah Johnson',
      message: 'Hi, I need help with my recent order',
      timestamp: '5 min ago',
      unread: true
    },
    {
      id: 2,
      channel: 'web',
      customer: 'Mike Chen',
      message: 'Can you tell me about your pricing plans?',
      timestamp: '12 min ago',
      unread: true
    },
    {
      id: 3,
      channel: 'facebook',
      customer: 'Emma Wilson',
      message: 'Is the product available in blue?',
      timestamp: '28 min ago',
      unread: false
    },
    {
      id: 4,
      channel: 'email',
      customer: 'Robert Davis',
      message: 'Request for technical documentation',
      timestamp: '1 hour ago',
      unread: false
    },
    {
      id: 5,
      channel: 'sms',
      customer: '+1-555-0123',
      message: 'STOP',
      timestamp: '2 hours ago',
      unread: false
    }
  ]);

  const [routingRules, setRoutingRules] = useState({
    autoAssign: true,
    priorityRouting: true,
    roundRobin: false,
    skillBasedRouting: true,
    businessHours: {
      enabled: true,
      timezone: 'America/New_York',
      schedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '10:00', end: '14:00' },
        sunday: { closed: true }
      }
    }
  });

  const getChannelIcon = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel ? channel.icon : <MessageCircle className="w-4 h-4" />;
  };

  const toggleChannel = (channelId) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Channel Support</h1>
        <p className="text-gray-600">Manage conversations across all communication channels</p>
      </div>

      {/* Channel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {channels.map(channel => (
          <div 
            key={channel.id} 
            onClick={() => setSelectedChannel(channel)}
            className={`glass-dynamic p-4 rounded-xl hover-3d-tilt cursor-pointer transition-all ${
              selectedChannel?.id === channel.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {channel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {channel.status === 'connected' ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <AlertCircle className="w-3 h-3" /> Disconnected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={channel.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleChannel(channel.id);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Active</span>
                <div className="font-semibold text-gray-900">{channel.activeConversations}</div>
              </div>
              <div>
                <span className="text-gray-500">Total</span>
                <div className="font-semibold text-gray-900">{channel.totalMessages}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Avg Response</span>
                <div className="font-semibold text-gray-900">{channel.avgResponseTime}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unified Inbox */}
        <div className="lg:col-span-2">
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Unified Inbox</h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {unifiedInbox.map(message => (
                <div 
                  key={message.id} 
                  className={`p-4 rounded-lg border ${
                    message.unread 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200'
                  } hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getChannelIcon(message.channel)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">{message.customer}</span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600">{message.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {message.channel}
                        </span>
                        {message.unread && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Reply */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Configuration */}
        <div>
          <div className="glass-premium p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedChannel.name} Settings
            </h2>
            
            <div className="space-y-4">
              {selectedChannel.config && Object.entries(selectedChannel.config).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  {typeof value === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={value}
                        className="w-4 h-4 text-blue-600"
                        readOnly
                      />
                      <span className="text-sm text-gray-600">Enabled</span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={value || ''}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      readOnly
                    />
                  )}
                </div>
              ))}
              
              <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Configure {selectedChannel.name}
              </button>
            </div>
          </div>

          {/* Routing Rules */}
          <div className="glass-premium p-6 rounded-xl mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Routing Rules</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={routingRules.autoAssign}
                  onChange={(e) => setRoutingRules({...routingRules, autoAssign: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Auto-assign to agents</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={routingRules.priorityRouting}
                  onChange={(e) => setRoutingRules({...routingRules, priorityRouting: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Priority routing</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={routingRules.roundRobin}
                  onChange={(e) => setRoutingRules({...routingRules, roundRobin: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Round-robin distribution</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox"
                  checked={routingRules.skillBasedRouting}
                  onChange={(e) => setRoutingRules({...routingRules, skillBasedRouting: e.target.checked})}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Skill-based routing</span>
              </label>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Business Hours</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={routingRules.businessHours.enabled}
                    onChange={(e) => setRoutingRules({
                      ...routingRules, 
                      businessHours: {...routingRules.businessHours, enabled: e.target.checked}
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {routingRules.businessHours.enabled && (
                <div className="text-xs text-gray-600">
                  <p>Mon-Thu: 9:00 AM - 6:00 PM</p>
                  <p>Fri: 9:00 AM - 5:00 PM</p>
                  <p>Sat: 10:00 AM - 2:00 PM</p>
                  <p>Sun: Closed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiChannelSupport;