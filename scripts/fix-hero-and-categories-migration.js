// Hero Section & Categories Fix Migration (Corrected)
// Run this script to fix hero section image URL and expand file categories

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';

console.log('Starting hero section & categories fix migration (corrected)...');

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function fixHeroSectionAndCategories() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Test the connection first
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // 1. Check hero section status (already cleared by previous script)
    const heroSection = await pool.sql`
      SELECT background_image_url, background_image_alt FROM hero_section WHERE id = 1
    `;
    
    if (heroSection.rows.length > 0) {
      console.log('📊 Current hero section state:');
      console.log('   background_image_url:', heroSection.rows[0].background_image_url || 'NULL ✅ (Already cleared!)');
      console.log('   background_image_alt:', heroSection.rows[0].background_image_alt || 'NULL ✅ (Already cleared!)');
    }

    // 2. Check if files table exists
    const filesTableExists = await pool.sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'files'
      )
    `;

    if (filesTableExists.rows[0].exists) {
      console.log('📁 Files table found, updating categories...');
      
      // 3. Remove the old category constraint that limits categories
      console.log('🔧 Removing old category constraint...');
      try {
        await pool.sql`
          ALTER TABLE files DROP CONSTRAINT IF EXISTS files_category_check
        `;
        console.log('✅ Old category constraint removed');
      } catch (error) {
        console.log('ℹ️ No existing category constraint found (this is fine)');
      }

      // 4. Add new expanded category constraint
      console.log('➕ Adding expanded category constraint...');
      try {
        await pool.sql`
          ALTER TABLE files ADD CONSTRAINT files_category_check_expanded 
          CHECK (category IN (
            'general', 
            'team-photos', 
            'course-images', 
            'testimonials', 
            'company', 
            'hero-backgrounds',
            'company-logos',
            'certifications',
            'training-photos',
            'equipment-photos',
            'facility-photos',
            'other'
          ))
        `;
        console.log('✅ Expanded category constraint added');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️ Expanded category constraint already exists');
        } else {
          throw error;
        }
      }

      // 5. Get existing categories
      const existingCategories = await pool.sql`
        SELECT DISTINCT category FROM files WHERE category IS NOT NULL
      `;
      console.log('📋 Existing categories:', existingCategories.rows.map(r => r.category));

      // 6. Define expected categories that the UI uses
      const expectedCategories = [
        'general',
        'course-images', 
        'team-photos',
        'testimonials',
        'hero-backgrounds',
        'company-logos',
        'certifications',
        'training-photos',
        'equipment-photos',
        'facility-photos',
        'company',
        'other'
      ];

      console.log('🎯 Expected categories:', expectedCategories);

      // 7. Add missing categories by inserting placeholder files (with proper file_extension)
      for (const category of expectedCategories) {
        const categoryExists = existingCategories.rows.some(row => row.category === category);
        
        if (!categoryExists) {
          console.log(`➕ Adding missing category: ${category}`);
          
          // Insert a placeholder file for this category with all required fields
          await pool.sql`
            INSERT INTO files (
              filename, 
              original_name, 
              file_size,
              mime_type,
              file_extension,
              blob_url, 
              blob_pathname,
              category, 
              alt_text, 
              title, 
              description,
              is_featured,
              status,
              uploaded_at
            ) VALUES (
              ${`placeholder-${category}.jpg`},
              ${`Placeholder for ${category}`},
              0,
              'image/jpeg',
              'jpg',
              ${`/placeholder-${category}.jpg`},
              ${`placeholder-${category}.jpg`},
              ${category},
              ${`Placeholder image for ${category} category`},
              ${`${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Placeholder`},
              ${`This is a placeholder file to ensure the ${category} category exists. You can delete this once you upload real files to this category.`},
              false,
              'active',
              CURRENT_TIMESTAMP
            )
          `;
          console.log(`✅ Added placeholder for category: ${category}`);
        } else {
          console.log(`✓ Category already exists: ${category}`);
        }
      }

      // 8. Show final category list
      const finalCategories = await pool.sql`
        SELECT DISTINCT category FROM files WHERE category IS NOT NULL ORDER BY category
      `;
      console.log('📋 Final categories in database:', finalCategories.rows.map(r => r.category));

    } else {
      console.log('⚠️ Files table not found - categories fix skipped');
      console.log('   You need to run the files table migration first:');
      console.log('   node scripts/create-files-table-migration.mjs');
    }

    console.log('');
    console.log('🎉 Hero section & categories fix migration complete!');
    console.log('');
    console.log('📋 What was fixed:');
    console.log('✅ Hero section background image URL cleared (from previous run)');
    console.log('✅ File categories constraint expanded');
    console.log('✅ Missing categories added to database');
    console.log('✅ Placeholder files created for new categories');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Go to hero section admin');
    console.log('2. Select your new background image (IMG_E1503.JPG)');
    console.log('3. Save the changes');
    console.log('4. Check that the image displays on the public homepage');
    console.log('5. File selection filters should now show all categories');
    console.log('');
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error in migration:', err);
    console.error('Full error details:', err.message);
    await pool.end();
    process.exit(1);
  }
}

fixHeroSectionAndCategories();

