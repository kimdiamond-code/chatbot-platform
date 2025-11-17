import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	// Fetch full user data including organization_id from Neon database
	const loadFullUserData = async (supabaseUser) => {
		if (!supabaseUser) {
			setUser(null)
			return
		}

		try {
			console.log('🔍 Loading full user data for:', supabaseUser.email)
			
			// Fetch from Neon database (not Supabase) via API
			const response = await fetch('/api/consolidated', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					endpoint: 'auth',
					action: 'get_user_by_email',
					email: supabaseUser.email
				})
			})

			if (!response.ok) {
				console.error('❌ API request failed:', response.status)
				console.log('⚠️ Using Supabase user only (no organization data)')
				setUser(supabaseUser)
				return
			}

			const { success, agent } = await response.json()

			if (!success || !agent) {
				console.warn('⚠️ No agent record found in Neon database for:', supabaseUser.email)
				console.log('🛠️ This user needs an agent record created in the database')
				console.log('📝 Run this SQL in Neon:')
				console.log(`INSERT INTO agents (organization_id, email, name, role, is_active) VALUES (gen_random_uuid(), '${supabaseUser.email}', '${supabaseUser.email.split('@')[0]}', 'admin', true);`)
				
				// Use Supabase user as fallback but mark as incomplete
				const fallbackUser = {
					...supabaseUser,
					organization_id: null,
					role: 'user',
					name: supabaseUser.email,
					_incomplete: true,
					_error: 'No agent record in Neon database'
				}
				setUser(fallbackUser)
				return
			}

			// Merge Supabase user with agent data from Neon
			const fullUser = {
				...supabaseUser,
				id: agent.id,
				organization_id: agent.organization_id,
				role: agent.role,
				name: agent.name
			}

			console.log('✅ Loaded full user:', {
				email: fullUser.email,
				organization_id: fullUser.organization_id,
				role: fullUser.role
			})

			setUser(fullUser)
		} catch (error) {
			console.error('❌ Error in loadFullUserData:', error)
			console.log('⚠️ Using Supabase user only (error occurred)')
			setUser(supabaseUser) // Fallback
		}
	}

	useEffect(() => {
		const getSession = async () => {
			const { data, error } = await supabase.auth.getUser()
			await loadFullUserData(data?.user)
			setLoading(false)
		}
		getSession()

		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
			await loadFullUserData(session?.user)
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
		
		if (!error && data?.user) {
			// Load full user data including organization_id
			await loadFullUserData(data.user)
		}
		
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
