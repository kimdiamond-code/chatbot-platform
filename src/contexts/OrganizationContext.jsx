import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const OrganizationContext = createContext({})

export const useOrganization = () => {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}

export const OrganizationProvider = ({ children }) => {
  const { user } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState(null)

  useEffect(() => {
    if (user?.organizationId) {
      setCurrentOrganization({
        id: user.organizationId,
        name: user.organizationName || 'Your Organization'
      })
    } else {
      // Fallback to demo organization when not authenticated
      setCurrentOrganization({
        id: 'demo',
        name: 'Demo Organization'
      })
    }
  }, [user])

  const value = {
    currentOrganization,
    organizationId: currentOrganization?.id || 'demo'
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}
