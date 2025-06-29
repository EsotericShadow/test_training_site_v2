import { config } from 'dotenv';
config({ path: '.env.local' });


import bcrypt from 'bcryptjs';

console.log('Starting database initialization...');

// Create a connection pool with explicit connection string
import { migrate } from './scripts/migrate.js';
  

async function initializeDatabase() {
  try {
    console.log('🔗 Running database migrations...');
    await migrate();
    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  }
}

initializeDatabase();