// DEPRECATED: Supabase is no longer used
// This file is kept for backward compatibility only
// Authentication now uses: src/hooks/useAuth.jsx
// Data operations use: src/services/databaseService.js (Neon)

console.warn('⚠️ supabase.js is deprecated. Use useAuth hook for authentication.');

// Stub client for backward compatibility
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: new Error('Use useAuth hook') }),
    signUp: async () => ({ data: null, error: new Error('Use useAuth hook') }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: new Error('Use databaseService') }),
    update: () => ({ data: null, error: new Error('Use databaseService') }),
    delete: () => ({ data: null, error: new Error('Use databaseService') })
  })
};

export const getSupabaseClient = () => supabase;

export default supabase;
