// ✅ MODERN: Contemporary Theme System with Advanced Styling
// This provides a comprehensive modern design system for the entire platform

import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme Context
const ThemeContext = createContext();

// Modern Color Palette
export const modernColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe', 
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75'
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7', 
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', 
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// Modern Gradients
export const modernGradients = {
  primary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-600',
  warning: 'bg-gradient-to-r from-orange-500 to-red-500',
  info: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  purple: 'bg-gradient-to-r from-violet-500 to-purple-600',
  pink: 'bg-gradient-to-r from-pink-500 to-rose-500',
  ocean: 'bg-gradient-to-r from-blue-400 via-teal-500 to-green-500',
  sunset: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500',
  royal: 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700',
  forest: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'
};

// Animation Classes
export const animations = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  scaleIn: 'animate-scale-in',
  bounce: 'animate-bounce-subtle',
  pulse: 'animate-pulse-subtle',
  glow: 'animate-glow',
  float: 'animate-float',
  gradient: 'animate-gradient-x'
};

// Modern Component Styles
export const modernStyles = {
  glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl',
  frostedGlass: 'bg-white/60 backdrop-blur-lg border border-white/30 shadow-lg',
  card: 'bg-white rounded-2xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300',
  modernCard: 'bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl hover:scale-102 transition-all duration-300',
  button: 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95',
  input: 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm',
  badge: 'px-3 py-1 rounded-full text-xs font-semibold',
  tooltip: 'absolute z-50 px-3 py-2 text-sm bg-gray-900/90 text-white rounded-xl shadow-lg backdrop-blur-sm border border-white/10'
};

// Theme Provider Component
export const ModernThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('blue');
  const [animations, setAnimations] = useState(true);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('chatbot-theme');
    const savedAccent = localStorage.getItem('chatbot-accent');
    const savedAnimations = localStorage.getItem('chatbot-animations');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccentColor(savedAccent);
    if (savedAnimations !== null) setAnimations(JSON.parse(savedAnimations));
  }, []);

  // Save theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('chatbot-theme', theme);
    localStorage.setItem('chatbot-accent', accentColor);
    localStorage.setItem('chatbot-animations', JSON.stringify(animations));
  }, [theme, accentColor, animations]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const contextValue = {
    theme,
    setTheme,
    toggleTheme,
    accentColor,
    setAccentColor,
    animations,
    setAnimations,
    colors: modernColors,
    gradients: modernGradients,
    styles: modernStyles
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`${theme === 'dark' ? 'dark' : ''} ${animations ? 'motion-safe' : 'motion-reduce'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useModernTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useModernTheme must be used within ModernThemeProvider');
  }
  return context;
};

// Modern Button Component
export const ModernButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const { styles, animations } = useModernTheme();
  
  const variants = {
    primary: `${modernGradients.primary} text-white shadow-lg hover:shadow-xl`,
    secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
    success: `${modernGradients.success} text-white shadow-lg hover:shadow-xl`,
    warning: `${modernGradients.warning} text-white shadow-lg hover:shadow-xl`,
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200',
    glass: `${styles.glass} text-gray-700 hover:bg-white/90`
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${styles.button} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
        ${loading ? 'cursor-wait' : ''} 
        ${className}
        relative overflow-hidden group
      `}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Button Content */}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
    </button>
  );
};

// Modern Input Component
export const ModernInput = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  const { styles } = useModernTheme();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          className={`
            ${styles.input} 
            ${icon ? 'pl-10' : ''} 
            ${error ? 'border-red-300 ring-red-500/50' : ''} 
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// Modern Card Component  
export const ModernCard = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hover = true,
  ...props 
}) => {
  const { styles } = useModernTheme();
  
  const variants = {
    default: styles.card,
    modern: styles.modernCard,
    glass: styles.glass,
    frosted: styles.frostedGlass
  };

  return (
    <div
      className={`
        ${variants[variant]} 
        ${hover ? 'hover:shadow-2xl hover:scale-102' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Modern Badge Component
export const ModernBadge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const { styles } = useModernTheme();
  
  const variants = {
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-orange-100 text-orange-800 border border-orange-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    gradient: `${modernGradients.primary} text-white shadow-lg`
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`
      ${styles.badge} 
      ${variants[variant]} 
      ${sizes[size]} 
      ${className}
    `}>
      {children}
    </span>
  );
};

// Modern Loading Spinner
export const ModernSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

// Modern Tooltip Component
export const ModernTooltip = ({ 
  children, 
  content, 
  position = 'top',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2', 
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className={`
          ${modernStyles.tooltip} 
          ${positions[position]} 
          ${className}
          animate-fade-in
        `}>
          {content}
          
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-gray-900/90 transform rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2' :
            'right-full top-1/2 -translate-y-1/2 translate-x-1/2'
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default {
  ModernThemeProvider,
  useModernTheme,
  ModernButton,
  ModernInput,
  ModernCard,
  ModernBadge,
  ModernSpinner,
  ModernTooltip,
  modernColors,
  modernGradients,
  modernStyles,
  animations
};
