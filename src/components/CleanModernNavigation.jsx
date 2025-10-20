// Clean Modern Navigation - Professional Design v2.0.11
import React, { useState, useEffect } from 'react';
import AgentStackLogo from './AgentStackLogo.jsx';
import { authService } from '../services/authService';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  BookOpen,
  Plug, 
  TrendingUp,
  Settings,
  Menu,
  X,
  Zap,
  GitBranch,
  FileText,
  MessageCircle,
  Phone,
  HelpCircle,
  PenTool,
  Webhook,
  ShoppingCart,
  Users,
  Shield
} from 'lucide-react';

const CleanModernNavigation = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile,
  realTimeMetrics = {} 
}) => {
  // Enhanced navigation items with professional icons
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      Icon: LayoutDashboard,
      description: 'Analytics & Overview',
      color: 'text-blue-600'
    },
    {
      id: 'botbuilder',
      label: 'Bot Builder',
      Icon: Bot,
      description: 'AI Assistant Setup',
      color: 'text-purple-600'
    },
    {
      id: 'conversations',
      label: 'Conversations',
      Icon: MessageSquare,
      description: 'Chat Management',
      badge: realTimeMetrics.activeChats || 0,
      color: 'text-green-600'
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      Icon: GitBranch,
      description: 'Conversation Flows',
      color: 'text-pink-600'
    },
    {
      id: 'forms',
      label: 'Forms',
      Icon: FileText,
      description: 'Custom Forms',
      color: 'text-emerald-600'
    },
    {
      id: 'proactive',
      label: 'Proactive',
      Icon: Zap,
      description: 'Engagement Triggers',
      color: 'text-yellow-600'
    },
    {
      id: 'crm',
      label: 'CRM',
      Icon: Users,
      description: 'Customer Context',
      color: 'text-cyan-600'
    },
    {
      id: 'ecommerce',
      label: 'E-Commerce',
      Icon: ShoppingCart,
      description: 'Product Support',
      color: 'text-rose-600'
    },
    {
      id: 'multichannel',
      label: 'Channels',
      Icon: MessageCircle,
      description: 'Multi-Channel',
      color: 'text-violet-600'
    },
    {
      id: 'sms',
      label: 'SMS',
      Icon: MessageCircle,
      description: 'SMS Agent',
      color: 'text-lime-600'
    },
    {
      id: 'phone',
      label: 'Phone',
      Icon: Phone,
      description: 'Phone Agent',
      color: 'text-amber-600'
    },
    {
      id: 'faq',
      label: 'FAQ',
      Icon: HelpCircle,
      description: 'Help & Support',
      color: 'text-indigo-600'
    },
    {
      id: 'widget',
      label: 'Widget',
      Icon: PenTool,
      description: 'Widget Studio',
      color: 'text-fuchsia-600'
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      Icon: Webhook,
      description: 'Webhook Management',
      color: 'text-sky-600'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      Icon: TrendingUp,
      description: 'Performance Metrics',
      color: 'text-teal-600'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      Icon: Plug,
      description: 'Connect Services',
      color: 'text-orange-600'
    },
    {
      id: 'security',
      label: 'Security',
      Icon: Shield,
      description: 'Compliance',
      color: 'text-red-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      Icon: Settings,
      description: 'Configuration',
      color: 'text-gray-600'
    }
  ];

  // Enhanced navigation click
  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Container */}
      <div className={`
        ${isMobile ? 'fixed top-0 left-0 h-full z-50' : 'relative'}
        w-80
        transition-all duration-300 ease-in-out
        ${isMobile && !sidebarOpen ? 'transform -translate-x-full' : ''}
      `}>
        <div className="h-full bg-white border-r border-gray-200 shadow-lg flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <AgentStackLogo size={44} />
              
              <div className="flex-1">
                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                agenstack.ai chat
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full p-2 rounded-lg transition-all duration-200 relative group text-left
                  ${activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:scale-102'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <div className="relative flex items-center justify-center">
                    <item.Icon 
                      size={18} 
                      className={`transition-all duration-200 ${
                        activeTab === item.id ? 'text-white' : item.color
                      }`}
                      strokeWidth={activeTab === item.id ? 2.5 : 2}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.label}</p>
                  </div>
                  
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === item.id ? 'bg-white/20' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">User</p>
                  <p className="text-sm text-gray-600">Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Clean Header Component
export const CleanHeader = ({ sidebarOpen, setSidebarOpen, realTimeMetrics = {} }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    window.location.reload(); // Reload to show login page
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.relative')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-b border-blue-100">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 lg:hidden relative group"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {sidebarOpen ? (
                <X size={24} className="text-gray-700" strokeWidth={2} />
              ) : (
                <Menu size={24} className="text-gray-700" strokeWidth={2} />
              )}
              
              {/* Active indicator */}
              {sidebarOpen && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </button>
            
            <div className="hidden md:flex items-center space-x-3 text-sm">
              <span className="text-gray-600 font-medium">
                {realTimeMetrics.activeChats || 0} active conversations
              </span>
            </div>
          </div>

          {/* Center Section */}
          <div className="hidden lg:flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-lg">🕐</span>
            <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <span>📊</span>
                <span className="font-bold">{realTimeMetrics.satisfaction?.toFixed(1) || '4.6'} ★</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <span>⚡</span>
                <span className="font-bold">{Math.floor((realTimeMetrics.avgResponseTime || 120) / 60)}m</span>
              </div>
            </div>

            {/* User Avatar with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-gray-900 text-sm">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-600">{currentUser?.role || 'Agent'}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <span className="text-xl">{currentUser?.role === 'admin' ? '👑' : '👤'}</span>
                </div>
              </button>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{currentUser?.name}</p>
                    <p className="text-sm text-gray-600">{currentUser?.email}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      currentUser?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {currentUser?.role}
                    </span>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="md:hidden mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {realTimeMetrics.activeChats || 0} conversations
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {realTimeMetrics.satisfaction?.toFixed(1) || '4.6'}★
            </span>
          </div>
          <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default CleanModernNavigation;