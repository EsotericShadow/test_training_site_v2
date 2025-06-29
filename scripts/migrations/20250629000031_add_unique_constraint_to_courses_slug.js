import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE courses
    ADD CONSTRAINT unique_course_slug UNIQUE (slug);
  `;
  console.log('✅ Added unique constraint to slug column in courses table');
}

export async function down() {
  await sql`
    ALTER TABLE courses
    DROP CONSTRAINT IF EXISTS unique_course_slug;
  `;
  console.log('❌ Dropped unique constraint from slug column in courses table');
}
