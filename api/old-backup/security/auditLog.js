// ===================================================================
// AUDIT LOGGING - Track sensitive operations for security compliance
// ===================================================================

import { neon } from '@neondatabase/serverless';

// Initialize Neon database
let sql;
try {
  sql = neon(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
} catch (error) {
  console.warn('Audit logging: Database not available, using console only');
}

/**
 * Log levels
 */
export const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Action types for audit logging
 */
export const ACTION_TYPES = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // Data operations
  DATA_READ: 'data_read',
  DATA_CREATE: 'data_create',
  DATA_UPDATE: 'data_update',
  DATA_DELETE: 'data_delete',
  DATA_EXPORT: 'data_export',
  
  // User management
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  ROLE_CHANGE: 'role_change',
  
  // Configuration
  CONFIG_CHANGE: 'config_change',
  INTEGRATION_CONNECT: 'integration_connect',
  INTEGRATION_DISCONNECT: 'integration_disconnect',
  
  // Security
  PERMISSION_DENIED: 'permission_denied',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  IP_BLOCKED: 'ip_blocked',
  
  // Compliance
  GDPR_REQUEST: 'gdpr_request',
  DATA_RETENTION: 'data_retention',
  CONSENT_CHANGE: 'consent_change'
};

/**
 * Get client information from request
 * @param {object} req - Request object
 * @returns {object} - Client info
 */
function getClientInfo(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? forwarded.split(',')[0].trim() 
    : req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  
  return {
    ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    origin: req.headers['origin'] || req.headers['referer'] || 'unknown'
  };
}

/**
 * Create audit log entry
 * @param {object} params - Log parameters
 * @returns {Promise<object>} - Created log entry
 */
export async function createAuditLog({
  userId = null,
  organizationId = null,
  action,
  resourceType = null,
  resourceId = null,
  details = {},
  level = LOG_LEVELS.INFO,
  req = null
}) {
  try {
    const clientInfo = req ? getClientInfo(req) : {};
    
    const logEntry = {
      user_id: userId,
      organization_id: organizationId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: JSON.stringify(details),
      ip_address: clientInfo.ip || null,
      user_agent: clientInfo.userAgent || null,
      level,
      timestamp: new Date().toISOString()
    };
    
    // Log to console
    console.log(`[AUDIT ${level.toUpperCase()}]`, {
      action,
      userId,
      organizationId,
      resourceType,
      resourceId,
      ip: clientInfo.ip,
      timestamp: logEntry.timestamp
    });
    
    // Log to database if available
    if (sql) {
      try {
        const result = await sql`
          INSERT INTO audit_logs (
            user_id,
            organization_id,
            action,
            resource_type,
            resource_id,
            details,
            ip_address,
            user_agent,
            level,
            created_at
          ) VALUES (
            ${logEntry.user_id},
            ${logEntry.organization_id},
            ${logEntry.action},
            ${logEntry.resource_type},
            ${logEntry.resource_id},
            ${logEntry.details},
            ${logEntry.ip_address},
            ${logEntry.user_agent},
            ${logEntry.level},
            NOW()
          )
          RETURNING *
        `;
        
        return result[0];
      } catch (dbError) {
        console.error('Failed to write audit log to database:', dbError);
        // Continue even if database write fails
      }
    }
    
    return logEntry;
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - logging failures shouldn't break the application
    return null;
  }
}

/**
 * Log authentication event
 */
export async function logAuth({ action, userId, success, req, details = {} }) {
  return createAuditLog({
    userId,
    action,
    resourceType: 'authentication',
    details: { success, ...details },
    level: success ? LOG_LEVELS.INFO : LOG_LEVELS.WARNING,
    req
  });
}

/**
 * Log data access
 */
export async function logDataAccess({ userId, organizationId, action, resourceType, resourceId, req, details = {} }) {
  return createAuditLog({
    userId,
    organizationId,
    action,
    resourceType,
    resourceId,
    details,
    level: LOG_LEVELS.INFO,
    req
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent({ action, userId, organizationId, req, details = {} }) {
  return createAuditLog({
    userId,
    organizationId,
    action,
    resourceType: 'security',
    details,
    level: LOG_LEVELS.WARNING,
    req
  });
}

/**
 * Log critical event
 */
export async function logCriticalEvent({ action, userId, organizationId, req, details = {} }) {
  return createAuditLog({
    userId,
    organizationId,
    action,
    resourceType: 'system',
    details,
    level: LOG_LEVELS.CRITICAL,
    req
  });
}

/**
 * Get audit logs (for viewing in UI)
 * @param {object} filters - Query filters
 * @returns {Promise<array>} - Audit logs
 */
export async function getAuditLogs({
  organizationId = null,
  userId = null,
  action = null,
  level = null,
  startDate = null,
  endDate = null,
  limit = 100
}) {
  if (!sql) {
    return [];
  }
  
  try {
    let query = sql`
      SELECT * FROM audit_logs
      WHERE 1=1
    `;
    
    if (organizationId) {
      query = sql`${query} AND organization_id = ${organizationId}`;
    }
    
    if (userId) {
      query = sql`${query} AND user_id = ${userId}`;
    }
    
    if (action) {
      query = sql`${query} AND action = ${action}`;
    }
    
    if (level) {
      query = sql`${query} AND level = ${level}`;
    }
    
    if (startDate) {
      query = sql`${query} AND created_at >= ${startDate}`;
    }
    
    if (endDate) {
      query = sql`${query} AND created_at <= ${endDate}`;
    }
    
    query = sql`${query} ORDER BY created_at DESC LIMIT ${limit}`;
    
    const logs = await query;
    return logs;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Middleware to automatically log API requests
 */
export function auditMiddleware(action, resourceType = null) {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Log the request
    await createAuditLog({
      userId: req.user?.id || null,
      organizationId: req.user?.organizationId || req.query?.orgId || req.body?.organization_id || null,
      action,
      resourceType,
      resourceId: req.params?.id || req.query?.id || req.body?.id || null,
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        bodyKeys: req.body ? Object.keys(req.body) : []
      },
      req
    });
    
    // Log response
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      console.log(`[AUDIT] ${action} completed in ${duration}ms`);
      return originalSend.call(this, data);
    };
    
    if (typeof next === 'function') {
      next();
    }
  };
}

export default {
  createAuditLog,
  logAuth,
  logDataAccess,
  logSecurityEvent,
  logCriticalEvent,
  getAuditLogs,
  auditMiddleware,
  ACTION_TYPES,
  LOG_LEVELS
};
