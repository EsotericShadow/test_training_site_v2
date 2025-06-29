import { config } from 'dotenv';
import { createPool } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'migrations');

const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

async function ensureMigrationsTable() {
  await pool.sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function getAppliedMigrations() {
  const result = await pool.sql`SELECT name FROM schema_migrations ORDER BY name`;
  return new Set(result.rows.map(row => row.name));
}

async function getMigrationFiles() {
  const files = await fs.readdir(migrationsDir);
  return files.filter(file => file.endsWith('.js')).sort();
}

async function runMigration(migrationFile, direction) {
  const migrationPath = path.join(migrationsDir, migrationFile);
  const migration = await import(migrationPath);

  if (typeof migration[direction] !== 'function') {
    throw new Error(`Migration ${migrationFile} does not export a ${direction} function.`);
  }

  console.log(`Running ${direction} for migration: ${migrationFile}`);
  await migration[direction]();
}

export async function migrate() {
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  const migrationFiles = await getMigrationFiles();

  const pendingMigrations = migrationFiles.filter(
    file => !appliedMigrations.has(file)
  );

  if (pendingMigrations.length === 0) {
    console.log('✅ No pending migrations.');
    return;
  }

  console.log(`Found ${pendingMigrations.length} pending migrations.`);

  for (const migrationFile of pendingMigrations) {
    try {
      await runMigration(migrationFile, 'up');
      await pool.sql`INSERT INTO schema_migrations (name) VALUES (${migrationFile})`;
      console.log(`✅ Successfully applied ${migrationFile}`);
    } catch (error) {
      console.error(`❌ Failed to apply migration ${migrationFile}:`, error);
      process.exit(1);
    }
  }
  console.log('🎉 All migrations applied successfully!');
}

async function rollback() {
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();

  if (appliedMigrations.size === 0) {
    console.log('ℹ️ No migrations to roll back.');
    return;
  }

  const lastMigration = Array.from(appliedMigrations).pop();
  try {
    await runMigration(lastMigration, 'down');
    await pool.sql`DELETE FROM schema_migrations WHERE name = ${lastMigration}`;;
    console.log(`✅ Successfully rolled back ${lastMigration}`);
  } catch (error) {
    console.error(`❌ Failed to roll back migration ${lastMigration}:`, error);
    process.exit(1);
  }
}

async function status() {
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  const migrationFiles = await getMigrationFiles();

  console.log('\n--- Migration Status ---');
  if (migrationFiles.length === 0) {
    console.log('No migration files found.');
  }

  for (const file of migrationFiles) {
    const status = appliedMigrations.has(file) ? 'APPLIED' : 'PENDING';
    console.log(`[${status}] ${file}`);
  }
  console.log('------------------------\n');
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
        await migrate();
        break;
      case 'down':
        await rollback();
        break;
      case 'status':
        await status();
        break;
      default:
        console.log('Usage: node scripts/migrate.js [up|down|status]');
        process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// main();