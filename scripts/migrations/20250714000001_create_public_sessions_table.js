// scripts/migrations/20250714000001_create_public_sessions_table.js
import { sql } from '@vercel/postgres';

export async function up() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public_sessions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE
      );
    `;
    console.log('Table "public_sessions" created successfully.');
  } catch (error) {
    console.error('Error creating "public_sessions" table:', error);
    throw error;
  }
}

export async function down() {
  try {
    await sql`DROP TABLE IF EXISTS public_sessions;`;
    console.log('Table "public_sessions" dropped successfully.');
  } catch (error) {
    console.error('Error dropping "public_sessions" table:', error);
    throw error;
  }
}