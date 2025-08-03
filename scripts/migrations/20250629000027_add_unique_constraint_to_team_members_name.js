/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000027_add_unique_constraint_to_team_members_name.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
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
