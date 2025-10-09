export const useAuth = () => {
  return {
    user: null,
    loading: false,
    signIn: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => {}
  }
}

