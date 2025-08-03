/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: 20250629000024_add_contact_fields_to_company_info.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';

export async function up() {
  await sql`
    ALTER TABLE company_info
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS business_hours TEXT,
    ADD COLUMN IF NOT EXISTS response_time TEXT,
    ADD COLUMN IF NOT EXISTS service_area TEXT,
    ADD COLUMN IF NOT EXISTS emergency_availability TEXT;
  `;
  console.log('✅ Added contact fields to company_info table');
}

export async function down() {
  await sql`
    ALTER TABLE company_info
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS location,
    DROP COLUMN IF EXISTS business_hours,
    DROP COLUMN IF EXISTS response_time,
    DROP COLUMN IF EXISTS service_area,
    DROP COLUMN IF EXISTS emergency_availability;
  `;
  console.log('❌ Dropped contact fields from company_info table');
}
