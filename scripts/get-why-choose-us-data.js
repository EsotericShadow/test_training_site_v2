import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function getWhyChooseUsData() {
  try {
    const { rows } = await sql`SELECT id, point, image_url, image_alt FROM company_why_choose_us ORDER BY display_order`;
    console.log('Current Why Choose Us Data:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching Why Choose Us data:', error);
  }
}

getWhyChooseUsData();
