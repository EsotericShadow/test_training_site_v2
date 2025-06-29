import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE course_categories
    ADD CONSTRAINT unique_course_category_name UNIQUE (name);
  `;
  console.log('✅ Added unique constraint to name column in course_categories table');
}

export async function down() {
  await sql`
    ALTER TABLE course_categories
    DROP CONSTRAINT IF EXISTS unique_course_category_name;
  `;
  console.log('❌ Dropped unique constraint from name column in course_categories table');
}
