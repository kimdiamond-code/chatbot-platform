// ✨ AGENTSTACK ENHANCED NAVIGATION - FIXED VERSION ✨
// Clean navigation component with modern hamburger menu

import React, { useState, useEffect, useRef } from 'react';

// Simple Icon Components (Clean styling)
const BarChart3 = ({ size = 20, className = '' }) => <span className={`inline-block ${className}`} style={{fontSize: `${size}px`}}>📊</span>;
const MessageCircle = ({ size = 20, className = '' }) => <span className={`inline-block ${className}`} style={{fontSize: `${size}px`}}>💬</span>;
const Bot = ({ size = 20, className = '' }) => <span className={`inline-block ${className}`} style={{fontSize: `${size}px`}}>🤖</span>;
const Settings = ({ size = 20, className = '' }) => <span className={`inline-block ${className}`} style={{fontSize: `${size}px`}}>⚙️</span>;
const User = ({ size = 20, className = '' }) => <span className={`inline-block ${className}`} style={{fontSize: `${size}px`}}>👤</span>;
const Menu = ({ size = 20, className = '' }) => <span className={`inline-block ${className}`} style={{fontSize: `${size}px`}}>☰</span>;
const X = ({ size = 20, className = '' }) => <span className={`inline-block ${className}`} style={{fontSize: `${size}px`}}>✕</span>;

const AgentStackEnhancedNavigation = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile,
  realTimeMetrics = {} 
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const sidebarRef = useRef(null);

  // Navigation items with clean styling
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Analytics & Insights',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600'
    },
    {
      id: 'botbuilder',
      label: 'Bot Builder',
      icon: '🤖',
      description: 'AI Assistant Config',
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      badge: 'AI'
    },
    {
      id: 'livechat',
      label: 'Live Chat',
      icon: '💬',
      description: 'Real-time Conversations',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      badge: realTimeMetrics.activeChats || 0
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: '🔌',
      description: 'Connect Services',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      badge: 'NEW'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Platform Configuration',
      gradient: 'from-gray-500 via-slate-500 to-gray-600'
    }
  ];

  // Enhanced navigation click
  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Mouse tracking for enhanced hover effects
  const handleMouseMove = (e) => {
    if (sidebarRef.current) {
      const rect = sidebarRef.current.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Enhanced Sidebar */}
      <div 
        ref={sidebarRef}
        onMouseMove={handleMouseMove}
        className={`${
          isMobile 
            ? `fixed left-0 top-0 h-full w-80 transform transition-all duration-500 ease-out z-50 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : `${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-500 ease-out`
        } bg-white/95 backdrop-blur-md border-r border-gray-200/50 flex flex-col shadow-xl`}
      >
        
        {/* Enhanced Header */}
        <div className="p-6 border-b border-gray-200/30">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">◆</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            {(sidebarOpen || isMobile) && (
              <div className="flex-1">
                <h1 className="font-bold text-xl text-gray-900">Agentstack</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-500 font-medium">Enhanced UI</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-3">
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
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                    : 'hover:bg-gray-50 hover:shadow-md text-gray-700'
                }`}
              >
                <div className="relative p-4 flex items-center space-x-4 z-10">
                  {/* Icon */}
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${
                    (sidebarOpen || isMobile) ? 'w-10 h-10' : 'w-8 h-8'
                  }`}>
                    <span className={`text-2xl transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {item.icon}
                    </span>
                  </div>
                  
                  {/* Label */}
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
                              : `bg-gradient-to-r ${item.gradient} text-white shadow-sm`
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm transition-all duration-300 ${
                        isActive ? 'text-white/90' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-sm"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200/30">
          {(sidebarOpen || isMobile) ? (
            <div className="bg-gray-50/80 rounded-2xl p-4 hover:bg-gray-100/80 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    K
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Demo User</p>
                  <p className="text-sm text-gray-500">Administrator</p>
                </div>
                <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                  <span className="text-gray-400">⋮</span>
                </button>
              </div>
            </div>
          ) : (
            <button className="w-full p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto">
                K
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
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setSidebarOpen(!sidebarOpen);
    setTimeout(() => setIsClicked(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative p-3 rounded-2xl bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${className} ${
        isClicked ? 'scale-95' : ''
      }`}
    >
      <div className="w-6 h-6 relative flex flex-col justify-center space-y-1">
        <div className={`w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${
          sidebarOpen ? 'rotate-45 translate-y-1.5 bg-blue-500' : ''
        }`} />
        <div className={`w-full h-0.5 bg-gray-700 rounded-full transition-all duration-200 ${
          sidebarOpen ? 'opacity-0 scale-0' : ''
        }`} />
        <div className={`w-full h-0.5 bg-gray-700 rounded-full transition-all duration-300 ${
          sidebarOpen ? '-rotate-45 -translate-y-1.5 bg-blue-500' : ''
        }`} />
      </div>
    </button>
  );
};

// Clean Header Component
export const CleanHeader = ({ sidebarOpen, setSidebarOpen, realTimeMetrics = {} }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <ModernMenuButton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <div className="hidden md:flex items-center space-x-3 text-sm">
            <span className="px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium">
              🟢 System Online
            </span>
            <span className="text-gray-400">•</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium">
                {realTimeMetrics.activeChats || 0} active chats
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="hidden lg:flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
          <span className="text-xl">🕐</span>
          <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full">
              <span>📊</span>
              <span className="font-bold">{realTimeMetrics.satisfaction?.toFixed(1) || '4.6'} ★</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 text-purple-800 rounded-full">
              <span>⚡</span>
              <span className="font-bold">{Math.floor((realTimeMetrics.avgResponseTime || 120) / 60)}m</span>
            </div>
          </div>

          {/* User Avatar */}
          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-gray-900 text-sm">Welcome back!</p>
                <p className="text-xs text-gray-500">Demo User</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  K
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AgentStackEnhancedNavigation;