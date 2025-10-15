// Database Configuration
import { neon } from '@neondatabase/serverless';

let sql = null;

export const initializeDatabase = () => {
  try {
    if (!sql) {
      const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
      if (!dbUrl) {
        throw new Error('Database URL not configured');
      }
      sql = neon(dbUrl);
      console.log('✅ Database connection initialized');
    }
    return sql;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!sql) {
    return initializeDatabase();
  }
  return sql;
};

export default {
  initializeDatabase,
  getDatabase
};