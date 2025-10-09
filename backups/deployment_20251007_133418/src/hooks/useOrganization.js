import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../services/api'
import { useAuth } from './useAuth'

export const useOrganization = () => {
  const { user } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState(null)

  // Get user's organizations
  const { 
    data: organizations, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: () => organizationService.getUserOrganizations(user?.id),
    enabled: !!user?.id,
  })

  // Set current organization (first one for now, could be enhanced with selection)
  useEffect(() => {
    if (organizations?.data && organizations.data.length > 0) {
      const org = organizations.data[0].organizations;
      setCurrentOrganization(org);
      console.log('🏢 Current organization set:', org.name);
    }
  }, [organizations])

  // Get organization by ID
  const getOrganization = async (orgId) => {
    const { data, error } = await organizationService.getById(orgId);
    return { data, error };
  }

  // Update organization
  const updateOrganization = async (orgId, updates) => {
    const { data, error } = await organizationService.update(orgId, updates);
    if (data && currentOrganization?.id === orgId) {
      setCurrentOrganization(data);
    }
    return { data, error };
  }

  return {
    organizations: organizations?.data || [],
    currentOrganization,
    setCurrentOrganization,
    loading,
    error,
    getOrganization,
    updateOrganization
  }
}

export default useOrganization;
