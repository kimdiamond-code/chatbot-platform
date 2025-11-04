/**
 * Role-Based Access Control (RBAC) Service
 * Defines permissions for different user roles
 */

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  MANAGER: 'manager',
  AGENT: 'agent',
  USER: 'user'
};

// Permission definitions
export const PERMISSIONS = {
  // User Management
  VIEW_ALL_USERS: 'view_all_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  
  // Bot Configuration
  EDIT_BOT_CONFIG: 'edit_bot_config',
  VIEW_BOT_CONFIG: 'view_bot_config',
  
  // Integrations
  MANAGE_INTEGRATIONS: 'manage_integrations',
  VIEW_INTEGRATIONS: 'view_integrations',
  VIEW_API_KEYS: 'view_api_keys',
  
  // Conversations
  VIEW_ALL_CONVERSATIONS: 'view_all_conversations',
  VIEW_OWN_CONVERSATIONS: 'view_own_conversations',
  DELETE_CONVERSATIONS: 'delete_conversations',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',
  
  // Security & Compliance
  MANAGE_SECURITY: 'manage_security',
  VIEW_SECURITY_LOGS: 'view_security_logs',
  
  // Webhooks
  MANAGE_WEBHOOKS: 'manage_webhooks',
  
  // Widget
  EDIT_WIDGET_CODE: 'edit_widget_code',
  VIEW_WIDGET_CODE: 'view_widget_code',
  
  // Billing
  MANAGE_BILLING: 'manage_billing',
  VIEW_BILLING: 'view_billing',
  
  // Advanced Features
  MANAGE_PROACTIVE_ENGAGEMENT: 'manage_proactive_engagement',
  MANAGE_SCENARIOS: 'manage_scenarios',
  MANAGE_FORMS: 'manage_forms',
};

// Role permissions mapping
const rolePermissions = {
  [ROLES.ADMIN]: [
    // Admin has ALL permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.DEVELOPER]: [
    // Full access except user management
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.EDIT_BOT_CONFIG,
    PERMISSIONS.VIEW_BOT_CONFIG,
    PERMISSIONS.MANAGE_INTEGRATIONS,
    PERMISSIONS.VIEW_INTEGRATIONS,
    PERMISSIONS.VIEW_API_KEYS,
    PERMISSIONS.VIEW_ALL_CONVERSATIONS,
    PERMISSIONS.DELETE_CONVERSATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.MANAGE_SECURITY,
    PERMISSIONS.VIEW_SECURITY_LOGS,
    PERMISSIONS.MANAGE_WEBHOOKS,
    PERMISSIONS.EDIT_WIDGET_CODE,
    PERMISSIONS.VIEW_WIDGET_CODE,
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.MANAGE_PROACTIVE_ENGAGEMENT,
    PERMISSIONS.MANAGE_SCENARIOS,
    PERMISSIONS.MANAGE_FORMS,
  ],
  
  [ROLES.MANAGER]: [
    // Can view most things, manage conversations and content
    PERMISSIONS.VIEW_BOT_CONFIG,
    PERMISSIONS.VIEW_INTEGRATIONS,
    PERMISSIONS.VIEW_ALL_CONVERSATIONS,
    PERMISSIONS.DELETE_CONVERSATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.MANAGE_PROACTIVE_ENGAGEMENT,
    PERMISSIONS.MANAGE_SCENARIOS,
    PERMISSIONS.MANAGE_FORMS,
    PERMISSIONS.VIEW_BILLING,
  ],
  
  [ROLES.AGENT]: [
    // Can handle conversations and manage content
    PERMISSIONS.EDIT_BOT_CONFIG,
    PERMISSIONS.VIEW_BOT_CONFIG,
    PERMISSIONS.VIEW_ALL_CONVERSATIONS,
    PERMISSIONS.DELETE_CONVERSATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_PROACTIVE_ENGAGEMENT,
    PERMISSIONS.MANAGE_SCENARIOS,
    PERMISSIONS.MANAGE_FORMS,
    PERMISSIONS.VIEW_BILLING,
    PERMISSIONS.VIEW_WIDGET_CODE, // Button only, not full code
    PERMISSIONS.VIEW_INTEGRATIONS, // Can see integrations but not API keys
    PERMISSIONS.MANAGE_INTEGRATIONS, // Can connect/disconnect integrations
  ],
  
  [ROLES.USER]: [
    // Minimal access - view only
    PERMISSIONS.VIEW_BOT_CONFIG,
    PERMISSIONS.VIEW_OWN_CONVERSATIONS,
  ]
};

// Feature access mapping for navigation
export const FEATURE_ACCESS = {
  dashboard: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT, ROLES.USER],
  botbuilder: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT], // Added AGENT
  conversations: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT, ROLES.USER],
  scenarios: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT], // Added AGENT
  forms: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT], // Added AGENT
  proactive: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT], // Added AGENT
  crm: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER], // Hidden from AGENT
  ecommerce: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER], // Hidden from AGENT
  multichannel: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER], // Hidden from AGENT
  sms: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER], // Hidden from AGENT
  phone: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER], // Hidden from AGENT
  faq: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT], // Added AGENT (Knowledge Base)
  widget: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT, ROLES.USER],
  webhooks: [ROLES.ADMIN, ROLES.DEVELOPER], // ADMIN/DEV ONLY - Hidden from AGENT
  analytics: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT],
  integrations: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT], // Added AGENT - can connect integrations, no API keys
  security: [ROLES.ADMIN, ROLES.DEVELOPER], // ADMIN/DEV ONLY - Hidden from AGENT
  users: [ROLES.ADMIN], // ADMIN ONLY - Hidden from AGENT
  billing: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT], // Added AGENT
  settings: [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.MANAGER, ROLES.AGENT, ROLES.USER],
};

class RBACService {
  constructor() {
    this.currentUserRole = null;
  }

  /**
   * Set current user's role
   */
  setUserRole(role) {
    this.currentUserRole = role;
  }

  /**
   * Get current user's role
   */
  getUserRole() {
    return this.currentUserRole;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission) {
    if (!this.currentUserRole) {
      return false;
    }

    const permissions = rolePermissions[this.currentUserRole] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if user can access a feature
   */
  canAccessFeature(featureId) {
    if (!this.currentUserRole) {
      return false;
    }

    const allowedRoles = FEATURE_ACCESS[featureId] || [];
    return allowedRoles.includes(this.currentUserRole);
  }

  /**
   * Get all features the user can access
   */
  getAccessibleFeatures() {
    if (!this.currentUserRole) {
      return [];
    }

    return Object.keys(FEATURE_ACCESS).filter(featureId => 
      this.canAccessFeature(featureId)
    );
  }

  /**
   * Check if user is admin or developer (full access roles)
   */
  isAdminOrDeveloper() {
    return this.currentUserRole === ROLES.ADMIN || this.currentUserRole === ROLES.DEVELOPER;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.currentUserRole === ROLES.ADMIN;
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role) {
    const names = {
      [ROLES.ADMIN]: 'Administrator',
      [ROLES.DEVELOPER]: 'Developer',
      [ROLES.MANAGER]: 'Manager',
      [ROLES.AGENT]: 'Agent',
      [ROLES.USER]: 'User'
    };
    return names[role] || role;
  }

  /**
   * Get role badge color
   */
  getRoleBadgeColor(role) {
    const colors = {
      [ROLES.ADMIN]: 'bg-red-100 text-red-800',
      [ROLES.DEVELOPER]: 'bg-purple-100 text-purple-800',
      [ROLES.MANAGER]: 'bg-blue-100 text-blue-800',
      [ROLES.AGENT]: 'bg-green-100 text-green-800',
      [ROLES.USER]: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  }
}

// Create singleton instance
const rbacService = new RBACService();

export default rbacService;
export { rbacService };
