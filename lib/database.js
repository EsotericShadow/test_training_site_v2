import { sql } from '@vercel/postgres';

// Promisify database operations to match existing API
async function dbGet(sqlQuery, params = []) {
  try {
    const { rows } = await sql.query(sqlQuery, params);
    return rows[0] || null;
  } catch (err) {
    console.error('Error in dbGet:', err);
    throw err;
  }
}

async function dbAll(sqlQuery, params = []) {
  try {
    const { rows } = await sql.query(sqlQuery, params);
    return rows;
  } catch (err) {
    console.error('Error in dbAll:', err);
    throw err;
  }
}

async function dbRun(sqlQuery, params = []) {
  try {
    const result = await sql.query(sqlQuery, params);
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  } catch (err) {
    console.error('Error in dbRun:', err);
    throw err;
  }
}

// Company Info operations
const companyInfoOps = {
  get: () => dbGet('SELECT * FROM company_info WHERE id = 1'),
  upsert: (data) => {
    const sql = `
      INSERT INTO company_info 
      (id, company_name, slogan, description, mission, total_experience, 
       students_trained_count, established_year, total_courses, updated_at)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      company_name = $1, slogan = $2, description = $3, mission = $4,
      total_experience = $5, students_trained_count = $6, 
      established_year = $7, total_courses = $8, updated_at = CURRENT_TIMESTAMP
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
    const sql = 'INSERT INTO company_values (title, description, icon, display_order) VALUES ($1, $2, $3, $4)';
    return dbRun(sql, [data.title, data.description, data.icon, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE company_values SET title = $1, description = $2, icon = $3, display_order = $4 WHERE id = $5';
    return dbRun(sql, [data.title, data.description, data.icon, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM company_values WHERE id = $1', [id]),
  deleteAll: () => dbRun('DELETE FROM company_values')
};

// Why Choose Us operations
const whyChooseUsOps = {
  getAll: () => dbAll('SELECT * FROM company_why_choose_us ORDER BY display_order'),
  create: (data) => {
    const sql = 'INSERT INTO company_why_choose_us (point, display_order) VALUES ($1, $2)';
    return dbRun(sql, [data.point, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE company_why_choose_us SET point = $1, display_order = $2 WHERE id = $3';
    return dbRun(sql, [data.point, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM company_why_choose_us WHERE id = $1', [id]),
  deleteAll: () => dbRun('DELETE FROM company_why_choose_us')
};

// Course Categories operations
const courseCategoriesOps = {
  getAll: () => dbAll('SELECT * FROM course_categories ORDER BY display_order'),
  getById: (id) => dbGet('SELECT * FROM course_categories WHERE id = $1', [id]),
  create: (data) => {
    const sql = 'INSERT INTO course_categories (name, description, display_order) VALUES ($1, $2, $3)';
    return dbRun(sql, [data.name, data.description, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE course_categories SET name = $1, description = $2, display_order = $3 WHERE id = $4';
    return dbRun(sql, [data.name, data.description, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM course_categories WHERE id = $1', [id])
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
      WHERE c.id = $1
    `;
    return dbGet(sql, [id]);
  },
  getBySlug: (slug) => {
    const sql = `
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.slug = $1
    `;
    return dbGet(sql, [slug]);
  },
  create: (data) => {
    const sql = `
      INSERT INTO courses 
      (slug, title, description, duration, audience, category_id, popular, image_url, image_alt)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    return dbRun(sql, [
      data.slug, data.title, data.description, data.duration, data.audience,
      data.category_id, data.popular ? true : false, data.image_url, data.image_alt
    ]);
  },
  update: (id, data) => {
    const sql = `
      UPDATE courses SET 
      slug = $1, title = $2, description = $3, duration = $4, audience = $5, 
      category_id = $6, popular = $7, image_url = $8, image_alt = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
    `;
    return dbRun(sql, [
      data.slug, data.title, data.description, data.duration, data.audience,
      data.category_id, data.popular ? true : false, data.image_url, data.image_alt, id
    ]);
  },
  delete: (id) => dbRun('DELETE FROM courses WHERE id = $1', [id])
};

// Course Features operations
const courseFeaturesOps = {
  getAll: () => dbAll('SELECT * FROM course_features ORDER BY display_order'),
  getByCourseId: (courseId) => {
    return dbAll('SELECT * FROM course_features WHERE course_id = $1 ORDER BY display_order', [courseId]);
  },
  create: (courseId, feature, order = 0) => {
    const sql = 'INSERT INTO course_features (course_id, feature, display_order) VALUES ($1, $2, $3)';
    return dbRun(sql, [courseId, feature, order]);
  },
  deleteByCourseId: (courseId) => {
    return dbRun('DELETE FROM course_features WHERE course_id = $1', [courseId]);
  }
};

// Team Members operations
const teamMembersOps = {
  getAll: () => dbAll('SELECT * FROM team_members ORDER BY display_order'),
  getById: (id) => dbGet('SELECT * FROM team_members WHERE id = $1', [id]),
  getFeatured: () => dbAll('SELECT * FROM team_members WHERE featured = true ORDER BY display_order'),
  create: (data) => {
    const sql = `
      INSERT INTO team_members 
      (name, role, bio, photo_url, experience_years, specializations, featured, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    return dbRun(sql, [
      data.name, data.role, data.bio, data.photo_url, data.experience_years,
      JSON.stringify(data.specializations || []), data.featured ? true : false, data.display_order || 0
    ]);
  },
  update: (id, data) => {
    const sql = `
      UPDATE team_members SET 
      name = $1, role = $2, bio = $3, photo_url = $4, experience_years = $5, 
      specializations = $6, featured = $7, display_order = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `;
    return dbRun(sql, [
      data.name, data.role, data.bio, data.photo_url, data.experience_years,
      JSON.stringify(data.specializations || []), data.featured ? true : false, data.display_order, id
    ]);
  },
  delete: (id) => dbRun('DELETE FROM team_members WHERE id = $1', [id])
};

// Testimonials operations
const testimonialsOps = {
  getAll: () => dbAll('SELECT * FROM testimonials ORDER BY created_at DESC'),
  getById: (id) => dbGet('SELECT * FROM testimonials WHERE id = $1', [id]),
  getFeatured: () => dbAll('SELECT * FROM testimonials WHERE featured = true ORDER BY created_at DESC'),
  create: (data) => {
    const sql = `
      INSERT INTO testimonials 
      (client_name, client_role, company, industry, content, rating, client_photo_url, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    return dbRun(sql, [
      data.client_name, data.client_role, data.company, data.industry,
      data.content, data.rating || 5, data.client_photo_url, data.featured ? true : false
    ]);
  },
  update: (id, data) => {
    const sql = `
      UPDATE testimonials SET 
      client_name = $1, client_role = $2, company = $3, industry = $4, content = $5, 
      rating = $6, client_photo_url = $7, featured = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `;
    return dbRun(sql, [
      data.client_name, data.client_role, data.company, data.industry,
      data.content, data.rating, data.client_photo_url, data.featured ? true : false, id
    ]);
  },
  delete: (id) => dbRun('DELETE FROM testimonials WHERE id = $1', [id])
};

// Hero Section operations
const heroSectionOps = {
  get: () => dbGet('SELECT * FROM hero_section WHERE id = 1'),
  upsert: (data) => {
    const sql = `
      INSERT INTO hero_section 
      (id, slogan, main_heading, highlight_text, subtitle, background_image_url, 
       background_image_alt, primary_button_text, primary_button_link, 
       secondary_button_text, secondary_button_link, updated_at)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      slogan = $1, main_heading = $2, highlight_text = $3, subtitle = $4,
      background_image_url = $5, background_image_alt = $6,
      primary_button_text = $7, primary_button_link = $8,
      secondary_button_text = $9, secondary_button_link = $10,
      updated_at = CURRENT_TIMESTAMP
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
    const sql = 'INSERT INTO hero_stats (number_text, label, description, display_order) VALUES ($1, $2, $3, $4)';
    return dbRun(sql, [data.number_text, data.label, data.description, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE hero_stats SET number_text = $1, label = $2, description = $3, display_order = $4 WHERE id = $5';
    return dbRun(sql, [data.number_text, data.label, data.description, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM hero_stats WHERE id = $1', [id]),
  deleteAll: () => dbRun('DELETE FROM hero_stats')
};

// Hero Features operations
const heroFeaturesOps = {
  getAll: () => dbAll('SELECT * FROM hero_features ORDER BY display_order'),
  create: (data) => {
    const sql = 'INSERT INTO hero_features (title, description, display_order) VALUES ($1, $2, $3)';
    return dbRun(sql, [data.title, data.description, data.display_order || 0]);
  },
  update: (id, data) => {
    const sql = 'UPDATE hero_features SET title = $1, description = $2, display_order = $3 WHERE id = $4';
    return dbRun(sql, [data.title, data.description, data.display_order, id]);
  },
  delete: (id) => dbRun('DELETE FROM hero_features WHERE id = $1', [id]),
  deleteAll: () => dbRun('DELETE FROM hero_features')
};

// Admin Users operations
const adminUsersOps = {
  getByUsername: (username) => dbGet('SELECT * FROM admin_users WHERE username = $1', [username]),
  getById: (id) => dbGet('SELECT * FROM admin_users WHERE id = $1', [id]),
  updateLastLogin: (id) => {
    return dbRun('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
  }
};

// Admin Sessions operations
const adminSessionsOps = {
  create: (userId, token, expiresAt) => {
    const sql = 'INSERT INTO admin_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)';
    return dbRun(sql, [userId, token, expiresAt]);
  },
  getByToken: (token) => {
    const sql = `
      SELECT s.*, u.username, u.email 
      FROM admin_sessions s 
      JOIN admin_users u ON s.user_id = u.id 
      WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP
    `;
    return dbGet(sql, [token]);
  },
  delete: (token) => dbRun('DELETE FROM admin_sessions WHERE token = $1', [token]),
  cleanup: () => dbRun('DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP')
};

export {
  dbGet,
  dbAll,
  dbRun,
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