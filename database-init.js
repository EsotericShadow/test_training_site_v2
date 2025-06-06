const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Database file path
const dbPath = path.join(process.cwd(), 'karma_cms.db');

console.log('Starting database initialization...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create all tables
function initializeDatabase() {
  db.serialize(() => {
    // Admin users table
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `, (err) => {
      if (err) console.error('Error creating admin_users table:', err);
      else console.log('✅ admin_users table created');
    });

    // Admin sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users (id)
      )
    `, (err) => {
      if (err) console.error('Error creating admin_sessions table:', err);
      else console.log('✅ admin_sessions table created');
    });

    // Company info table
    db.run(`
      CREATE TABLE IF NOT EXISTS company_info (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        company_name TEXT NOT NULL,
        slogan TEXT,
        description TEXT,
        mission TEXT,
        total_experience INTEGER,
        students_trained_count INTEGER,
        established_year INTEGER,
        total_courses INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating company_info table:', err);
      else console.log('✅ company_info table created');
    });

    // Company values table
    db.run(`
      CREATE TABLE IF NOT EXISTS company_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        display_order INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) console.error('Error creating company_values table:', err);
      else console.log('✅ company_values table created');
    });

    // Company why choose us table
    db.run(`
      CREATE TABLE IF NOT EXISTS company_why_choose_us (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        point TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) console.error('Error creating company_why_choose_us table:', err);
      else console.log('✅ company_why_choose_us table created');
    });

    // Course categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS course_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating course_categories table:', err);
      else console.log('✅ course_categories table created');
    });

    // Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        duration TEXT,
        audience TEXT,
        category_id INTEGER,
        popular BOOLEAN DEFAULT 0,
        image_url TEXT,
        image_alt TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES course_categories (id)
      )
    `, (err) => {
      if (err) console.error('Error creating courses table:', err);
      else console.log('✅ courses table created');
    });

    // Course features table
    db.run(`
      CREATE TABLE IF NOT EXISTS course_features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        feature TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating course_features table:', err);
      else console.log('✅ course_features table created');
    });

    // Team members table
    db.run(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        photo_url TEXT,
        experience_years INTEGER,
        specializations TEXT,
        featured BOOLEAN DEFAULT 0,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating team_members table:', err);
      else console.log('✅ team_members table created');
    });

    // Testimonials table
    db.run(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        client_role TEXT NOT NULL,
        company TEXT NOT NULL,
        industry TEXT,
        content TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        client_photo_url TEXT,
        featured BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating testimonials table:', err);
      else console.log('✅ testimonials table created');
    });

    // Hero section table
    db.run(`
      CREATE TABLE IF NOT EXISTS hero_section (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        slogan TEXT,
        main_heading TEXT,
        highlight_text TEXT,
        subtitle TEXT,
        background_image_url TEXT,
        background_image_alt TEXT,
        primary_button_text TEXT,
        primary_button_link TEXT,
        secondary_button_text TEXT,
        secondary_button_link TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating hero_section table:', err);
      else console.log('✅ hero_section table created');
    });

    // Hero stats table
    db.run(`
      CREATE TABLE IF NOT EXISTS hero_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number_text TEXT NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) console.error('Error creating hero_stats table:', err);
      else console.log('✅ hero_stats table created');
    });

    // Hero features table
    db.run(`
      CREATE TABLE IF NOT EXISTS hero_features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) console.error('Error creating hero_features table:', err);
      else console.log('✅ hero_features table created');
      
      // Create admin user after all tables are created
      createDefaultAdmin();
    });
  });
}

// Create admin user
function createDefaultAdmin() {
  const defaultPassword = '1234';
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

  db.run(
    'INSERT OR IGNORE INTO admin_users (username, password_hash, email) VALUES (?, ?, ?)',
    ['admin', hashedPassword, 'admin@karmatraining.com'],
    function(err) {
      if (err) {
        console.error('Error creating default admin:', err.message);
      } else if (this.changes > 0) {
        console.log('✅ Default admin user created:');
        console.log('   Username: admin');
        console.log('   Password: 1234');
      } else {
        console.log('ℹ️  Admin user already exists');
      }
      
      console.log('Database initialization complete');
      db.close((err) => {
        if (err) console.error('Error closing database:', err);
        process.exit(0);
      });
    }
  );
}
