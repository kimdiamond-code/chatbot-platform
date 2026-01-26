// Production-safe logger utility
// In production, logs are suppressed. In development, they work normally.

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
  
  // For critical production events that should be logged
  production: (...args) => {
    console.log('[PROD]', ...args);
  }
};

export default logger;
