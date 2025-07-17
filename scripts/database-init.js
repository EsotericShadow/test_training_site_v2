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
