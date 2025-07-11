import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE hero_features
    ADD CONSTRAINT unique_hero_features_title UNIQUE (title);
  `;
  console.log('✅ Added unique constraint to title column in hero_features table');
}

export async function down() {
  await sql`
    ALTER TABLE hero_features
    DROP CONSTRAINT IF EXISTS unique_hero_features_title;
  `;
  console.log('❌ Dropped unique constraint from title column in hero_features table');
}
