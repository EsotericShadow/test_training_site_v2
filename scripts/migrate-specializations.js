import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { teamMembersOps, sql } from '../lib/database.js';

async function migrateSpecializations() {
  try {
    const teamMembers = await teamMembersOps.getAll();
    for (const member of teamMembers) {
      let updatedSpecs = [];
      if (member.specializations) {
        if (typeof member.specializations === 'string') {
          try {
            const parsed = JSON.parse(member.specializations);
            updatedSpecs = Array.isArray(parsed) ? parsed : [parsed];
          } catch (error) {
            console.error(`Error parsing specializations for team member ${member.id}:`, error);
            updatedSpecs = [member.specializations];
          }
        } else if (Array.isArray(member.specializations)) {
          updatedSpecs = member.specializations;
        }
      }
      await sql`UPDATE team_members SET specializations = ${JSON.stringify(updatedSpecs)} WHERE id = ${member.id}`;
      console.log(`Updated specializations for team member ${member.id}`);
    }
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateSpecializations();