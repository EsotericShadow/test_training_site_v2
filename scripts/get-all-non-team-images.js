/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: scripts/get-all-non-team-images.js
 * Description: Retrieves all active images from the database that are not categorized as team photos.
 * Dependencies: @vercel/postgres
 * Created: 2025-07-17
 * Last Modified: 2025-08-02
 * Version: 1.0.1
 */
import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function getAllNonTeamImages() {
  try {
    const { rows } = await sql`SELECT id, filename, blob_url, alt_text, category FROM files WHERE mime_type LIKE 'image/%' AND status = 'active' AND category != 'team-photos' ORDER BY uploaded_at DESC`;
    console.log('Available Non-Team Images in Database:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching non-team images from database:', error);
  }
}

getAllNonTeamImages();
