import { useState, useEffect, useContext, createContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	// Load user from localStorage on mount
	useEffect(() => {
		const loadUser = async () => {
			try {
				const storedToken = localStorage.getItem('auth_token')
				const storedUser = localStorage.getItem('auth_user')

				if (storedToken && storedUser) {
					const userData = JSON.parse(storedUser)
					console.log('🔍 Loading stored user:', userData.email)
					
					// Fetch fresh organization data from Neon
					const response = await fetch('/api/consolidated', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							endpoint: 'auth',
							action: 'get_user_by_email',
							email: userData.email
						})
					})

					if (response.ok) {
						const { success, agent } = await response.json()
						
						if (success && agent) {
							const fullUser = {
								...userData,
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
						} else {
							console.warn('⚠️ No agent record found for stored user')
							// Keep basic user data but flag as incomplete
							setUser({
								...userData,
								_incomplete: true,
								_error: 'No agent record in Neon database'
							})
						}
					} else {
						console.warn('⚠️ Failed to fetch user data from API')
						setUser(userData) // Use cached data
					}
				} else {
					console.log('👤 No stored auth found')
				}
			} catch (error) {
				console.error('❌ Error loading user:', error)
			} finally {
				setLoading(false)
			}
		}

		loadUser()
	}, [])

	const signIn = async (email, password) => {
		setLoading(true)
		try {
			const response = await fetch('/api/consolidated', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					endpoint: 'auth',
					action: 'login',
					email,
					password
				})
			})

			const data = await response.json()

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Login failed')
			}

			// Store auth data
			localStorage.setItem('auth_token', data.token)
			localStorage.setItem('auth_user', JSON.stringify(data.user))

			console.log('✅ Login successful:', {
				email: data.user.email,
				organization_id: data.user.organization_id,
				role: data.user.role
			})

			setUser(data.user)
			setLoading(false)
			
			return { data: data.user, error: null }
		} catch (error) {
			console.error('❌ Login error:', error)
			setLoading(false)
			return { data: null, error }
		}
	}

	const signUp = async (email, password, userData) => {
		setLoading(true)
		try {
			const response = await fetch('/api/consolidated', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					endpoint: 'auth',
					action: 'signup',
					email,
					password,
					name: userData?.name || email.split('@')[0]
				})
			})

			const data = await response.json()

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Signup failed')
			}

			// Store auth data
			localStorage.setItem('auth_token', data.token)
			localStorage.setItem('auth_user', JSON.stringify(data.user))

			console.log('✅ Signup successful:', data.user.email)

			setUser(data.user)
			setLoading(false)
			
			return { data: data.user, error: null }
		} catch (error) {
			console.error('❌ Signup error:', error)
			setLoading(false)
			return { data: null, error }
		}
	}

	const signOut = async () => {
		setLoading(true)
		
		// Clear local storage
		localStorage.removeItem('auth_token')
		localStorage.removeItem('auth_user')
		
		// Optionally call API to invalidate token
		try {
			const token = localStorage.getItem('auth_token')
			if (token) {
				await fetch('/api/consolidated', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						endpoint: 'auth',
						action: 'logout',
						token
					})
				})
			}
		} catch (error) {
			console.error('Logout API error:', error)
		}
		
		setUser(null)
		setLoading(false)
		
		return { error: null }
	}

	const updateProfile = async (updates) => {
		try {
			// Update local user state
			const updatedUser = { ...user, ...updates }
			setUser(updatedUser)
			localStorage.setItem('auth_user', JSON.stringify(updatedUser))
			
			return { data: { user: updatedUser }, error: null }
		} catch (error) {
			return { data: null, error }
		}
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
