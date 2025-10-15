// Production Logger - Minimal console output for demos
// Set window.DEBUG_MODE = true in console to enable verbose logging

const isDebugMode = () => {
  if (typeof window !== 'undefined') {
    return window.DEBUG_MODE === true || localStorage.getItem('DEBUG_MODE') === 'true';
  }
  return false;
};

export const logger = {
  // Only log errors and critical info in production
  log: (...args) => {
    if (isDebugMode()) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (isDebugMode()) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    // Always show warnings
    console.warn(...args);
  },
  
  error: (...args) => {
    // Always show errors
    console.error(...args);
  },
  
  // Special for analytics  
  analytics: (...args) => {
    if (isDebugMode()) {
      console.log('📊', ...args);
    }
  },
  
  // Special for integrations
  integration: (...args) => {
    if (isDebugMode()) {
      console.log('🔗', ...args);
    }
  }
};

// Enable debug mode with: window.enableDebug()
if (typeof window !== 'undefined') {
  window.enableDebug = () => {
    window.DEBUG_MODE = true;
    localStorage.setItem('DEBUG_MODE', 'true');
    console.log('✅ Debug mode enabled');
  };
  
  window.disableDebug = () => {
    window.DEBUG_MODE = false;
    localStorage.removeItem('DEBUG_MODE');
    console.log('❌ Debug mode disabled');
  };
}

export default logger;
