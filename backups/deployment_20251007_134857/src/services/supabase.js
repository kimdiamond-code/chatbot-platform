// ⚠️ SUPABASE HAS BEEN REMOVED - MIGRATED TO NEON DATABASE
// This file exists only for backwards compatibility during migration
// All database operations now use /services/databaseService.js with Neon PostgreSQL

// Stub export to prevent build errors from old imports
export const getSupabaseClient = () => {
  console.warn('⚠️ getSupabaseClient() called but Supabase has been removed. Use dbService instead.');
  return null;
};

export const supabase = null;

export default null;
