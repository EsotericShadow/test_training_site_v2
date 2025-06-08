// scripts/add-contact-fields-migration.mjs
import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Migration to add contact-related fields to company_info table
async function addContactFields() {
  try {
    console.log('🚀 Starting contact fields migration...');
    
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

    // Check if the fields already exist
    console.log('🔍 Checking existing table structure...');
    const tableInfo = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'company_info' 
      AND column_name IN ('phone', 'email', 'location', 'business_hours', 'response_time', 'service_area', 'emergency_availability')
    `;
    
    const existingColumns = tableInfo.rows.map(row => row.column_name);
    console.log('📋 Existing contact columns:', existingColumns);

    // Add phone field if it doesn't exist
    if (!existingColumns.includes('phone')) {
      await sql`ALTER TABLE company_info ADD COLUMN phone VARCHAR(20)`;
      console.log('✅ Added phone column');
    } else {
      console.log('ℹ️ Phone column already exists');
    }

    // Add email field if it doesn't exist
    if (!existingColumns.includes('email')) {
      await sql`ALTER TABLE company_info ADD COLUMN email VARCHAR(100)`;
      console.log('✅ Added email column');
    } else {
      console.log('ℹ️ Email column already exists');
    }

    // Add location field if it doesn't exist
    if (!existingColumns.includes('location')) {
      await sql`ALTER TABLE company_info ADD COLUMN location VARCHAR(200)`;
      console.log('✅ Added location column');
    } else {
      console.log('ℹ️ Location column already exists');
    }

    // Add business_hours field if it doesn't exist
    if (!existingColumns.includes('business_hours')) {
      await sql`ALTER TABLE company_info ADD COLUMN business_hours TEXT`;
      console.log('✅ Added business_hours column');
    } else {
      console.log('ℹ️ Business_hours column already exists');
    }

    // Add response_time field if it doesn't exist
    if (!existingColumns.includes('response_time')) {
      await sql`ALTER TABLE company_info ADD COLUMN response_time VARCHAR(50)`;
      console.log('✅ Added response_time column');
    } else {
      console.log('ℹ️ Response_time column already exists');
    }

    // Add service_area field if it doesn't exist
    if (!existingColumns.includes('service_area')) {
      await sql`ALTER TABLE company_info ADD COLUMN service_area VARCHAR(100)`;
      console.log('✅ Added service_area column');
    } else {
      console.log('ℹ️ Service_area column already exists');
    }

    // Add emergency_availability field if it doesn't exist
    if (!existingColumns.includes('emergency_availability')) {
      await sql`ALTER TABLE company_info ADD COLUMN emergency_availability TEXT`;
      console.log('✅ Added emergency_availability column');
    } else {
      console.log('ℹ️ Emergency_availability column already exists');
    }

    // Insert default contact data if no company info exists
    console.log('📝 Checking for existing company info...');
    const existingInfo = await sql`SELECT id FROM company_info WHERE id = 1`;
    
    if (existingInfo.rows.length === 0) {
      console.log('📝 No existing company info found, inserting default data...');
      await sql`
        INSERT INTO company_info 
        (id, company_name, slogan, description, mission, total_experience, 
         students_trained_count, established_year, total_courses, 
         phone, email, location, business_hours, response_time, service_area, emergency_availability, updated_at)
        VALUES (
          1, 
          'Karma Training', 
          'We believe the choices you make today will define your tomorrow',
          'Established in 2017, we provide premier safety training programs geared to industry and commerce in Northwestern BC. Our experienced team brings over 70 years of combined industrial and educational experience.',
          'Karma Training elected not to have a campus but rather provide training using your company''s facilities on the equipment your staff use in the normal day-to-day operation.',
          70,
          2000,
          2017,
          14,
          '250-615-3727',
          'info@karmatraining.ca',
          'Northwestern British Columbia',
          'Monday - Friday: 8:00 AM - 5:00 PM',
          '24hr',
          'NW BC',
          'Emergency training available on weekends',
          CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Default company info with contact data inserted');
    } else {
      // Update existing record with default contact data if fields are empty
      console.log('📝 Updating existing company info with default contact data...');
      await sql`
        UPDATE company_info 
        SET 
          phone = COALESCE(phone, '250-615-3727'),
          email = COALESCE(email, 'info@karmatraining.ca'),
          location = COALESCE(location, 'Northwestern British Columbia'),
          business_hours = COALESCE(business_hours, 'Monday - Friday: 8:00 AM - 5:00 PM'),
          response_time = COALESCE(response_time, '24hr'),
          service_area = COALESCE(service_area, 'NW BC'),
          emergency_availability = COALESCE(emergency_availability, 'Emergency training available on weekends'),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `;
      console.log('✅ Existing company info updated with default contact data');
    }

    // Verify the migration
    console.log('🔍 Verifying migration...');
    const verifyResult = await sql`
      SELECT phone, email, location, business_hours, response_time, service_area, emergency_availability 
      FROM company_info 
      WHERE id = 1
    `;
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Migration verification successful:');
      console.log('   Phone:', verifyResult.rows[0].phone);
      console.log('   Email:', verifyResult.rows[0].email);
      console.log('   Location:', verifyResult.rows[0].location);
      console.log('   Business Hours:', verifyResult.rows[0].business_hours);
      console.log('   Response Time:', verifyResult.rows[0].response_time);
      console.log('   Service Area:', verifyResult.rows[0].service_area);
      console.log('   Emergency Availability:', verifyResult.rows[0].emergency_availability);
    }

    console.log('🎉 Contact fields migration completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Update your Company Info admin page to include the new contact fields');
    console.log('2. Update the database operations to handle the new fields');
    console.log('3. Replace your contact page with the CMS-driven version');
    console.log('4. Test the admin interface to ensure contact data can be managed');
    
  } catch (error) {
    console.error('❌ Error during contact fields migration:', error);
    console.error('Migration failed. Please check the error above and try again.');
  }
}

// Run the migration
addContactFields();

