// scripts/clear-duplicate-sessions.mjs
import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function clearDuplicateSessions() {
  try {
    console.log('🔧 Starting duplicate session cleanup...');
    
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not set!');
      console.error('Please make sure your .env.local file contains the POSTGRES_URL variable.');
      return;
    }
    
    // First, show current session count
    const beforeCount = await sql`SELECT COUNT(*) as count FROM admin_sessions`;
    console.log(`📊 Current sessions in database: ${beforeCount.rows[0].count}`);
    
    // Find duplicate tokens (if any)
    const duplicates = await sql`
      SELECT token, COUNT(*) as count 
      FROM admin_sessions 
      GROUP BY token 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicates.rows.length > 0) {
      console.log(`🔍 Found ${duplicates.rows.length} duplicate tokens`);
      
      // Keep only the most recent session for each duplicate token
      for (const duplicate of duplicates.rows) {
        console.log(`🧹 Cleaning up duplicate token: ${duplicate.token.substring(0, 20)}...`);
        
        // Delete all but the most recent session with this token
        await sql`
          DELETE FROM admin_sessions 
          WHERE token = ${duplicate.token} 
          AND id NOT IN (
            SELECT id FROM admin_sessions 
            WHERE token = ${duplicate.token} 
            ORDER BY created_at DESC 
            LIMIT 1
          )
        `;
      }
    } else {
      console.log('✅ No duplicate tokens found');
    }
    
    // Clear all expired sessions
    const expiredResult = await sql`
      DELETE FROM admin_sessions 
      WHERE expires_at < NOW()
    `;
    console.log(`🗑️ Removed ${expiredResult.rowCount} expired sessions`);
    
    // Clear very old sessions (older than 7 days)
    const oldResult = await sql`
      DELETE FROM admin_sessions 
      WHERE created_at < NOW() - INTERVAL '7 days'
    `;
    console.log(`🗑️ Removed ${oldResult.rowCount} old sessions (>7 days)`);
    
    // Show final count
    const afterCount = await sql`SELECT COUNT(*) as count FROM admin_sessions`;
    console.log(`📊 Sessions after cleanup: ${afterCount.rows[0].count}`);
    
    // Reset the sequence to prevent ID conflicts
    await sql`
      SELECT setval('admin_sessions_id_seq', 
        COALESCE((SELECT MAX(id) FROM admin_sessions), 1), 
        true)
    `;
    console.log('🔄 Reset session ID sequence');
    
    console.log('✅ Session cleanup completed successfully!');
    console.log('💡 You can now try logging in again.');
    
  } catch (error) {
    console.error('❌ Error during session cleanup:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the cleanup
clearDuplicateSessions();

