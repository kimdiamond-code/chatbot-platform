// ===================================================================
// RATE LIMITING - Prevent abuse and DDoS attacks
// ===================================================================

// In-memory store for rate limiting (for serverless, consider Redis in production)
const rateLimitStore = new Map();

// Configuration
const RATE_LIMITS = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // Stricter for auth endpoints
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60
  },
  database: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120
  }
};

/**
 * Get client identifier (IP address or API key)
 * @param {object} req - Request object
 * @returns {string} - Client identifier
 */
function getClientId(req) {
  // Try to get real IP behind proxies
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? forwarded.split(',')[0].trim() 
    : req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  
  // Use API key if available, otherwise use IP
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  return apiKey || ip;
}

/**
 * Clean up old entries from rate limit store
 */
function cleanup() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if request should be rate limited
 * @param {object} req - Request object
 * @param {string} limitType - Type of rate limit (default, auth, api, database)
 * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(req, limitType = 'default') {
  const clientId = getClientId(req);
  const limit = RATE_LIMITS[limitType] || RATE_LIMITS.default;
  const now = Date.now();
  
  // Create unique key for this client and limit type
  const key = `${limitType}:${clientId}`;
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry
    entry = {
      count: 0,
      resetTime: now + limit.windowMs
    };
  }
  
  // Increment counter
  entry.count += 1;
  rateLimitStore.set(key, entry);
  
  // Check if limit exceeded
  const allowed = entry.count <= limit.maxRequests;
  const remaining = Math.max(0, limit.maxRequests - entry.count);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.01) { // 1% chance on each request
    cleanup();
  }
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    limit: limit.maxRequests
  };
}

/**
 * Rate limit middleware for API routes
 * @param {string} limitType - Type of rate limit
 * @returns {function} - Middleware function
 */
export function rateLimitMiddleware(limitType = 'default') {
  return (req, res, next) => {
    const result = checkRateLimit(req, limitType);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    if (!result.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
    }
    
    // If next is a function, call it (Express style)
    // Otherwise, continue (we'll handle in the route)
    if (typeof next === 'function') {
      next();
    }
    
    return true;
  };
}

/**
 * Block suspicious IPs (simple implementation)
 */
const blockedIPs = new Set([
  // Add known malicious IPs here
]);

/**
 * Check if IP is blocked
 * @param {object} req - Request object
 * @returns {boolean} - True if blocked
 */
export function isIPBlocked(req) {
  const clientId = getClientId(req);
  return blockedIPs.has(clientId);
}

/**
 * Add IP to blocklist
 * @param {string} ip - IP address to block
 */
export function blockIP(ip) {
  blockedIPs.add(ip);
}

/**
 * Remove IP from blocklist
 * @param {string} ip - IP address to unblock
 */
export function unblockIP(ip) {
  blockedIPs.delete(ip);
}

/**
 * Get rate limit stats for monitoring
 * @returns {object} - Statistics
 */
export function getRateLimitStats() {
  const stats = {
    totalEntries: rateLimitStore.size,
    blockedIPs: blockedIPs.size,
    entries: []
  };
  
  for (const [key, value] of rateLimitStore.entries()) {
    stats.entries.push({
      key,
      count: value.count,
      resetTime: new Date(value.resetTime).toISOString()
    });
  }
  
  return stats;
}

/**
 * Reset rate limit for a specific client (admin function)
 * @param {string} clientId - Client identifier
 */
export function resetRateLimit(clientId) {
  for (const key of rateLimitStore.keys()) {
    if (key.includes(clientId)) {
      rateLimitStore.delete(key);
    }
  }
}

export default {
  checkRateLimit,
  rateLimitMiddleware,
  isIPBlocked,
  blockIP,
  unblockIP,
  getRateLimitStats,
  resetRateLimit
};
