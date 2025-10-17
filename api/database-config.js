// Database configuration for Neon
import { neon } from '@neondatabase/serverless';

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const sql = neon(connectionString);
  return sql;
}
