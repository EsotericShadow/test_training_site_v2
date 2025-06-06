import sqlite3 from 'sqlite3';
import path from 'path';

const verboseSqlite3 = sqlite3.verbose();

// Database connection
const dbPath = path.join(process.cwd(), 'karma_cms.db');

let db;

// Initialize database connection
function getDb() {
  if (!db) {
    db = new verboseSqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      }
    });
  }
  return db;
}

// Promisify database operations
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Company Info operations
const companyInfoOps = {
  get: () => dbGet('SELECT * FROM company_info WHERE id = 1'),
  upsert: (data) => {
    const sql = `
      INSERT OR REPLACE INTO company_info 
      (id, company_name, slogan, description, mission, total_experience, 
       students_trained_count, established_year, total_courses, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    return dbRun(sql, [
      data.company_name, data.slogan, data.description, data.mission,
      data.total_experience, data.students_trained_count, 
      data.established_year, data.total_courses
    ]);
  }
};

// Company Values operations
const companyValuesOps = {
  getAll: () => dbAll('SELECT * FROM company_values ORDER BY display_order'),
  create: (data) => {
    const sql = 'INSERT INTO company_values (title, description, icon, display_order) VALUES (?, ?, ?, ?)';
    return dbRun(sql, [data.title, data.description, data.icon, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE company_values SET title = ?, description = ?, icon = ?, display_order = ? WHERE id = ?';
    return dbRun(sql, [data.title, data.description, data.icon, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM company_values WHERE id = ?', [id]),
  deleteAll: () => dbRun('DELETE FROM company_values')
};

// Why Choose Us operations
const whyChooseUsOps = {
  getAll: () => dbAll('SELECT * FROM company_why_choose_us ORDER BY display_order'),
  create: (data) => {
    const sql = 'INSERT INTO company_why_choose_us (point, display_order) VALUES (?, ?)';
    return dbRun(sql, [data.point, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE company_why_choose_us SET point = ?, display_order = ? WHERE id = ?';
    return dbRun(sql, [data.point, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM company_why_choose_us WHERE id = ?', [id]),
  deleteAll: () => dbRun('DELETE FROM company_why_choose_us')
};

// Course Categories operations
const courseCategoriesOps = {
  getAll: () => dbAll('SELECT * FROM course_categories ORDER BY display_order'),
  getById: (id) => dbGet('SELECT * FROM course_categories WHERE id = ?', [id]),
  create: (data) => {
    const sql = 'INSERT INTO course_categories (name, description, display_order) VALUES (?, ?, ?)';
    return dbRun(sql, [data.name, data.description, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE course_categories SET name = ?, description = ?, display_order = ? WHERE id = ?';
    return dbRun(sql, [data.name, data.description, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM course_categories WHERE id = ?', [id])
};

// Courses operations
const coursesOps = {
  getAll: () => {
    const sql = `
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      ORDER BY c.created_at DESC
    `;
    return dbAll(sql);
  },
  getById: (id) => {
    const sql = `
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.id = ?
    `;
    return dbGet(sql, [id]);
  },
  getBySlug: (slug) => {
    const sql = `
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.slug = ?
    `;
    return dbGet(sql, [slug]);
  },
  create: (data) => {
    const sql = `
      INSERT INTO courses 
      (slug, title, description, duration, audience, category_id, popular, image_url, image_alt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return dbRun(sql, [
      data.slug, data.title, data.description, data.duration, data.audience,
      data.category_id, data.popular ? 1 : 0, data.image_url, data.image_alt
    ]);
  },
  update: (id, data) => {
    const sql = `
      UPDATE courses SET 
      slug = ?, title = ?, description = ?, duration = ?, audience = ?, 
      category_id = ?, popular = ?, image_url = ?, image_alt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return dbRun(sql, [
      data.slug, data.title, data.description, data.duration, data.audience,
      data.category_id, data.popular ? 1 : 0, data.image_url, data.image_alt, id
    ]);
  },
  delete: (id) => dbRun('DELETE FROM courses WHERE id = ?', [id])
};

// Course Features operations
const courseFeaturesOps = {
  getAll: () => dbAll('SELECT * FROM course_features ORDER BY display_order'),
  getByCourseId: (courseId) => {
    return dbAll('SELECT * FROM course_features WHERE course_id = ? ORDER BY display_order', [courseId]);
  },
  create: (courseId, feature, order = 0) => {
    const sql = 'INSERT INTO course_features (course_id, feature, display_order) VALUES (?, ?, ?)';
    return dbRun(sql, [courseId, feature, order]);
  },
  deleteByCourseId: (courseId) => {
    return dbRun('DELETE FROM course_features WHERE course_id = ?', [courseId]);
  }
};

// Team Members operations
const teamMembersOps = {
  getAll: () => dbAll('SELECT * FROM team_members ORDER BY display_order'),
  getById: (id) => dbGet('SELECT * FROM team_members WHERE id = ?', [id]),
  getFeatured: () => dbAll('SELECT * FROM team_members WHERE featured = 1 ORDER BY display_order'),
  create: (data) => {
    const sql = `
      INSERT INTO team_members 
      (name, role, bio, photo_url, experience_years, specializations, featured, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return dbRun(sql, [
      data.name, data.role, data.bio, data.photo_url, data.experience_years,
      JSON.stringify(data.specializations || []), data.featured ? 1 : 0, data.display_order || 0
    ]);
  },
  update: (id, data) => {
    const sql = `
      UPDATE team_members SET 
      name = ?, role = ?, bio = ?, photo_url = ?, experience_years = ?, 
      specializations = ?, featured = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return dbRun(sql, [
      data.name, data.role, data.bio, data.photo_url, data.experience_years,
      JSON.stringify(data.specializations || []), data.featured ? 1 : 0, data.display_order, id
    ]);
  },
  delete: (id) => dbRun('DELETE FROM team_members WHERE id = ?', [id])
};

// Testimonials operations
const testimonialsOps = {
  getAll: () => dbAll('SELECT * FROM testimonials ORDER BY created_at DESC'),
  getById: (id) => dbGet('SELECT * FROM testimonials WHERE id = ?', [id]),
  getFeatured: () => dbAll('SELECT * FROM testimonials WHERE featured = 1 ORDER BY created_at DESC'),
  create: (data) => {
    const sql = `
      INSERT INTO testimonials 
      (client_name, client_role, company, industry, content, rating, client_photo_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return dbRun(sql, [
      data.client_name, data.client_role, data.company, data.industry,
      data.content, data.rating || 5, data.client_photo_url, data.featured ? 1 : 0
    ]);
  },
  update: (id, data) => {
    const sql = `
      UPDATE testimonials SET 
      client_name = ?, client_role = ?, company = ?, industry = ?, content = ?, 
      rating = ?, client_photo_url = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    return dbRun(sql, [
      data.client_name, data.client_role, data.company, data.industry,
      data.content, data.rating, data.client_photo_url, data.featured ? 1 : 0, id
    ]);
  },
  delete: (id) => dbRun('DELETE FROM testimonials WHERE id = ?', [id])
};

// Hero Section operations
const heroSectionOps = {
  get: () => dbGet('SELECT * FROM hero_section WHERE id = 1'),
  upsert: (data) => {
    const sql = `
      INSERT OR REPLACE INTO hero_section 
      (id, slogan, main_heading, highlight_text, subtitle, background_image_url, 
       background_image_alt, primary_button_text, primary_button_link, 
       secondary_button_text, secondary_button_link, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    return dbRun(sql, [
      data.slogan, data.main_heading, data.highlight_text, data.subtitle,
      data.background_image_url, data.background_image_alt,
      data.primary_button_text, data.primary_button_link,
      data.secondary_button_text, data.secondary_button_link
    ]);
  }
};

// Hero Stats operations
const heroStatsOps = {
  getAll: () => dbAll('SELECT * FROM hero_stats ORDER BY display_order'),
  create: (data) => {
    const sql = 'INSERT INTO hero_stats (number_text, label, description, display_order) VALUES (?, ?, ?, ?)';
    return dbRun(sql, [data.number_text, data.label, data.description, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE hero_stats SET number_text = ?, label = ?, description = ?, display_order = ? WHERE id = ?';
    return dbRun(sql, [data.number_text, data.label, data.description, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM hero_stats WHERE id = ?', [id]),
  deleteAll: () => dbRun('DELETE FROM hero_stats')
};

// Hero Features operations
const heroFeaturesOps = {
  getAll: () => dbAll('SELECT * FROM hero_features ORDER BY display_order'),
  create: (data) => {
    const sql = 'INSERT INTO hero_features (title, description, display_order) VALUES (?, ?, ?)';
    return dbRun(sql, [data.title, data.description, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE hero_features SET title = ?, description = ?, display_order = ? WHERE id = ?';
    return dbRun(sql, [data.title, data.description, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM hero_features WHERE id = ?', [id]),
  deleteAll: () => dbRun('DELETE FROM hero_features')
};

// Admin Users operations
const adminUsersOps = {
  getByUsername: (username) => dbGet('SELECT * FROM admin_users WHERE username = ?', [username]),
  getById: (id) => dbGet('SELECT * FROM admin_users WHERE id = ?', [id]),
  updateLastLogin: (id) => {
    return dbRun('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }
};

// Admin Sessions operations
const adminSessionsOps = {
  create: (userId, token, expiresAt) => {
    const sql = 'INSERT INTO admin_sessions (user_id, token, expires_at) VALUES (?, ?, ?)';
    return dbRun(sql, [userId, token, expiresAt]);
  },
  getByToken: (token) => {
    const sql = `
      SELECT s.*, u.username, u.email 
      FROM admin_sessions s 
      JOIN admin_users u ON s.user_id = u.id 
      WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
    `;
    return dbGet(sql, [token]);
  },
  delete: (token) => dbRun('DELETE FROM admin_sessions WHERE token = ?', [token]),
  cleanup: () => dbRun('DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP')
};

export {
  getDb,
  companyInfoOps,
  companyValuesOps,
  whyChooseUsOps,
  courseCategoriesOps,
  coursesOps,
  courseFeaturesOps,
  teamMembersOps,
  testimonialsOps,
  heroSectionOps,
  heroStatsOps,
  heroFeaturesOps,
  adminUsersOps,
  adminSessionsOps
};