/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: database-init.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { config } from 'dotenv';
import { execSync } from 'child_process';

config({ path: '.env.local' });

console.log('Starting database initialization...');

async function initializeDatabase() {
  try {
    console.log('🔗 Running database migrations...');
    // Execute the migration script as a separate process
    execSync('node scripts/migrate.js up', { stdio: 'inherit' });
    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  }
}

initializeDatabase();
