/**
 * Production-Safe Logger
 * 
 * Usage:
 *   import { logger } from './utils/logger';
 *   logger.log('Debug info');      // Only in development
 *   logger.error('Error message'); // Always logged
 *   logger.warn('Warning');        // Only in development
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    console.error(...args);
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

export const ifDev = (callback) => {
  if (isDevelopment && typeof callback === 'function') {
    callback();
  }
};

export default logger;
