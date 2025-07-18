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
