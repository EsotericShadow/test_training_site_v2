import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    CREATE INDEX IF NOT EXISTS idx_course_features_course_id ON course_features (course_id);
  `;
  console.log('✅ Index idx_course_features_course_id created on course_features (course_id)');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses (category_id);
  `;
  console.log('✅ Index idx_courses_category_id created on courses (category_id)');
}

export async function down() {
  await sql`
    DROP INDEX IF EXISTS idx_course_features_course_id;
  `;
  console.log('❌ Index idx_course_features_course_id dropped');

  await sql`
    DROP INDEX IF EXISTS idx_courses_category_id;
  `;
  console.log('❌ Index idx_courses_category_id dropped');
}
