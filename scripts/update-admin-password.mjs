// scripts/update-admin-password.mjs
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Define a strong password that meets our validation requirements
const newPassword = 'Admin@123456'; // This is just an example - you should use a different password

// Generate a hash for the new password
const saltRounds = 12; // Higher is more secure but slower
const passwordHash = bcrypt.hashSync(newPassword, saltRounds);

// Update the admin user's password in the database
async function updateAdminPassword() {
  try {
    console.log('Attempting to update admin password...');
    
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not set!');
      console.error('Please make sure your .env.local file contains the POSTGRES_URL variable.');
      return;
    }
    
    const result = await sql`UPDATE admin_users SET password_hash = ${passwordHash} WHERE username = 'admin'`;
    
    if (result.rowCount > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log(`New password: ${newPassword}`);
      console.log('Please store this password securely and change it after first login.');
    } else {
      console.error('❌ No admin user found to update.');
    }
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  }
}

// Run the function
updateAdminPassword();
