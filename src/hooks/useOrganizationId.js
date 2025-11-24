import { useAuth } from './useAuth.jsx';

/**
 * Custom hook to safely access organization ID
 * Handles loading states and validates organization context
 * 
 * @returns {Object} { organizationId, loading, error }
 */
export const useOrganizationId = () => {
  const authResult = useAuth();
  
  console.log('🔍 useOrganizationId - Raw useAuth result:', authResult);
  
  const { user, loading } = authResult || {};

  console.log('🔍 useOrganizationId - Extracted:', { user, loading, hasOrgId: !!user?.organizationId });

  // If still loading, return loading state
  if (loading) {
    console.log('⏳ useOrganizationId - Still loading');
    return {
      organizationId: null,
      loading: true,
      error: null
    };
  }

  // If user is loaded but no organization ID, return error
  if (!user) {
    console.log('❌ useOrganizationId - No user');
    return {
      organizationId: null,
      loading: false,
      error: 'Not authenticated. Please log in.'
    };
  }

  if (!user.organizationId) {
    console.error('❌ User object:', user);
    console.error('❌ Missing organizationId in user object');
    return {
      organizationId: null,
      loading: false,
      error: 'Organization context missing. Please log out and log back in.'
    };
  }

  // Success - return organization ID
  console.log('✅ useOrganizationId: Got org ID:', user.organizationId);
  return {
    organizationId: user.organizationId,
    loading: false,
    error: null
  };
};

/**
 * Hook variant that throws error if organization ID is not available
 * Use this in components that absolutely require organization context
 * 
 * @throws {Error} If organization ID is not available
 * @returns {string} organizationId
 */
export const useRequiredOrganizationId = () => {
  const { organizationId, loading, error } = useOrganizationId();

  if (loading) {
    throw new Error('Organization context is loading');
  }

  if (error || !organizationId) {
    throw new Error(error || 'Organization ID is required but not available');
  }

  return organizationId;
};

export default useOrganizationId;
