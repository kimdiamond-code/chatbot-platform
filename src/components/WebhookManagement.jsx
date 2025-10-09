import React, { useState } from 'react';
import { Webhook, Plus, Copy, Trash2, Edit, CheckCircle, AlertCircle, Send, Clock, Activity } from 'lucide-react';

const WebhookManagement = () => {
  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: 'Zapier - New Lead',
      url: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
      events: ['new_conversation', 'lead_captured'],
      status: 'active',
      lastTriggered: '2 hours ago',
      successRate: 98,
      totalCalls: 1542
    },
    {
      id: 2,
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
      events: ['high_priority_chat', 'agent_offline'],
      status: 'active',
      lastTriggered: '5 minutes ago',
      successRate: 100,
      totalCalls: 892
    }
  ]);

  const [showAddWebhook, setShowAddWebhook] = useState(false);
  
  const availableEvents = [
    { id: 'new_conversation', name: 'New Conversation Started', category: 'Conversations' },
    { id: 'conversation_ended', name: 'Conversation Ended', category: 'Conversations' },
    { id: 'message_sent', name: 'Message Sent', category: 'Messages' },
    { id: 'message_received', name: 'Message Received', category: 'Messages' },
    { id: 'lead_captured', name: 'Lead Captured', category: 'Leads' },
    { id: 'lead_qualified', name: 'Lead Qualified', category: 'Leads' },
    { id: 'customer_created', name: 'Customer Created', category: 'Customers' },
    { id: 'customer_updated', name: 'Customer Updated', category: 'Customers' },
    { id: 'high_priority_chat', name: 'High Priority Chat', category: 'Alerts' },
    { id: 'agent_offline', name: 'All Agents Offline', category: 'Alerts' },
    { id: 'cart_abandoned', name: 'Cart Abandoned', category: 'E-Commerce' },
    { id: 'purchase_completed', name: 'Purchase Completed', category: 'E-Commerce' },
    { id: 'bot_handoff', name: 'Bot to Human Handoff', category: 'Routing' },
    { id: 'satisfaction_survey', name: 'Satisfaction Survey Completed', category: 'Feedback' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook Management</h1>
        <p className="text-gray-600">Connect your chatbot to Zapier and external services</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Webhook className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Active Webhooks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {webhooks.filter(w => w.status === 'active').length}
          </div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Calls Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">3,001</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">97.8%</div>
        </div>
        
        <div className="glass-dynamic p-6 rounded-xl hover-3d-tilt">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Avg Response</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">156ms</div>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="glass-premium p-6 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Configured Webhooks</h2>
          <button 
            onClick={() => setShowAddWebhook(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Webhook
          </button>
        </div>

        <div className="space-y-4">
          {webhooks.map(webhook => (
            <div key={webhook.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      webhook.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {webhook.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3 font-mono bg-gray-50 p-2 rounded">
                    {webhook.url}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {event.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Last Triggered</span>
                      <div className="font-medium">{webhook.lastTriggered}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate</span>
                      <div className="font-medium text-green-600">{webhook.successRate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Calls</span>
                      <div className="font-medium">{webhook.totalCalls.toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                        Test
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Payload */}
      <div className="glass-premium p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Webhook Payload</h2>
        <p className="text-sm text-gray-600 mb-4">Example JSON payload sent to your webhook endpoint:</p>
        
        <div className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{JSON.stringify({
              event: 'new_conversation',
              timestamp: '2024-03-20T14:23:45Z',
              data: {
                conversation_id: 'conv_123456',
                customer: {
                  id: 'cust_789',
                  name: 'John Doe',
                  email: 'john@example.com',
                  phone: '+1-555-0123'
                },
                channel: 'web',
                initial_message: 'Hi, I need help with my order',
                bot_response: 'Hello! I\'d be happy to help you with your order.',
                metadata: {
                  page_url: 'https://example.com/products',
                  user_agent: 'Mozilla/5.0...',
                  ip_address: '192.168.1.1'
                }
              }
            }, null, 2)}</code>
          </pre>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Zapier Integration:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Create a Zap with "Webhooks by Zapier" as trigger</li>
            <li>Choose "Catch Hook" as the trigger event</li>
            <li>Copy the webhook URL provided by Zapier</li>
            <li>Paste it here and select the events you want to trigger</li>
            <li>Test the webhook to verify it's working</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WebhookManagement;