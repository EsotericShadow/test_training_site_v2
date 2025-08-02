import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { adminUsersOps } from '../lib/database.js';
import { logger } from '../lib/logger.js';

// Load environment variables
config({ path: '.env.local' });

async function seedAdminUsers() {
  logger.info('Starting admin user seeding...');

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // This will be hashed
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@karmatraining.com';

  const WEBMASTER_USERNAME = process.env.WEBMASTER_USERNAME || 'webmaster';
  const WEBMASTER_PASSWORD = process.env.WEBMASTER_PASSWORD; // This will be hashed
  const WEBMASTER_EMAIL = process.env.WEBMASTER_EMAIL || 'gabriel.lacroix94@icloud.com';

  if (!ADMIN_PASSWORD || !WEBMASTER_PASSWORD) {
    logger.error('ADMIN_PASSWORD and WEBMASTER_PASSWORD environment variables are required for seeding.');
    process.exit(1);
  }

  try {
    // Check if admin user already exists
    let adminUser = await adminUsersOps.getByUsername(ADMIN_USERNAME);
    if (adminUser) {
      logger.info(`Admin user '${ADMIN_USERNAME}' already exists. Skipping creation.`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await adminUsersOps.create({
        username: ADMIN_USERNAME,
        password_hash: hashedPassword,
        email: ADMIN_EMAIL,
        role: 'admin',
        force_password_change: true, // Force password change for initial admin
      });
      logger.info(`Admin user '${ADMIN_USERNAME}' created successfully.`);
    }

    // Check if webmaster user already exists
    let webmasterUser = await adminUsersOps.getByUsername(WEBMASTER_USERNAME);
    if (webmasterUser) {
      logger.info(`Webmaster user '${WEBMASTER_USERNAME}' already exists. Skipping creation.`);
    } else {
      const hashedPassword = await bcrypt.hash(WEBMASTER_PASSWORD, 10);
      await adminUsersOps.create({
        username: WEBMASTER_USERNAME,
        password_hash: hashedPassword,
        email: WEBMASTER_EMAIL,
        role: 'webmaster',
        force_password_change: false,
      });
      logger.info(`Webmaster user '${WEBMASTER_USERNAME}' created successfully.`);
    }

    logger.info('Admin user seeding complete.');
  } catch (error) {
    logger.error('Error seeding admin users:', error);
    process.exit(1);
  } finally {
    // It's good practice to close the database connection if it's not managed by the app lifecycle
    // For mysql2/promise pool, it might be better to let the process exit or manage it globally.
    // If using a global pool, ensure it's closed when the app shuts down.
  }
}

seedAdminUsers();
