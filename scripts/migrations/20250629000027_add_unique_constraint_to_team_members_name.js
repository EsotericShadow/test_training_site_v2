import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE team_members
    ADD CONSTRAINT unique_team_member_name UNIQUE (name);
  `;
  console.log('✅ Added unique constraint to name column in team_members table');
}

export async function down() {
  await sql`
    ALTER TABLE team_members
    DROP CONSTRAINT IF EXISTS unique_team_member_name;
  `;
  console.log('❌ Dropped unique constraint from name column in team_members table');
}
