import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// The neon function creates an ultra-fast, serverless HTTP/WebSocket connection to Neon DB
export const sql = neon(process.env.DATABASE_URL);
