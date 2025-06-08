// scripts/enhance-session-security.mjs
import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

console.log('🔐 Starting session security enhancement migration...');

async function enhanceSessionSecurity() {
  try {
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not set!');
      console.error('Please make sure your .env.local file contains the POSTGRES_URL variable.');
      return;
    }

    console.log('🔗 Connecting to database...');
    
    // Test the connection first
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // Check current token field size
    console.log('🔍 Checking current admin_sessions table structure...');
    const currentSchema = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions' 
      AND column_name IN ('token', 'ip_address', 'user_agent')
      ORDER BY column_name
    `;
    
    console.log('📋 Current schema:');
    currentSchema.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`);
    });

    // 1. Increase token field size for secure JWT tokens
    console.log('🔧 Increasing token field size to accommodate secure JWT tokens...');
    await sql`
      ALTER TABLE admin_sessions 
      ALTER COLUMN token TYPE VARCHAR(1000)
    `;
    console.log('✅ Token field size increased to VARCHAR(1000)');

    // 2. Add missing columns if they don't exist
    console.log('🔧 Adding security tracking columns...');
    
    // Check if ip_address column exists
    const ipAddressExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions' 
      AND column_name = 'ip_address'
    `;
    
    if (ipAddressExists.rows.length === 0) {
      await sql`
        ALTER TABLE admin_sessions 
        ADD COLUMN ip_address VARCHAR(45) DEFAULT 'unknown'
      `;
      console.log('✅ Added ip_address column');
    } else {
      console.log('ℹ️ ip_address column already exists');
    }

    // Check if user_agent column exists
    const userAgentExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions' 
      AND column_name = 'user_agent'
    `;
    
    if (userAgentExists.rows.length === 0) {
      await sql`
        ALTER TABLE admin_sessions 
        ADD COLUMN user_agent VARCHAR(500) DEFAULT 'unknown'
      `;
      console.log('✅ Added user_agent column');
    } else {
      console.log('ℹ️ user_agent column already exists');
    }

    // Check if last_activity column exists
    const lastActivityExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions' 
      AND column_name = 'last_activity'
    `;
    
    if (lastActivityExists.rows.length === 0) {
      await sql`
        ALTER TABLE admin_sessions 
        ADD COLUMN last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `;
      console.log('✅ Added last_activity column');
    } else {
      console.log('ℹ️ last_activity column already exists');
    }

    // 3. Add optional security enhancement columns
    console.log('🔧 Adding optional security enhancement columns...');
    
    // Add security level tracking
    const securityLevelExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions' 
      AND column_name = 'security_level'
    `;
    
    if (securityLevelExists.rows.length === 0) {
      await sql`
        ALTER TABLE admin_sessions 
        ADD COLUMN security_level VARCHAR(20) DEFAULT 'enhanced'
      `;
      console.log('✅ Added security_level column');
    } else {
      console.log('ℹ️ security_level column already exists');
    }

    // Add device fingerprint hash (optional)
    const deviceFingerprintExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions' 
      AND column_name = 'device_fingerprint'
    `;
    
    if (deviceFingerprintExists.rows.length === 0) {
      await sql`
        ALTER TABLE admin_sessions 
        ADD COLUMN device_fingerprint VARCHAR(64)
      `;
      console.log('✅ Added device_fingerprint column');
    } else {
      console.log('ℹ️ device_fingerprint column already exists');
    }

    // 4. Update existing sessions to have enhanced security level
    console.log('🔧 Updating existing sessions...');
    const updateResult = await sql`
      UPDATE admin_sessions 
      SET security_level = 'legacy' 
      WHERE security_level IS NULL OR security_level = 'enhanced'
    `;
    console.log(`✅ Updated ${updateResult.rowCount} existing sessions to 'legacy' security level`);

    // 5. Add indexes for better performance
    console.log('🔧 Adding performance indexes...');
    
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id 
        ON admin_sessions(user_id)
      `;
      console.log('✅ Added user_id index');
    } catch (error) {
      console.log('ℹ️ user_id index already exists or error:', error.message);
    }

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at 
        ON admin_sessions(expires_at)
      `;
      console.log('✅ Added expires_at index');
    } catch (error) {
      console.log('ℹ️ expires_at index already exists or error:', error.message);
    }

    // 6. Show final schema
    console.log('📋 Final admin_sessions table structure:');
    const finalSchema = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'admin_sessions' 
      ORDER BY ordinal_position
    `;
    
    finalSchema.rows.forEach(row => {
      const length = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = row.column_default ? ` DEFAULT ${row.column_default}` : '';
      console.log(`   ${row.column_name}: ${row.data_type}${length} ${nullable}${defaultVal}`);
    });

    console.log('🎉 Session security enhancement migration completed successfully!');
    console.log('');
    console.log('📝 Summary of changes:');
    console.log('   ✅ Token field increased to VARCHAR(1000) for secure JWT tokens');
    console.log('   ✅ Added/verified ip_address, user_agent, last_activity columns');
    console.log('   ✅ Added security_level and device_fingerprint tracking');
    console.log('   ✅ Added performance indexes');
    console.log('   ✅ Updated existing sessions to legacy security level');
    console.log('');
    console.log('🔐 Your database is now ready for enhanced session security!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Please check your database connection and try again.');
    process.exit(1);
  }
}

// Run the migration
enhanceSessionSecurity();

