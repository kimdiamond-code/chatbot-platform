// ✅ MODERN: Sleek Navigation Component with Contemporary Design
// This component provides a beautiful, responsive navigation system with modern styling

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  Plug, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const ModernNavigation = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile,
  realTimeMetrics = {} 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Navigation items with modern icons and descriptions
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      Icon: LayoutDashboard,
      description: 'Analytics & Insights',
      color: 'from-blue-500 to-cyan-500',
      badge: null
    },
    {
      id: 'botbuilder',
      label: 'Bot Builder',
      Icon: Bot,
      description: 'Configure AI Assistant',
      color: 'from-purple-500 to-pink-500',
      badge: 'AI'
    },
    {
      id: 'livechat',
      label: 'Live Chat',
      Icon: MessageSquare,
      description: 'Real-time Conversations',
      color: 'from-green-500 to-emerald-500',
      badge: realTimeMetrics.activeChats || 0
    },
    {
      id: 'integrations',
      label: 'Integrations',
      Icon: Plug,
      description: 'Connect Services',
      color: 'from-orange-500 to-red-500',
      badge: 'NEW'
    },
    {
      id: 'settings',
      label: 'Settings',
      Icon: Settings,
      description: 'Platform Configuration',
      color: 'from-gray-500 to-slate-500',
      badge: null
    }
  ];

  // Handle sidebar toggle with animation
  const handleToggle = () => {
    setIsAnimating(true);
    setSidebarOpen(!sidebarOpen);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Handle navigation item click
  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Modern Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed left-0 top-0 h-full w-80 transform transition-all duration-300 ease-out z-50 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300 ease-out`
      } bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl flex flex-col relative overflow-hidden`}>
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="modernGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" className="animate-pulse" />
                <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#modernGrid)" />
          </svg>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 relative">
          <div className="flex items-center space-x-4">
            {/* Modern Logo */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <span className="text-white text-xl font-bold">◆</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            {(sidebarOpen || isMobile) && (
              <div className="flex-1">
                <h1 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  agenstack.ai chat
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-500 font-medium">v2.0</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg scale-105'
                    : 'hover:bg-white/50 hover:shadow-md hover:scale-102 text-gray-700'
                }`}
              >
                {/* Animated Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative p-4 flex items-center space-x-4">
                  {/* Modern Icon */}
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${
                    (sidebarOpen || isMobile) ? 'w-10 h-10' : 'w-8 h-8'
                  }`}>
                    <item.Icon 
                      size={(sidebarOpen || isMobile) ? 24 : 20}
                      className={`transition-all duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  
                  {/* Tooltip for collapsed state */}
                  {!sidebarOpen && !isMobile && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs text-gray-300">{item.description}</div>
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                  
                  {/* Navigation Label */}
                  {(sidebarOpen || isMobile) && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-800'
                        }`}>
                          {item.label}
                        </span>
                        
                        {/* Badge */}
                        {item.badge && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gradient-to-r ' + item.color + ' text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm transition-all duration-300 ${
                        isActive ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                )}
                
                {/* Hover Effect */}
                {isHovered && !isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-gray-400 to-transparent rounded-r-full transition-all duration-300"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10 relative">
          {(sidebarOpen || isMobile) ? (
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 shadow-inner">
              <div className="flex items-center space-x-3">
              <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              👤
              </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">User</p>
              <p className="text-sm text-gray-500">Account</p>
              </div>
              <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                <span className="text-gray-400">⋮</span>
              </button>
              </div>
            </div>
          ) : (
            <button className="w-full p-2 hover:bg-white/20 rounded-xl transition-all">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto">
                👤
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// Modern Hamburger Menu Button
export const ModernMenuButton = ({ sidebarOpen, setSidebarOpen, className = '' }) => {
  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className={`group relative p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${className}`}
      aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
    >
      {sidebarOpen ? (
        <X size={24} className="text-gray-700 transition-all duration-300" strokeWidth={2} />
      ) : (
        <Menu size={24} className="text-gray-700 transition-all duration-300" strokeWidth={2} />
      )}
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Active Indicator */}
      {sidebarOpen && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-white" />
      )}
    </button>
  );
};

// Modern Header Component
export const ModernHeader = ({ sidebarOpen, setSidebarOpen, realTimeMetrics = {} }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-lg">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 animate-gradient-x"></div>
      
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <ModernMenuButton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            {/* Breadcrumb/Status */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <span className="text-gray-600">
                {realTimeMetrics.activeChats || 0} active conversations
              </span>
            </div>
          </div>

          {/* Center Section - Time */}
          <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
            <span>🕐</span>
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <span>📊</span>
                <span>{realTimeMetrics.satisfaction?.toFixed(1) || '4.6'} ★</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                <span>⚡</span>
                <span>{Math.floor((realTimeMetrics.avgResponseTime || 120) / 60)}m</span>
              </div>
            </div>

            {/* User Avatar */}
            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 hover:bg-white/50 rounded-2xl transition-all duration-300">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-gray-900 text-sm">Welcome back!</p>
                  <p className="text-xs text-gray-500">User</p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/20">
                    👤
                  </div>
                </div>
              </button>
              
              {/* Dropdown hint */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 p-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Account Settings</p>
                  <p className="text-xs mt-1">Profile, preferences & more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernNavigation;
