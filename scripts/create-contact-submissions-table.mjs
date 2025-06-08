import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function createContactSubmissionsTable() {
  try {
    console.log('Creating contact_submissions table...');
    
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not set!');
      console.error('Please make sure your .env.local file contains the POSTGRES_URL variable.');
      return;
    }

    // Create the contact_submissions table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        submission_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(254) NOT NULL,
        company VARCHAR(200),
        phone VARCHAR(20),
        training_type VARCHAR(50),
        message TEXT NOT NULL,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ contact_submissions table created successfully!');

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_contact_submissions_training_type ON contact_submissions(training_type);
    `;

    console.log('✅ Indexes created successfully!');

    // Create a trigger to update the updated_at timestamp
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
    `;

    await sql`
      CREATE TRIGGER update_contact_submissions_updated_at
          BEFORE UPDATE ON contact_submissions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    console.log('✅ Update trigger created successfully!');

    // Verify the table was created
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'contact_submissions'
      ORDER BY ordinal_position;
    `;

    console.log('\n📋 Table structure:');
    console.table(result.rows);

    console.log('\n🎉 Contact submissions table setup complete!');
    console.log('You can now use the secure contact form to store submissions in the database.');

  } catch (error) {
    console.error('❌ Error creating contact_submissions table:', error);
  }
}

// Run the function
createContactSubmissionsTable();

