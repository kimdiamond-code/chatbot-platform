// ✨ MODERN HAMBURGER MENU - ENHANCED 2024 STYLING ✨
// State-of-the-art hamburger menu with fluid animations and microinteractions

import React, { useState, useEffect, useRef } from 'react';

// 🍔 Ultra-Modern Hamburger Menu Button Component
export const ModernHamburgerButton = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  className = '',
  size = 'default',
  style = 'glassmorphism' 
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  // Sophisticated click handler with haptic feedback simulation
  const handleClick = () => {
    setIsClicked(true);
    
    // Create ripple effect at click position
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const newRipple = {
        id: Date.now(),
        x: centerX,
        y: centerY,
        size: 0
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Animate ripple
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    setSidebarOpen(!sidebarOpen);
    
    // Reset click state with sophisticated timing
    setTimeout(() => setIsClicked(false), 300);
  };

  // Size variants
  const sizeClasses = {
    small: 'p-2 w-8 h-8',
    default: 'p-3 w-12 h-12',
    large: 'p-4 w-14 h-14'
  };

  // Style variants
  const styleVariants = {
    glassmorphism: 'bg-white/90 backdrop-blur-md border border-white/20',
    solid: 'bg-white shadow-lg',
    minimal: 'bg-transparent hover:bg-white/10',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600'
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative overflow-hidden rounded-2xl transition-all duration-500 ease-out
        ${sizeClasses[size]}
        ${styleVariants[style]}
        ${isClicked ? 'scale-95' : isHovered ? 'scale-105' : 'scale-100'}
        ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
        ${className}
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
        active:scale-95 hover:rotate-1 active:rotate-0
      `}
      style={{
        transform: `
          scale(${isClicked ? 0.95 : isHovered ? 1.05 : 1}) 
          rotate(${isHovered && !sidebarOpen ? '1deg' : '0deg'})
        `,
        filter: `saturate(${isHovered ? 1.2 : 1}) brightness(${isClicked ? 0.9 : 1})`
      }}
    >
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s'
          }}
        />
      ))}

      {/* Enhanced Background Glow */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm -z-10
      `} />

      {/* Hamburger Icon Container */}
      <div className="relative w-6 h-6 flex flex-col justify-center items-center">
        {/* Top Line */}
        <div 
          className={`
            w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-500 ease-out transform-gpu
            ${sidebarOpen 
              ? 'rotate-45 translate-y-1.5 bg-blue-500' 
              : isHovered 
                ? 'w-6 bg-gray-800' 
                : ''
            }
          `}
          style={{
            transformOrigin: 'center',
            filter: `hue-rotate(${sidebarOpen ? '200deg' : '0deg'})`
          }}
        />
        
        {/* Middle Line */}
        <div 
          className={`
            w-5 h-0.5 bg-gray-700 rounded-full my-1 transition-all duration-300 ease-out transform-gpu
            ${sidebarOpen 
              ? 'opacity-0 scale-0 rotate-180' 
              : isHovered 
                ? 'w-4 bg-gray-800' 
                : ''
            }
          `}
        />
        
        {/* Bottom Line */}
        <div 
          className={`
            w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-500 ease-out transform-gpu
            ${sidebarOpen 
              ? '-rotate-45 -translate-y-1.5 bg-blue-500' 
              : isHovered 
                ? 'w-6 bg-gray-800' 
                : ''
            }
          `}
          style={{
            transformOrigin: 'center',
            filter: `hue-rotate(${sidebarOpen ? '200deg' : '0deg'})`
          }}
        />
      </div>

      {/* Enhanced Hover Indicator */}
      {isHovered && !sidebarOpen && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-blue-500 rounded-full animate-pulse" />
      )}

      {/* Active State Indicator */}
      {sidebarOpen && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
      )}
    </button>
  );
};

// 🎭 Enhanced Mobile Menu Overlay
export const ModernMobileOverlay = ({ isOpen, onClose, children }) => {
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      setOverlayOpacity(1);
    } else {
      setOverlayOpacity(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 md:hidden"
      style={{
        background: `radial-gradient(circle at center, 
          rgba(0, 0, 0, ${overlayOpacity * 0.4}) 0%, 
          rgba(0, 0, 0, ${overlayOpacity * 0.6}) 100%
        )`,
        backdropFilter: `blur(${overlayOpacity * 8}px)`,
        opacity: overlayOpacity,
        transition: 'all 0.3s ease-out'
      }}
      onClick={onClose}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-purple-500/20 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-pink-500/20 rounded-full animate-pulse delay-700" />
      </div>
      
      {/* Content Container */}
      <div 
        className="relative w-full h-full flex"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// 🎯 Enhanced Navigation Transition Container
export const ModernNavContainer = ({ 
  isOpen, 
  isMobile, 
  children, 
  className = '' 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <div 
      className={`
        ${isMobile 
          ? `fixed left-0 top-0 h-full w-80 z-50 transform transition-all duration-500 ease-out ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `${isOpen ? 'w-80' : 'w-20'} transition-all duration-500 ease-out`
        }
        ${className}
        ${isAnimating ? 'will-change-transform' : ''}
      `}
      style={{
        transform: isMobile 
          ? `translateX(${isOpen ? '0%' : '-100%'}) ${isAnimating ? 'translateZ(0)' : ''}`
          : undefined,
        filter: `saturate(${isOpen ? 1.1 : 1})`,
        backfaceVisibility: 'hidden',
        perspective: 1000
      }}
    >
      {children}
    </div>
  );
};

// 🌟 Enhanced Menu State Indicator
export const MenuStateIndicator = ({ isOpen, activeItems = 0 }) => {
  return (
    <div className={`
      absolute top-2 right-2 flex items-center space-x-1 transition-all duration-300
      ${isOpen ? 'opacity-100' : 'opacity-0'}
    `}>
      {/* Connection Status */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-gray-500 font-medium">Online</span>
      </div>
      
      {/* Active Items Count */}
      {activeItems > 0 && (
        <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-bold animate-bounce">
          {activeItems}
        </div>
      )}
    </div>
  );
};

// 🎨 Menu Item with Enhanced Animations
export const ModernMenuItem = ({ 
  icon, 
  label, 
  isActive, 
  isOpen, 
  onClick,
  badge = null,
  gradient = 'from-blue-500 to-purple-600',
  description = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickEffect, setClickEffect] = useState(false);

  const handleClick = () => {
    setClickEffect(true);
    onClick();
    setTimeout(() => setClickEffect(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full group relative overflow-hidden rounded-2xl transition-all duration-500 ease-out
        ${isActive
          ? `bg-gradient-to-r ${gradient} text-white shadow-2xl scale-105 hover:scale-110`
          : 'hover:bg-white/60 hover:shadow-xl hover:scale-102 text-gray-700'
        }
        ${clickEffect ? 'scale-95' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
      `}
      style={{
        transformOrigin: 'center',
        boxShadow: isActive 
          ? '0 10px 30px rgba(59, 130, 246, 0.3)' 
          : isHovered 
            ? '0 8px 25px rgba(0, 0, 0, 0.15)'
            : undefined
      }}
    >
      {/* Background Effects */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Content */}
      <div className="relative p-4 flex items-center space-x-4 z-10">
        {/* Icon */}
        <div className={`relative flex items-center justify-center transition-all duration-500 ${
          isOpen ? 'w-10 h-10' : 'w-8 h-8'
        }`}>
          <span className={`text-2xl transition-all duration-500 ${
            isActive || isHovered ? 'scale-110 rotate-12' : 'group-hover:scale-105'
          }`}>
            {icon}
          </span>
        </div>
        
        {/* Label and Description */}
        {isOpen && (
          <div className="flex-1 text-left animate-fade-in">
            <div className="flex items-center justify-between">
              <span className={`font-semibold transition-all duration-300 ${
                isActive ? 'text-white' : 'text-gray-800'
              }`}>
                {label}
              </span>
              
              {badge && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 text-white animate-pulse' 
                    : `bg-gradient-to-r ${gradient} text-white shadow-lg`
                }`}>
                  {badge}
                </span>
              )}
            </div>
            
            {description && (
              <p className={`text-sm transition-all duration-300 ${
                isActive ? 'text-white/90' : 'text-gray-500'
              }`}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg animate-pulse" />
      )}
    </button>
  );
};

export default ModernHamburgerButton;