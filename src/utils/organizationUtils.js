// Organization ID utility - central place to get current organization
// Now works with the new useAuth hook system

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Get organization ID from user object (passed from useAuth hook)
export const getCurrentOrganizationId = (user = null) => {
  // If user is passed, use it (always use camelCase organizationId)
  if (user) {
    return user.organizationId || DEFAULT_ORG_ID;
  }

  // Fallback: Try to get from localStorage (correct key: chatbot_auth)
  try {
    const storedAuth = localStorage.getItem('chatbot_auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      return authData.organizationId || DEFAULT_ORG_ID;
    }
  } catch (error) {
    console.warn('Failed to get organization from localStorage:', error);
  }

  return DEFAULT_ORG_ID;
};

export const ensureOrganizationId = (providedOrgId, user = null) => {
  if (providedOrgId && providedOrgId !== DEFAULT_ORG_ID) {
    return providedOrgId;
  }
  return getCurrentOrganizationId(user);
};

export default {
  getCurrentOrganizationId,
  ensureOrganizationId,
  DEFAULT_ORG_ID
};
