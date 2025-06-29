import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS course_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ course_categories table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS course_categories;
  `;
  console.log('❌ Dropped course_categories table');
}
