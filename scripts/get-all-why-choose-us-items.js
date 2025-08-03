/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: get-all-why-choose-us-items.js
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function getAllWhyChooseUsItems() {
  try {
    const { rows } = await sql`SELECT id, point, image_url, image_alt FROM company_why_choose_us ORDER BY display_order`;
    console.log('All Why Choose Us Items:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching Why Choose Us items:', error);
  }
}

getAllWhyChooseUsItems();
