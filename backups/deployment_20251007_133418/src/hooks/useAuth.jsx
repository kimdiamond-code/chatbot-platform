import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const getSession = async () => {
			const { data, error } = await supabase.auth.getUser()
			setUser(data?.user || null)
			setLoading(false)
		}
		getSession()

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user || null)
			setLoading(false)
		})
		return () => {
			subscription?.unsubscribe()
		}
	}, [])

	const signUp = async (email, password, userData) => {
		setLoading(true)
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: userData }
		})
		setLoading(false)
		return { data, error }
	}

	const signIn = async (email, password) => {
		setLoading(true)
		const { data, error } = await supabase.auth.signInWithPassword({ email, password })
		setLoading(false)
		return { data, error }
	}

	const signOut = async () => {
		setLoading(true)
		const { error } = await supabase.auth.signOut()
		setUser(null)
		setLoading(false)
		return { error }
	}

	const updateProfile = async (updates) => {
		const { data, error } = await supabase.auth.updateUser({ data: updates })
		if (data?.user) setUser(data.user)
		return { data, error }
	}

	return (
		<AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) throw new Error('useAuth must be used within AuthProvider')
	return context
}
