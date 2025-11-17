import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((updatedUser) => {
      setUser(updatedUser)
    })

    return unsubscribe
  }, [])

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const userData = await authService.login(email, password)
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await authService.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin(),
    organizationId: user?.organizationId || null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
