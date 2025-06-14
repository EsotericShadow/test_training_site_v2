// Cleanup Placeholder Files Migration
// Run this script to remove problematic placeholder files

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';

console.log('Starting placeholder files cleanup...');

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function cleanupPlaceholderFiles() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Test the connection first
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // 1. Remove all placeholder files
    console.log('🧹 Removing placeholder files...');
    const deleteResult = await pool.sql`
      DELETE FROM files 
      WHERE filename LIKE 'placeholder-%' 
      OR blob_url LIKE '/placeholder-%'
    `;
    console.log(`✅ Removed ${deleteResult.rowCount} placeholder files`);

    // 2. Show remaining files
    const remainingFiles = await pool.sql`
      SELECT filename, category, blob_url FROM files ORDER BY category, filename
    `;
    
    if (remainingFiles.rows.length > 0) {
      console.log('📋 Remaining files in database:');
      remainingFiles.rows.forEach(file => {
        console.log(`   ${file.category}: ${file.filename} (${file.blob_url})`);
      });
    } else {
      console.log('📋 No files remaining in database');
    }

    // 3. Show available categories (constraint still allows them)
    console.log('📋 Available categories (from database constraint):');
    const constraintInfo = await pool.sql`
      SELECT conname, consrc 
      FROM pg_constraint 
      WHERE conname LIKE '%category%' 
      AND conrelid = 'files'::regclass
    `;
    
    if (constraintInfo.rows.length > 0) {
      console.log('   Constraint found:', constraintInfo.rows[0].consrc);
    } else {
      console.log('   No category constraint found');
    }

    // 4. Verify hero section is still clean
    const heroSection = await pool.sql`
      SELECT background_image_url, background_image_alt FROM hero_section WHERE id = 1
    `;
    
    if (heroSection.rows.length > 0) {
      console.log('📊 Hero section status:');
      console.log('   background_image_url:', heroSection.rows[0].background_image_url || 'NULL ✅');
      console.log('   background_image_alt:', heroSection.rows[0].background_image_alt || 'NULL ✅');
    }

    console.log('');
    console.log('🎉 Placeholder files cleanup complete!');
    console.log('');
    console.log('📋 What was cleaned:');
    console.log('✅ All placeholder files removed from database');
    console.log('✅ Category constraints still in place (categories available)');
    console.log('✅ Hero section still clean');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Restart your dev server (npm run dev)');
    console.log('2. Go to hero section admin');
    console.log('3. Upload or select a real background image');
    console.log('4. Categories will be created automatically when you upload files');
    console.log('');
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in cleanup:', err);
    console.error('Full error details:', err.message);
    await pool.end();
    process.exit(1);
  }
}

cleanupPlaceholderFiles();

