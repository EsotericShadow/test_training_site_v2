import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ Created schema_migrations table');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS schema_migrations;
  `;
  console.log('❌ Dropped schema_migrations table');
}
