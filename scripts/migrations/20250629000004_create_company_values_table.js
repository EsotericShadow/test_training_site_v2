import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS company_values (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ company_values table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS company_values;
  `;
  console.log('❌ Dropped company_values table');
}
