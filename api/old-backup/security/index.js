// ===================================================================
// SECURITY MODULE - Central export for all security utilities
// ===================================================================

export { default as encryption } from './encryption.js';
export { default as validation } from './validation.js';
export { default as rateLimit } from './rateLimit.js';
export { default as auditLog } from './auditLog.js';
export { default as auth } from './auth.js';

// Re-export commonly used functions
export {
  encrypt,
  decrypt,
  hash,
  generateToken,
  maskData
} from './encryption.js';

export {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  validateConversation,
  validateMessage,
  validateProactiveTrigger
} from './validation.js';

export {
  checkRateLimit,
  rateLimitMiddleware,
  isIPBlocked
} from './rateLimit.js';

export {
  createAuditLog,
  logAuth,
  logDataAccess,
  logSecurityEvent,
  ACTION_TYPES
} from './auditLog.js';

export {
  validateApiKey,
  authMiddleware,
  corsMiddleware,
  securityHeaders
} from './auth.js';
