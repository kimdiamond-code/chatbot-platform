// ===================================================================
// API AUTHENTICATION - Verify API keys and tokens
// ===================================================================

import { hash } from './encryption.js';
import { isValidApiKey } from './validation.js';

/**
 * Validate API key from environment
 * @param {string} apiKey - API key from request
 * @returns {boolean} - Valid or not
 */
export function validateApiKey(apiKey) {
  if (!apiKey) return false;
  
  // Check format
  if (!isValidApiKey(apiKey)) return false;
  
  // Get expected API key from environment
  const expectedKey = process.env.API_SECRET_KEY;
  
  if (!expectedKey) {
    console.warn('API_SECRET_KEY not set in environment');
    return false;
  }
  
  // Compare (constant-time comparison to prevent timing attacks)
  return timingSafeEqual(apiKey, expectedKey);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - Equal or not
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  const strA = String(a);
  const strB = String(b);
  const aLen = Buffer.byteLength(strA);
  const bLen = Buffer.byteLength(strB);
  
  // Make comparison constant-time
  const bufA = Buffer.alloc(Math.max(aLen, bLen), 0, 'utf8');
  bufA.write(strA);
  const bufB = Buffer.alloc(Math.max(aLen, bLen), 0, 'utf8');
  bufB.write(strB);
  
  let result = aLen === bLen ? 0 : 1;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  
  return result === 0;
}

/**
 * Extract API key from request headers
 * @param {object} req - Request object
 * @returns {string|null} - API key or null
 */
export function extractApiKey(req) {
  // Check X-API-Key header
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'];
  }
  
  // Check Authorization header
  const auth = req.headers['authorization'];
  if (auth) {
    // Bearer token format
    if (auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    // Direct token
    return auth;
  }
  
  // Check query parameter (less secure, but sometimes needed)
  if (req.query?.apiKey) {
    return req.query.apiKey;
  }
  
  return null;
}

/**
 * Authentication middleware for API routes
 * @param {object} options - Middleware options
 * @returns {function} - Middleware function
 */
export function authMiddleware(options = {}) {
  const { required = true, allowPublic = false } = options;
  
  return (req, res, next) => {
    // Skip auth if public access allowed
    if (allowPublic && !req.headers['x-api-key'] && !req.headers['authorization']) {
      if (typeof next === 'function') {
        return next();
      }
      return true;
    }
    
    const apiKey = extractApiKey(req);
    
    // Check if API key is required
    if (required && !apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required. Provide via X-API-Key header or Authorization header.'
      });
    }
    
    // Validate API key
    if (apiKey && !validateApiKey(apiKey)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid API key'
      });
    }
    
    // Attach auth info to request
    req.authenticated = !!apiKey;
    req.apiKey = apiKey;
    
    if (typeof next === 'function') {
      next();
    }
    
    return true;
  };
}

/**
 * Check if request is from internal origin
 * @param {object} req - Request object
 * @returns {boolean} - True if internal
 */
export function isInternalRequest(req) {
  const origin = req.headers['origin'] || req.headers['referer'];
  const allowedOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:5173',
    'http://localhost:3000'
  ].filter(Boolean);
  
  if (!origin) return false;
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

/**
 * CORS middleware with security considerations
 * @param {object} req - Request object
 * @param {object} res - Response object
 */
export function corsMiddleware(req, res) {
  const origin = req.headers['origin'];
  const allowedOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:5173',
    'http://localhost:3000'
  ].filter(Boolean);
  
  // Check if origin is allowed
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow same-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Security headers middleware
 * @param {object} res - Response object
 */
export function securityHeaders(res) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // XSS protection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (basic)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
}

/**
 * Generate API key (for admin use)
 * @returns {string} - New API key
 */
export function generateApiKey() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

export default {
  validateApiKey,
  extractApiKey,
  authMiddleware,
  isInternalRequest,
  corsMiddleware,
  securityHeaders,
  generateApiKey
};
