// ===================================================================
// INPUT VALIDATION & SANITIZATION - Protect against injection attacks
// ===================================================================

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
export function sanitizeString(input) {
  if (!input || typeof input !== 'string') return input;
  
  // Remove script tags and dangerous HTML
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: protocol
  
  return sanitized.trim();
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} - Valid or not
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean} - Valid or not
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's between 10-15 digits (international format)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validate URL format
 * @param {string} url - URL
 * @returns {boolean} - Valid or not
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 * @param {string} uuid - UUID string
 * @returns {boolean} - Valid or not
 */
export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate and sanitize conversation data
 * @param {object} data - Conversation data
 * @returns {object} - Validated data or error
 */
export function validateConversation(data) {
  const errors = [];
  
  // Email validation (optional)
  if (data.customer_email && !isValidEmail(data.customer_email)) {
    errors.push('Invalid email format');
  }
  
  // Phone validation (optional)
  if (data.customer_phone && !isValidPhone(data.customer_phone)) {
    errors.push('Invalid phone format');
  }
  
  // Sanitize text fields
  const sanitized = {
    customer_email: data.customer_email ? sanitizeString(data.customer_email) : null,
    customer_name: data.customer_name ? sanitizeString(data.customer_name) : null,
    customer_phone: data.customer_phone ? sanitizeString(data.customer_phone) : null,
    channel: data.channel ? sanitizeString(data.channel) : 'web',
    status: data.status ? sanitizeString(data.status) : 'active'
  };
  
  // Validate channel
  const validChannels = ['web', 'facebook', 'instagram', 'whatsapp', 'sms', 'email'];
  if (!validChannels.includes(sanitized.channel)) {
    errors.push('Invalid channel');
  }
  
  // Validate status
  const validStatuses = ['active', 'resolved', 'archived'];
  if (!validStatuses.includes(sanitized.status)) {
    errors.push('Invalid status');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: sanitized };
}

/**
 * Validate and sanitize message data
 * @param {object} data - Message data
 * @returns {object} - Validated data or error
 */
export function validateMessage(data) {
  const errors = [];
  
  // Required fields
  if (!data.conversation_id) {
    errors.push('conversation_id is required');
  }
  
  if (!data.content || typeof data.content !== 'string') {
    errors.push('content is required and must be a string');
  }
  
  if (!data.sender_type) {
    errors.push('sender_type is required');
  }
  
  // Validate sender_type
  const validSenderTypes = ['user', 'bot', 'agent'];
  if (data.sender_type && !validSenderTypes.includes(data.sender_type)) {
    errors.push('Invalid sender_type. Must be: user, bot, or agent');
  }
  
  // Sanitize
  const sanitized = {
    conversation_id: data.conversation_id,
    sender_type: data.sender_type,
    content: sanitizeString(data.content),
    metadata: data.metadata || {}
  };
  
  // Validate content length (max 10,000 characters)
  if (sanitized.content.length > 10000) {
    errors.push('Message content too long (max 10,000 characters)');
  }
  
  // Validate metadata is an object
  if (typeof sanitized.metadata !== 'object') {
    errors.push('metadata must be an object');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: sanitized };
}

/**
 * Validate proactive trigger data
 * @param {object} data - Trigger data
 * @returns {object} - Validated data or error
 */
export function validateProactiveTrigger(data) {
  const errors = [];
  
  // Required fields
  if (!data.organization_id) {
    errors.push('organization_id is required');
  }
  
  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required');
  }
  
  if (!data.trigger_type) {
    errors.push('trigger_type is required');
  }
  
  if (!data.message || typeof data.message !== 'string') {
    errors.push('message is required');
  }
  
  // Validate trigger_type
  const validTriggerTypes = [
    'exit_intent',
    'time_on_page',
    'scroll_percentage',
    'cart_abandonment',
    'utm_campaign',
    'specific_url',
    'custom'
  ];
  
  if (data.trigger_type && !validTriggerTypes.includes(data.trigger_type)) {
    errors.push(`Invalid trigger_type. Must be one of: ${validTriggerTypes.join(', ')}`);
  }
  
  // Sanitize
  const sanitized = {
    organization_id: data.organization_id,
    name: sanitizeString(data.name),
    trigger_type: data.trigger_type,
    message: sanitizeString(data.message),
    delay_seconds: parseInt(data.delay_seconds) || 0,
    priority: parseInt(data.priority) || 5,
    conditions: data.conditions || {},
    action_config: data.action_config || {}
  };
  
  // Validate numeric fields
  if (sanitized.delay_seconds < 0 || sanitized.delay_seconds > 3600) {
    errors.push('delay_seconds must be between 0 and 3600');
  }
  
  if (sanitized.priority < 1 || sanitized.priority > 10) {
    errors.push('priority must be between 1 and 10');
  }
  
  // Validate name length
  if (sanitized.name.length > 100) {
    errors.push('name too long (max 100 characters)');
  }
  
  // Validate message length
  if (sanitized.message.length > 1000) {
    errors.push('message too long (max 1000 characters)');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, data: sanitized };
}

/**
 * Sanitize object for database insertion
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Check if input contains SQL injection patterns
 * @param {string} input - Input string
 * @returns {boolean} - True if suspicious
 */
export function containsSQLInjection(input) {
  if (!input || typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|;|\/\*|\*\/)/g,
    /(\bOR\b|\bAND\b).*?=.*?=/gi,
    /(\bunion\b.*?\bselect\b)/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate API key format
 * @param {string} apiKey - API key
 * @returns {boolean} - Valid or not
 */
export function isValidApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') return false;
  
  // API keys should be at least 20 characters and alphanumeric with dashes
  return /^[a-zA-Z0-9-_]{20,}$/.test(apiKey);
}

export default {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidUUID,
  validateConversation,
  validateMessage,
  validateProactiveTrigger,
  sanitizeObject,
  containsSQLInjection,
  isValidApiKey
};
