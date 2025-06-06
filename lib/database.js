// Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now import @vercel/postgres with the environment variables already loaded
import { sql } from '@vercel/postgres';

// Company Info operations
const companyInfoOps = {
  get: async () => {
    const result = await sql`SELECT * FROM company_info WHERE id = 1`;
    return result.rows[0] || null;
  },
  upsert: async (data) => {
    const result = await sql`
      INSERT INTO company_info 
      (id, company_name, slogan, description, mission, total_experience, 
       students_trained_count, established_year, total_courses, updated_at)
      VALUES (1, ${data.company_name}, ${data.slogan}, ${data.description}, ${data.mission},
              ${data.total_experience}, ${data.students_trained_count}, 
              ${data.established_year}, ${data.total_courses}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      company_name = ${data.company_name}, slogan = ${data.slogan}, description = ${data.description}, mission = ${data.mission},
      total_experience = ${data.total_experience}, students_trained_count = ${data.students_trained_count}, 
      established_year = ${data.established_year}, total_courses = ${data.total_courses}, updated_at = CURRENT_TIMESTAMP
    `;
    return { id: 1, changes: result.rowCount || 0 };
  }
};

// Company Values operations
const companyValuesOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM company_values ORDER BY display_order`;
    return result.rows;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO company_values (title, description, icon, display_order) 
      VALUES (${data.title}, ${data.description}, ${data.icon}, ${data.display_order || 0})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE company_values 
      SET title = ${data.title}, description = ${data.description}, icon = ${data.icon}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM company_values WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  },
  deleteAll: async () => {
    const result = await sql`DELETE FROM company_values`;
    return { changes: result.rowCount || 0 };
  }
};

// Why Choose Us operations
const whyChooseUsOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM company_why_choose_us ORDER BY display_order`;
    return result.rows;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO company_why_choose_us (point, display_order) 
      VALUES (${data.point}, ${data.display_order || 0})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE company_why_choose_us 
      SET point = ${data.point}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM company_why_choose_us WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  },
  deleteAll: async () => {
    const result = await sql`DELETE FROM company_why_choose_us`;
    return { changes: result.rowCount || 0 };
  }
};

// Course Categories operations
const courseCategoriesOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM course_categories ORDER BY display_order`;
    return result.rows;
  },
  getById: async (id) => {
    const result = await sql`SELECT * FROM course_categories WHERE id = ${id}`;
    return result.rows[0] || null;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO course_categories (name, description, display_order) 
      VALUES (${data.name}, ${data.description}, ${data.display_order || 0})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE course_categories 
      SET name = ${data.name}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM course_categories WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  }
};

// Courses operations
const coursesOps = {
  getAll: async () => {
    const result = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      ORDER BY c.created_at DESC
    `;
    return result.rows;
  },
  getById: async (id) => {
    const result = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.id = ${id}
    `;
    return result.rows[0] || null;
  },
  getBySlug: async (slug) => {
    const result = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.slug = ${slug}
    `;
    return result.rows[0] || null;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO courses 
      (slug, title, description, duration, audience, category_id, popular, image_url, image_alt)
      VALUES (${data.slug}, ${data.title}, ${data.description}, ${data.duration}, ${data.audience},
              ${data.category_id}, ${data.popular ? true : false}, ${data.image_url}, ${data.image_alt})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE courses SET 
      slug = ${data.slug}, title = ${data.title}, description = ${data.description}, 
      duration = ${data.duration}, audience = ${data.audience}, 
      category_id = ${data.category_id}, popular = ${data.popular ? true : false}, 
      image_url = ${data.image_url}, image_alt = ${data.image_alt}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM courses WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  }
};

// Course Features operations
const courseFeaturesOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM course_features ORDER BY display_order`;
    return result.rows;
  },
  getByCourseId: async (courseId) => {
    const result = await sql`SELECT * FROM course_features WHERE course_id = ${courseId} ORDER BY display_order`;
    return result.rows;
  },
  create: async (courseId, feature, order = 0) => {
    const result = await sql`
      INSERT INTO course_features (course_id, feature, display_order) 
      VALUES (${courseId}, ${feature}, ${order})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  deleteByCourseId: async (courseId) => {
    const result = await sql`DELETE FROM course_features WHERE course_id = ${courseId}`;
    return { changes: result.rowCount || 0 };
  }
};

// Team Members operations
const teamMembersOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM team_members ORDER BY display_order`;
    return result.rows;
  },
  getById: async (id) => {
    const result = await sql`SELECT * FROM team_members WHERE id = ${id}`;
    return result.rows[0] || null;
  },
  getFeatured: async () => {
    const result = await sql`SELECT * FROM team_members WHERE featured = true ORDER BY display_order`;
    return result.rows;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO team_members 
      (name, role, bio, photo_url, experience_years, specializations, featured, display_order)
      VALUES (${data.name}, ${data.role}, ${data.bio}, ${data.photo_url}, ${data.experience_years},
              ${JSON.stringify(data.specializations || [])}, ${data.featured ? true : false}, ${data.display_order || 0})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE team_members SET 
      name = ${data.name}, role = ${data.role}, bio = ${data.bio}, photo_url = ${data.photo_url}, 
      experience_years = ${data.experience_years}, 
      specializations = ${JSON.stringify(data.specializations || [])}, 
      featured = ${data.featured ? true : false}, display_order = ${data.display_order}, 
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM team_members WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  }
};

// Testimonials operations
const testimonialsOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM testimonials ORDER BY created_at DESC`;
    return result.rows;
  },
  getById: async (id) => {
    const result = await sql`SELECT * FROM testimonials WHERE id = ${id}`;
    return result.rows[0] || null;
  },
  getFeatured: async () => {
    const result = await sql`SELECT * FROM testimonials WHERE featured = true ORDER BY created_at DESC`;
    return result.rows;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO testimonials 
      (client_name, client_role, company, industry, content, rating, client_photo_url, featured)
      VALUES (${data.client_name}, ${data.client_role}, ${data.company}, ${data.industry},
              ${data.content}, ${data.rating || 5}, ${data.client_photo_url}, ${data.featured ? true : false})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE testimonials SET 
      client_name = ${data.client_name}, client_role = ${data.client_role}, company = ${data.company}, 
      industry = ${data.industry}, content = ${data.content}, 
      rating = ${data.rating}, client_photo_url = ${data.client_photo_url}, 
      featured = ${data.featured ? true : false}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM testimonials WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  }
};

// Hero Section operations
const heroSectionOps = {
  get: async () => {
    const result = await sql`SELECT * FROM hero_section WHERE id = 1`;
    return result.rows[0] || null;
  },
  upsert: async (data) => {
    const result = await sql`
      INSERT INTO hero_section 
      (id, slogan, main_heading, highlight_text, subtitle, background_image_url, 
       background_image_alt, primary_button_text, primary_button_link, 
       secondary_button_text, secondary_button_link, updated_at)
      VALUES (1, ${data.slogan}, ${data.main_heading}, ${data.highlight_text}, ${data.subtitle},
              ${data.background_image_url}, ${data.background_image_alt},
              ${data.primary_button_text}, ${data.primary_button_link},
              ${data.secondary_button_text}, ${data.secondary_button_link}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      slogan = ${data.slogan}, main_heading = ${data.main_heading}, highlight_text = ${data.highlight_text}, 
      subtitle = ${data.subtitle}, background_image_url = ${data.background_image_url}, 
      background_image_alt = ${data.background_image_alt},
      primary_button_text = ${data.primary_button_text}, primary_button_link = ${data.primary_button_link},
      secondary_button_text = ${data.secondary_button_text}, secondary_button_link = ${data.secondary_button_link},
      updated_at = CURRENT_TIMESTAMP
    `;
    return { id: 1, changes: result.rowCount || 0 };
  }
};

// Hero Stats operations
const heroStatsOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM hero_stats ORDER BY display_order`;
    return result.rows;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO hero_stats (number_text, label, description, display_order) 
      VALUES (${data.number_text}, ${data.label}, ${data.description}, ${data.display_order || 0})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE hero_stats 
      SET number_text = ${data.number_text}, label = ${data.label}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM hero_stats WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  },
  deleteAll: async () => {
    const result = await sql`DELETE FROM hero_stats`;
    return { changes: result.rowCount || 0 };
  }
};

// Hero Features operations
const heroFeaturesOps = {
  getAll: async () => {
    const result = await sql`SELECT * FROM hero_features ORDER BY display_order`;
    return result.rows;
  },
  create: async (data) => {
    const result = await sql`
      INSERT INTO hero_features (title, description, display_order) 
      VALUES (${data.title}, ${data.description}, ${data.display_order || 0})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  update: async (id, data) => {
    const result = await sql`
      UPDATE hero_features 
      SET title = ${data.title}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount || 0 };
  },
  delete: async (id) => {
    const result = await sql`DELETE FROM hero_features WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  },
  deleteAll: async () => {
    const result = await sql`DELETE FROM hero_features`;
    return { changes: result.rowCount || 0 };
  }
};

// Admin Users operations
const adminUsersOps = {
  getByUsername: async (username) => {
    const result = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
    return result.rows[0] || null;
  },
  getById: async (id) => {
    const result = await sql`SELECT * FROM admin_users WHERE id = ${id}`;
    return result.rows[0] || null;
  },
  updateLastLogin: async (id) => {
    const result = await sql`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ${id}`;
    return { changes: result.rowCount || 0 };
  }
};

// Admin Sessions operations
const adminSessionsOps = {
  create: async (userId, token, expiresAt) => {
    const result = await sql`
      INSERT INTO admin_sessions (user_id, token, expires_at) 
      VALUES (${userId}, ${token}, ${expiresAt})
    `;
    return { id: result.insertId || null, changes: result.rowCount || 0 };
  },
  getByToken: async (token) => {
    const result = await sql`
      SELECT s.*, u.username, u.email 
      FROM admin_sessions s 
      JOIN admin_users u ON s.user_id = u.id 
      WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
    `;
    return result.rows[0] || null;
  },
  delete: async (token) => {
    const result = await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
    return { changes: result.rowCount || 0 };
  },
  cleanup: async () => {
    const result = await sql`DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP`;
    return { changes: result.rowCount || 0 };
  }
};

export {
  sql,
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

