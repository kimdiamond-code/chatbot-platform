import React, { useState } from 'react';
import TestComponent from './components/TestComponent';
import Dashboard from './components/Dashboard';
import BotBuilder from './components/BotBuilder';
import LiveChat from './components/LiveChat';
import Analytics from './components/Analytics';
import Customers from './components/Customers';
import Integrations from './components/Integrations';
import Settings from './components/Settings';

const App = () => {
  const [activeTab, setActiveTab] = useState('test'); // Start with test component
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigation = [
    { id: 'test', name: 'Test Status', icon: '🧪', component: TestComponent },
    { id: 'dashboard', name: 'Dashboard', icon: '📊', component: Dashboard },
    { id: 'botbuilder', name: 'Bot Builder', icon: '🤖', component: BotBuilder },
    { id: 'livechat', name: 'Live Chat', icon: '💬', component: LiveChat },
    { id: 'analytics', name: 'Analytics', icon: '📈', component: Analytics },
    { id: 'customers', name: 'Customers', icon: '👥', component: Customers },
    { id: 'integrations', name: 'Integrations', icon: '🔗', component: Integrations },
    { id: 'settings', name: 'Settings', icon: '⚙️', component: Settings },
  ];

  const ActiveComponent = navigation.find(nav => nav.id === activeTab)?.component || TestComponent;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <h1 className="text-xl font-bold text-gray-900">ChatBot Platform</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? '👉' : '👈'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigation.find(nav => nav.id === activeTab)?.name || 'Test Status'}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'test' && 'Verify that the platform is working correctly'}
                {activeTab === 'dashboard' && 'Welcome to your chatbot management platform'}
                {activeTab === 'botbuilder' && 'Configure and customize your chatbot'}
                {activeTab === 'livechat' && 'Monitor and manage live conversations'}
                {activeTab === 'analytics' && 'Track performance and insights'}
                {activeTab === 'customers' && 'Manage your customer database'}
                {activeTab === 'integrations' && 'Connect with external services'}
                {activeTab === 'settings' && 'Platform configuration and preferences'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                🔔
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                ❓
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default App;