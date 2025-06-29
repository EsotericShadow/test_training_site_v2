import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration TEXT,
      audience TEXT,
      category_id INTEGER REFERENCES course_categories(id),
      popular BOOLEAN DEFAULT FALSE,
      image_url TEXT,
      image_alt TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ courses table created');
}

export async function down() {
  await sql`
    DROP TABLE IF EXISTS courses;
  `;
  console.log('❌ Dropped courses table');
}
