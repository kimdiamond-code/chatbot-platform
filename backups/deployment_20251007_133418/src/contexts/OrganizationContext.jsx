import React, { createContext, useContext } from 'react'

const OrganizationContext = createContext({})

export const useOrganization = () => {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}

export const OrganizationProvider = ({ children }) => {
  const value = {
    currentOrganization: { id: 'demo', name: 'Demo Organization' }
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}