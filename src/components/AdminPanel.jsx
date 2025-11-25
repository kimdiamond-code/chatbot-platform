import React, { useState } from 'react';
import { Shield, Key, Code, Webhook, Settings, Users, Lock, AlertTriangle, Plug } from 'lucide-react';
import rbacService, { PERMISSIONS } from '../services/rbacService';

/**
 * Admin Panel - Admin/Developer Only Access
 * Consolidates all sensitive features in one secure location
 */
const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Security check - only admins and developers can access
  if (!rbacService.isAdminOrDeveloper()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Admin Panel.
          </p>
          <p className="text-sm text-gray-500">
            This area is restricted to Administrators and Developers only.
          </p>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      id: 'overview',
      name: 'Overview',
      icon: Shield,
      color: 'blue',
      description: 'Admin panel dashboard'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      icon: Plug,
      color: 'emerald',
      description: 'Configure organization-level integrations',
      adminOnly: rbacService.isAdmin()
    },
    {
      id: 'crm',
      name: 'CRM',
      icon: Users,
      color: 'cyan',
      description: 'Customer relationship management',
      adminOnly: true
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce',
      icon: Settings,
      color: 'rose',
      description: 'Product support and order management',
      adminOnly: true
    },
    {
      id: 'multichannel',
      name: 'Multi-Channel',
      icon: Settings,
      color: 'violet',
      description: 'Messaging channels configuration',
      adminOnly: true
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      icon: Webhook,
      color: 'purple',
      description: 'Webhook configuration and management',
      adminOnly: rbacService.hasPermission(PERMISSIONS.MANAGE_WEBHOOKS)
    },
    {
      id: 'api-keys',
      name: 'API Keys',
      icon: Key,
      color: 'green',
      description: 'API credentials and tokens',
      adminOnly: rbacService.hasPermission(PERMISSIONS.VIEW_API_KEYS)
    },
    {
      id: 'widget-code',
      name: 'Widget Code',
      icon: Code,
      color: 'orange',
      description: 'Raw widget implementation code',
      adminOnly: rbacService.hasPermission(PERMISSIONS.EDIT_WIDGET_CODE)
    },
    {
      id: 'security',
      name: 'Security Settings',
      icon: Lock,
      color: 'red',
      description: 'Security and compliance configuration',
      adminOnly: rbacService.hasPermission(PERMISSIONS.MANAGE_SECURITY)
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      color: 'indigo',
      description: 'Manage user accounts and roles',
      adminOnly: rbacService.isAdmin()
    }
  ].filter(section => section.adminOnly !== false);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      emerald: 'bg-emerald-500 hover:bg-emerald-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      green: 'bg-green-500 hover:bg-green-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      red: 'bg-red-500 hover:bg-red-600',
      indigo: 'bg-indigo-500 hover:bg-indigo-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-red-100 text-sm">
                {rbacService.isAdmin() ? 'Administrator' : 'Developer'} Access Only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Warning Banner */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">
              Restricted Area: Handle sensitive information with care
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              All actions in this panel are logged for security purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeSection === 'overview' ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSections.filter(s => s.id !== 'overview').map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 text-left group"
                  >
                    <div className={`w-12 h-12 rounded-lg ${getColorClasses(section.color)} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{section.name}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                    <div className="mt-4 text-sm text-blue-600 font-medium">
                      Configure →
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Active Webhooks</div>
                <div className="text-2xl font-bold text-gray-900">3</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">API Keys</div>
                <div className="text-2xl font-bold text-gray-900">5</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Security Logs</div>
                <div className="text-2xl font-bold text-gray-900">127</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-2xl font-bold text-gray-900">12</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setActiveSection('overview')}
              className="mb-6 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
            >
              <span>← Back to Overview</span>
            </button>

            {/* Section Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {activeSection === 'integrations' && <IntegrationsAdminSection />}
              {activeSection === 'crm' && <CRMSection />}
              {activeSection === 'ecommerce' && <ECommerceSection />}
              {activeSection === 'multichannel' && <MultiChannelSection />}
              {activeSection === 'webhooks' && <WebhooksSection />}
              {activeSection === 'api-keys' && <APIKeysSection />}
              {activeSection === 'widget-code' && <WidgetCodeSection />}
              {activeSection === 'security' && <SecuritySection />}
              {activeSection === 'users' && <UsersSection />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// CRM Section
const CRMSection = () => (
  <div>
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
        <Users className="w-5 h-5 text-cyan-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">CRM</h2>
        <p className="text-sm text-gray-600">Customer relationship management</p>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
      <p className="text-sm text-blue-800">
        <strong>Admin Feature:</strong> Full CRM component will be loaded here.
      </p>
    </div>

    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Import full CRMCustomerContext component for complete functionality
      </p>
    </div>
  </div>
);

// E-Commerce Section
const ECommerceSection = () => (
  <div>
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
        <Settings className="w-5 h-5 text-rose-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">E-Commerce</h2>
        <p className="text-sm text-gray-600">Product support and order management</p>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
      <p className="text-sm text-blue-800">
        <strong>Admin Feature:</strong> Full E-Commerce component will be loaded here.
      </p>
    </div>

    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Import full ECommerceSupport component for complete functionality
      </p>
    </div>
  </div>
);

// Multi-Channel Section
const MultiChannelSection = () => (
  <div>
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
        <Settings className="w-5 h-5 text-violet-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Multi-Channel</h2>
        <p className="text-sm text-gray-600">Messaging channels configuration</p>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
      <p className="text-sm text-blue-800">
        <strong>Admin Feature:</strong> Full Multi-Channel component will be loaded here.
      </p>
    </div>

    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Import full MultiChannelSupport component for complete functionality
      </p>
    </div>
  </div>
);

// Webhooks Section
const WebhooksSection = () => (
  <div>
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        <Webhook className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Webhooks</h2>
        <p className="text-sm text-gray-600">Configure webhook endpoints and events</p>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
      <p className="text-sm text-blue-800">
        <strong>Admin Feature:</strong> Webhooks allow external systems to receive real-time notifications.
      </p>
    </div>

    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">New Conversation Webhook</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
        </div>
        <div className="text-sm text-gray-600">
          <div>Endpoint: https://api.example.com/webhooks/conversation</div>
          <div className="mt-1">Events: conversation.created, conversation.updated</div>
        </div>
      </div>

      <button className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors">
        + Add New Webhook
      </button>
    </div>

    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Import full WebhookManagement component for complete functionality
      </p>
    </div>
  </div>
);

// API Keys Section
const APIKeysSection = () => (
  <div>
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
        <Key className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
        <p className="text-sm text-gray-600">Manage API credentials and access tokens</p>
      </div>
    </div>

    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-6">
      <p className="text-sm text-red-800">
        <strong>Security:</strong> API keys are sensitive. Never share them publicly.
      </p>
    </div>

    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">OpenAI API Key</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Connected</span>
        </div>
        <div className="text-sm text-gray-600 font-mono">
          sk-...••••••••••••••••••••1234
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Shopify API Credentials</h3>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Connected</span>
        </div>
        <div className="text-sm text-gray-600">
          Store: example-store.myshopify.com
        </div>
      </div>

      <button className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
        + Add New Integration
      </button>
    </div>

    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Import full Integrations component for complete functionality
      </p>
    </div>
  </div>
);

// Widget Code Section
const WidgetCodeSection = () => {
  const [copied, setCopied] = useState(false);

  const widgetCode = `<!-- AgenStack Chatbot Widget - Advanced Configuration -->
<script>
  window.AgenStackConfig = {
    organizationId: 'YOUR_ORG_ID',
    botId: 'YOUR_BOT_ID',
    theme: {
      primaryColor: '#3B82F6',
      position: 'bottom-right',
      greeting: 'Hello! How can I help you today?'
    },
    behavior: {
      autoOpen: false,
      showOnDelay: 5000,
      proactiveMessages: true
    }
  };
</script>
<script src="https://chatbot-platform-v2.vercel.app/widget.js" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Code className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Widget Code</h2>
          <p className="text-sm text-gray-600">Raw implementation code with advanced options</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Admin Feature:</strong> This is the raw widget code. Regular users see a simplified button interface.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Widget Implementation Code
          </label>
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
              <code>{widgetCode}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Configuration Options</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• organizationId: Your organization ID</li>
              <li>• botId: Specific bot configuration</li>
              <li>• theme: Colors, position, greeting</li>
              <li>• behavior: Auto-open, delays, proactive</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Advanced Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Custom CSS injection</li>
              <li>• Event callbacks</li>
              <li>• API hooks</li>
              <li>• Custom branding</li>
            </ul>
          </div>
        </div>

        <button className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors">
          Advanced Widget Settings
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Import full WidgetStudio component for complete customization options
        </p>
      </div>
    </div>
  );
};

// Security Section
const SecuritySection = () => (
  <div>
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
        <Lock className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
        <p className="text-sm text-gray-600">Security and compliance configuration</p>
      </div>
    </div>

    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">GDPR Compliance</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Data retention policy</span>
          <span className="text-sm font-medium text-green-600">Enabled</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Data at rest encryption</span>
          <span className="text-sm font-medium text-green-600">AES-256</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Access Logs</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Audit logging</span>
          <span className="text-sm font-medium text-green-600">Active</span>
        </div>
      </div>
    </div>

    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">
        Import full SecurityCompliance component for complete functionality
      </p>
    </div>
  </div>
);

// Users Section
const UsersSection = () => {
  if (!rbacService.isAdmin()) {
    return (
      <div className="text-center py-8">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Administrator access required</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600">Manage user accounts and roles</p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Admin Only:</strong> Only administrators can create, edit, and delete users.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">admin@chatbot.com</h3>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">Admin</span>
          </div>
        </div>

        <button className="w-full bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition-colors">
          + Add New User
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Import full UserManagement component for complete functionality
        </p>
      </div>
    </div>
  );
};

// Integrations Admin Section
const IntegrationsAdminSection = () => {
  const [showShopifyConfig, setShowShopifyConfig] = useState(false);
  const [showKlaviyoConfig, setShowKlaviyoConfig] = useState(false);
  const [showKustomerConfig, setShowKustomerConfig] = useState(false);

  return (
    <div>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Plug className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organization Integrations</h2>
          <p className="text-sm text-gray-600">Configure third-party services for your entire organization</p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Admin Only:</strong> Configure integrations here. Agents will use these connections via OAuth when needed.
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🛒</div>
              <div>
                <h3 className="font-bold text-gray-900">Shopify</h3>
                <p className="text-sm text-gray-600">E-commerce platform</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Disconnected</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connect your organization's Shopify store for product management and order tracking.
          </p>
          <button
            onClick={() => setShowShopifyConfig(true)}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            ⚙️ Configure Shopify
          </button>
        </div>

        {/* Klaviyo */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📧</div>
              <div>
                <h3 className="font-bold text-gray-900">Klaviyo</h3>
                <p className="text-sm text-gray-600">Email marketing</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Disconnected</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connect your organization's Klaviyo account for email automation and customer segmentation.
          </p>
          <button
            onClick={() => setShowKlaviyoConfig(true)}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ⚙️ Configure Klaviyo
          </button>
        </div>

        {/* Kustomer */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">👥</div>
              <div>
                <h3 className="font-bold text-gray-900">Kustomer</h3>
                <p className="text-sm text-gray-600">CRM platform</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Disconnected</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connect your organization's Kustomer account for customer support and ticket management.
          </p>
          <button
            onClick={() => setShowKustomerConfig(true)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ⚙️ Configure Kustomer
          </button>
        </div>

        {/* More integrations placeholder */}
        <div className="border border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">➕</div>
            <p className="text-sm text-gray-600">More integrations coming soon</p>
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">How This Works</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>Admins</strong> configure organization-level integrations here (OAuth setup)</li>
              <li>• <strong>Agents</strong> simply use the integrations - no configuration needed</li>
              <li>• All integration data is stored securely in the database, tied to your organization</li>
              <li>• Agents authenticate via OAuth when they need to access integrated services</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals would go here */}
      {showShopifyConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Configure Shopify (Admin)</h3>
            <p className="text-gray-600 mb-4">Shopify OAuth configuration component will be loaded here.</p>
            <button
              onClick={() => setShowShopifyConfig(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showKlaviyoConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Configure Klaviyo (Admin)</h3>
            <p className="text-gray-600 mb-4">Klaviyo OAuth configuration component will be loaded here.</p>
            <button
              onClick={() => setShowKlaviyoConfig(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showKustomerConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Configure Kustomer (Admin)</h3>
            <p className="text-gray-600 mb-4">Kustomer OAuth configuration component will be loaded here.</p>
            <button
              onClick={() => setShowKustomerConfig(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
