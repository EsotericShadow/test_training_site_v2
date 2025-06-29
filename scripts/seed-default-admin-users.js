import { config } from 'dotenv';
config({ path: '.env.local' });

import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

console.log('Starting default admin user seeding...');

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function seedDefaultAdminUsers() {
  try {
    console.log('🔗 Connecting to database...');
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    // Get credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || 'info@karmatraining.com';
    const webmasterUsername = process.env.WEBMASTER_USERNAME || 'webmaster';
    const webmasterPassword = process.env.WEBMASTER_PASSWORD;
    const webmasterEmail = process.env.WEBMASTER_EMAIL || 'webmaster@karmatraining.com';

    if (!adminPassword || !webmasterPassword) {
      console.error('❌ ADMIN_PASSWORD and WEBMASTER_PASSWORD must be set in .env.local');
      process.exit(1);
    }

    // Create admin user
    const existingAdmin = await pool.sql`SELECT 1 FROM admin_users WHERE username = ${adminUsername}`;
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.sql`
        INSERT INTO admin_users (username, password_hash, email, role, force_password_change)
        VALUES (${adminUsername}, ${hashedPassword}, ${adminEmail}, 'admin', TRUE)
      `;
      console.log(`✅ Created admin user: ${adminUsername}`);
    } else {
      console.log(`ℹ️ Admin user ${adminUsername} already exists`);
    }

    // Create webmaster user
    const existingWebmaster = await pool.sql`SELECT 1 FROM admin_users WHERE username = ${webmasterUsername}`;
    if (existingWebmaster.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(webmasterPassword, 10);
      await pool.sql`
        INSERT INTO admin_users (username, password_hash, email, role, force_password_change)
        VALUES (${webmasterUsername}, ${hashedPassword}, ${webmasterEmail}, 'webmaster', FALSE)
      `;
      console.log(`✅ Created webmaster user: ${webmasterUsername}`);
    } else {
      console.log(`ℹ️ Webmaster user ${webmasterUsername} already exists`);
    }

    console.log('🎉 Default admin user seeding complete!');
  } catch (err) {
    console.error('❌ Error seeding default admin users:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

seedDefaultAdminUsers();
