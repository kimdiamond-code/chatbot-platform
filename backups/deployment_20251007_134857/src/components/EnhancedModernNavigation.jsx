// ✨ ENHANCED MODERN NAVIGATION - WOW FACTOR UPGRADE ✨
import React, { useState, useEffect, useRef } from 'react';
import { ModernHamburgerButton, ModernMobileOverlay, ModernNavContainer, MenuStateIndicator, ModernMenuItem } from './ModernHamburgerMenu';

const EnhancedModernNavigation = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile,
  realTimeMetrics = {} 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const sidebarRef = useRef(null);

  // Enhanced navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      modernIcon: '▦',
      description: 'Analytics & Insights',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      glowColor: 'rgba(59, 130, 246, 0.3)',
      badge: null,
      sparkle: true
    },
    {
      id: 'botbuilder',
      label: 'Bot Builder',
      icon: '🤖',
      modernIcon: '◉',
      description: 'AI Assistant Config',
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      badge: 'AI',
      sparkle: true
    },
    {
      id: 'livechat',
      label: 'Live Chat',
      icon: '💬',
      modernIcon: '◐',
      description: 'Real-time Conversations',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      badge: realTimeMetrics.activeChats || 0,
      pulse: true
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: '🔌',
      modernIcon: '◈',
      description: 'Connect Services',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      glowColor: 'rgba(251, 146, 60, 0.3)',
      badge: 'NEW',
      glow: true
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      modernIcon: '◎',
      description: 'Platform Configuration',
      gradient: 'from-gray-500 via-slate-500 to-gray-600',
      glowColor: 'rgba(107, 114, 128, 0.3)',
      badge: null
    }
  ];

  // Particle system
  useEffect(() => {
    if (!sidebarOpen || isMobile) return;

    const createParticle = () => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
    });

    const interval = setInterval(() => {
      if (particles.length < 15) {
        setParticles(prev => [...prev, createParticle()]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sidebarOpen, isMobile, particles.length]);

  // Update particles position
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            y: particle.y - particle.speed,
            opacity: particle.opacity * 0.995
          }))
          .filter(particle => particle.y > -10 && particle.opacity > 0.1)
      );
    };

    const animation = setInterval(animateParticles, 50);
    return () => clearInterval(animation);
  }, []);

  // Enhanced sidebar toggle
  const handleToggle = () => {
    setIsAnimating(true);
    setSidebarOpen(!sidebarOpen);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Enhanced navigation click
  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Mouse tracking
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
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Container */}
      <div className={`
        ${isMobile ? 'fixed top-0 left-0 h-full z-50' : 'relative'}
        ${sidebarOpen ? 'w-80' : 'w-16'} 
        transition-all duration-300 ease-in-out
        ${isMobile && !sidebarOpen ? 'transform -translate-x-full' : ''}
      `}>
        <div 
          ref={sidebarRef}
          onMouseMove={handleMouseMove}
          className="h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl flex flex-col relative overflow-hidden"
          style={{
            background: sidebarOpen 
              ? `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.95) 0%,
                  rgba(255, 255, 255, 0.85) 50%,
                  rgba(248, 250, 252, 0.9) 100%),
                 radial-gradient(circle at ${cursorPosition.x}px ${cursorPosition.y}px, 
                  rgba(59, 130, 246, 0.05) 0%, 
                  transparent 50%)`
              : 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: `radial-gradient(circle, ${particle.color}, transparent)`,
                  opacity: particle.opacity,
                  filter: 'blur(0.5px)'
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="p-6 border-b border-white/20 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/20 transition-all duration-300">
                  <span className="text-white text-xl font-bold">◆</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              
              {(sidebarOpen || isMobile) && (
                <div className="flex-1">
                  <h1 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    ChatBot Platform
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-gray-500 font-medium">v2.0 • Enhanced UI</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-3 relative z-10">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full p-3 rounded-xl transition-all duration-300 relative group
                  ${activeTab === item.id 
                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg' 
                    : 'hover:bg-white/50 text-gray-700'
                  }
                  ${hoveredItem === item.id ? 'transform scale-105' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{sidebarOpen || isMobile ? item.icon : item.modernIcon}</span>
                  {(sidebarOpen || isMobile) && (
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  )}
                  {item.badge && (sidebarOpen || isMobile) && (
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-white/10 relative z-10">
            {(sidebarOpen || isMobile) ? (
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/20">
                      K
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Demo User</p>
                    <p className="text-sm text-gray-500">Administrator</p>
                  </div>
                  <button className="p-2 hover:bg-white/50 rounded-xl transition-all duration-300">
                    <span className="text-gray-400">⋮</span>
                  </button>
                </div>
              </div>
            ) : (
              <button className="w-full p-2 hover:bg-white/20 rounded-xl transition-all duration-300 group">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto">
                  K
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Enhanced Header Component
export const EnhancedHeader = ({ sidebarOpen, setSidebarOpen, realTimeMetrics = {} }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30"></div>
      
      <div className="relative px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 lg:hidden"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
            
            <div className="hidden md:flex items-center space-x-3 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
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
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <span>📊</span>
                <span className="font-bold">{realTimeMetrics.satisfaction?.toFixed(1) || '4.6'} ★</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                <span>⚡</span>
                <span className="font-bold">{Math.floor((realTimeMetrics.avgResponseTime || 120) / 60)}m</span>
              </div>
            </div>

            {/* User Avatar */}
            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-gray-900 text-sm">Welcome back!</p>
                  <p className="text-xs text-gray-500">Demo User</p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    K
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Quick Actions */}
        <div className="md:hidden mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {realTimeMetrics.activeChats || 0} chats
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

export default EnhancedModernNavigation;