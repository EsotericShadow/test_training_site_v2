import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE admin_users
    ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;
  `;
  console.log('✅ Added token_version to admin_users table');
}

export async function down() {
  await sql`
    ALTER TABLE admin_users
    DROP COLUMN IF EXISTS token_version;
  `;
  console.log('❌ Dropped token_version from admin_users table');
}
