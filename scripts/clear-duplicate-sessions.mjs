// scripts/clear-duplicate-sessions.mjs
import { config } from 'dotenv';
import { db } from '../../lib/database.ts';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function clearDuplicateSessions() {
  try {
    console.log('🔧 Starting duplicate session cleanup...');
    
    // First, show current session count
    const [beforeCountRows] = await db.query('SELECT COUNT(*) as count FROM admin_sessions');
    const beforeCount = beforeCountRows[0].count;
    console.log(`📊 Current sessions in database: ${beforeCount}`);
    
    // Find duplicate tokens (if any)
    const [duplicateRows] = await db.query(`
      SELECT token, COUNT(*) as count 
      FROM admin_sessions 
      GROUP BY token 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateRows.length > 0) {
      console.log(`🔍 Found ${duplicateRows.length} duplicate tokens`);
      
      // Keep only the most recent session for each duplicate token
      for (const duplicate of duplicateRows) {
        console.log(`🧹 Cleaning up duplicate token: ${duplicate.token.substring(0, 20)}...`);
        
        // Delete all but the most recent session with this token
        await db.query(`
          DELETE FROM admin_sessions 
          WHERE token = ? 
          AND id NOT IN (
            SELECT id FROM (
              SELECT id FROM admin_sessions 
              WHERE token = ? 
              ORDER BY created_at DESC 
              LIMIT 1
            ) as subquery
          )
        `, [duplicate.token, duplicate.token]);
      }
    } else {
      console.log('✅ No duplicate tokens found');
    }
    
    // Clear all expired sessions
    const [expiredResult] = await db.query(`
      DELETE FROM admin_sessions 
      WHERE expires_at < NOW()
    `);
    console.log(`🗑️ Removed ${expiredResult.affectedRows} expired sessions`);
    
    // Clear very old sessions (older than 7 days)
    const [oldResult] = await db.query(`
      DELETE FROM admin_sessions 
      WHERE created_at < NOW() - INTERVAL 7 DAY
    `);
    console.log(`🗑️ Removed ${oldResult.affectedRows} old sessions (>7 days)`);
    
    // Show final count
    const [afterCountRows] = await db.query('SELECT COUNT(*) as count FROM admin_sessions');
    const afterCount = afterCountRows[0].count;
    console.log(`📊 Sessions after cleanup: ${afterCount}`);
    
    // Reset the sequence to prevent ID conflicts (MySQL auto-increments)
    // No direct equivalent to setval in MySQL for auto-increment columns
    // MySQL handles auto-increment IDs automatically. If needed, you can manually reset with ALTER TABLE.
    console.log('🔄 MySQL handles session ID sequence automatically. No reset needed.');
    
    console.log('✅ Session cleanup completed successfully!');
    console.log('💡 You can now try logging in again.');
    
  } catch (error) {
    console.error('❌ Error during session cleanup:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the cleanup
clearDuplicateSessions();

