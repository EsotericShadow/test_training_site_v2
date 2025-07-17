import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE csrf_tokens (
      id SERIAL PRIMARY KEY,
      session_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}
