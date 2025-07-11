import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS course_features (
      id SERIAL PRIMARY KEY,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      feature TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );
  `;
  console.log('✅ course_features table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS course_features;
  `;
  console.log('❌ Dropped course_features table');
}
