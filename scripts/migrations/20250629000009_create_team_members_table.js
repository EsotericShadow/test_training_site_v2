import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      photo_url TEXT,
      experience_years INTEGER,
      specializations TEXT,
      featured BOOLEAN DEFAULT FALSE,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ team_members table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS team_members;
  `;
  console.log('❌ Dropped team_members table');
}
