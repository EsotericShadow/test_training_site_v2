/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: scripts/database-init.js
 * Description: This script initializes the database by running all pending migrations.
 * Dependencies: @vercel/postgres, fs/promises, path
 * Created: 2025-06-06
 * Last Modified: 2025-08-02
 * Version: 1.0.1
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
