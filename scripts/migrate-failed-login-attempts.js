// migrate-failed-login-attempts.js
// Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now import @vercel/postgres with the environment variables already loaded
import { sql } from '@vercel/postgres';

console.log('🚀 Starting migration: Creating failed_login_attempts table...');

async function createFailedLoginAttemptsTable() {
  try {
    // Test the connection first
    console.log('🔗 Testing database connection...');
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);
    
    // Create the table
    console.log('📋 Creating failed_login_attempts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS failed_login_attempts (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        attempt_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Table created successfully.');
    
    // Create indexes for better performance
    console.log('📊 Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_failed_login_username ON failed_login_attempts(username)
    `;
    console.log('✅ Username index created.');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_failed_login_time ON failed_login_attempts(attempt_time)
    `;
    console.log('✅ Time index created.');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_failed_login_ip ON failed_login_attempts(ip_address)
    `;
    console.log('✅ IP address index created.');
    
    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'failed_login_attempts'
    `;
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful.');
      
      // Show table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'failed_login_attempts'
        ORDER BY ordinal_position
      `;
      
      console.log('📋 Table structure:');
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.error('❌ Table verification failed.');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the migration
createFailedLoginAttemptsTable()
  .then(() => {
    console.log('Migration process finished.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error in migration:', error);
    process.exit(1);
  });

