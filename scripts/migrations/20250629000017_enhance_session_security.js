/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000017_enhance_session_security.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  // 1. Increase token field size for secure JWT tokens
  await sql`
    ALTER TABLE admin_sessions 
    ALTER COLUMN token TYPE VARCHAR(1000)
  `;
  console.log('✅ Token field size increased to VARCHAR(1000)');

  // 2. Add missing columns
  await sql`
    ALTER TABLE admin_sessions 
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT 'unknown';
  `;
  console.log('✅ Added ip_address column');

  await sql`
    ALTER TABLE admin_sessions 
    ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500) DEFAULT 'unknown';
  `;
  console.log('✅ Added user_agent column');

  await sql`
    ALTER TABLE admin_sessions 
    ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `;
  console.log('✅ Added last_activity column');

  // 3. Add optional security enhancement columns
  await sql`
    ALTER TABLE admin_sessions 
    ADD COLUMN IF NOT EXISTS security_level VARCHAR(20) DEFAULT 'enhanced';
  `;
  console.log('✅ Added security_level column');

  await sql`
    ALTER TABLE admin_sessions 
    ADD COLUMN IF NOT EXISTS device_fingerprint VARCHAR(64);
  `;
  console.log('✅ Added device_fingerprint column');

  // 4. Update existing sessions to have enhanced security level
  await sql`
    UPDATE admin_sessions 
    SET security_level = 'legacy' 
    WHERE security_level IS NULL OR security_level = 'enhanced'
  `;
  console.log('✅ Updated existing sessions to \'legacy\' security level');

  // 5. Add indexes for better performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id 
    ON admin_sessions(user_id);
  `;
  console.log('✅ Added user_id index');

  await sql`
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at 
    ON admin_sessions(expires_at);
  `;
  console.log('✅ Added expires_at index');
}

export async function down() {
  // Revert token field size (if possible, might lose data if tokens are too long)
  // This is a destructive operation if data exceeds new size, so be cautious.
  // For simplicity in down, we'll just drop the columns added.
  await sql`
    ALTER TABLE admin_sessions 
    ALTER COLUMN token TYPE VARCHAR(255);
  `;
  console.log('❌ Reverted token field size to VARCHAR(255) (potential data loss)');

  await sql`
    ALTER TABLE admin_sessions 
    DROP COLUMN IF EXISTS ip_address;
  `;
  console.log('❌ Dropped ip_address column');

  await sql`
    ALTER TABLE admin_sessions 
    DROP COLUMN IF EXISTS user_agent;
  `;
  console.log('❌ Dropped user_agent column');

  await sql`
    ALTER TABLE admin_sessions 
    DROP COLUMN IF EXISTS last_activity;
  `;
  console.log('❌ Dropped last_activity column');

  await sql`
    ALTER TABLE admin_sessions 
    DROP COLUMN IF EXISTS security_level;
  `;
  console.log('❌ Dropped security_level column');

  await sql`
    ALTER TABLE admin_sessions 
    DROP COLUMN IF EXISTS device_fingerprint;
  `;
  console.log('❌ Dropped device_fingerprint column');

  // Drop indexes
  await sql`
    DROP INDEX IF EXISTS idx_admin_sessions_user_id;
  `;
  console.log('❌ Dropped user_id index');

  await sql`
    DROP INDEX IF EXISTS idx_admin_sessions_expires_at;
  `;
  console.log('❌ Dropped expires_at index');
}