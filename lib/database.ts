import mysql from 'mysql2/promise';
import { logger } from './logger';
import type {
  CompanyInfo,
  CompanyValue,
  WhyChooseUs,
  CourseCategory,
  Course,
  CourseFeature,
  TeamMember,
  HeroSection,
  HeroStat,
  HeroFeature,
  AdminUser,
  AdminSession,
  FooterContent,
  FooterStat,
  FooterQuickLink,
  FooterCertification,
  FooterBottomBadge,
  File,
  FileFolder,
} from '../types/database';

// Create a connection pool.
if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
  throw new Error('Missing MySQL environment variables');
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3307', 10), // Use 3307 as fallback
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the pool directly. This is the most likely drop-in replacement.
export const db = pool;

// Helper function to format Date objects for MySQL DATETIME/TIMESTAMP columns
export function formatDateForMySQL(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

type DbResult<T = never> = {
  id?: number | null;
  changes: number;
  data?: T;
};

// Company Info operations
export const companyInfoOps = {
  get: async (): Promise<CompanyInfo | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM company_info WHERE id = 1');
    return (rows[0] as CompanyInfo) || null;
  },
  upsert: async (data: Partial<CompanyInfo>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO company_info (id, company_name, slogan, description, mission, total_experience, students_trained_count, established_year, total_courses, phone, email, location, business_hours, response_time, service_area, emergency_availability, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
      company_name = ?, slogan = ?, description = ?, mission = ?, total_experience = ?, students_trained_count = ?, established_year = ?, total_courses = ?, phone = ?, email = ?, location = ?, business_hours = ?, response_time = ?, service_area = ?, emergency_availability = ?, updated_at = CURRENT_TIMESTAMP
    `, [data.company_name, data.slogan, data.description, data.mission, data.total_experience, data.students_trained_count, data.established_year, data.total_courses, data.phone, data.email, data.location, data.business_hours, data.response_time, data.service_area, data.emergency_availability, data.company_name, data.slogan, data.description, data.mission, data.total_experience, data.students_trained_count, data.established_year, data.total_courses, data.phone, data.email, data.location, data.business_hours, data.response_time, data.service_area, data.emergency_availability]);
    return { id: 1, changes: result.affectedRows ?? 0 };
  },
};

// Company Values operations
export const companyValuesOps = {
  getAll: async (): Promise<CompanyValue[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM company_values ORDER BY display_order');
    return rows as CompanyValue[];
  },
  create: async (data: Partial<CompanyValue>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO company_values (title, description, icon, display_order) 
      VALUES (?, ?, ?, ?)`, [data.title, data.description, data.icon, data.display_order || 0]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<CompanyValue>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE company_values 
      SET title = ?, description = ?, icon = ?, display_order = ?
      WHERE id = ?`, [data.title, data.description, data.icon, data.display_order, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM company_values WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM company_values');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Why Choose Us operations
export const whyChooseUsOps = {
  getAll: async (): Promise<WhyChooseUs[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM company_why_choose_us ORDER BY display_order');
    return rows as WhyChooseUs[];
  },
  create: async (data: Partial<WhyChooseUs>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO company_why_choose_us (point, display_order, image_url, image_alt) 
      VALUES (?, ?, ?, ?)`, [data.point, data.display_order || 0, data.image_url || null, data.image_alt || null]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<WhyChooseUs>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE company_why_choose_us 
      SET point = ?, display_order = ?, image_url = ?, image_alt = ?
      WHERE id = ?`, [data.point, data.display_order, data.image_url || null, data.image_alt || null, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM company_why_choose_us WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM company_why_choose_us');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Course Categories operations
export const courseCategoriesOps = {
  getAll: async (): Promise<CourseCategory[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM course_categories ORDER BY display_order');
    return rows as CourseCategory[];
  },
  getById: async (id: number): Promise<CourseCategory | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM course_categories WHERE id = ?', [id]);
    return (rows[0] as CourseCategory) || null;
  },
  create: async (data: Partial<CourseCategory>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO course_categories (name, description, display_order) 
      VALUES (?, ?, ?)`, [data.name, data.description, data.display_order || 0]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<CourseCategory>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE course_categories 
      SET name = ?, description = ?, display_order = ?
      WHERE id = ?`, [data.name, data.description, data.display_order, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM course_categories WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
};

// Courses operations
export const coursesOps = {
  getAll: async (): Promise<Course[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      ORDER BY c.created_at DESC
    `);
    return rows as Course[];
  },
  getAllWithDetails: async (): Promise<Course[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT
          c.id,
          c.slug,
          c.title,
          c.description,
          c.duration,
          c.audience,
          c.category_id,
          c.popular,
          c.image_url,
          c.image_alt,
          c.created_at,
          c.updated_at,
          c.overview,
          c.what_youll_learn,
          cat.name AS category_name,
          (SELECT JSON_ARRAYAGG(JSON_OBJECT('feature', cf.feature, 'display_order', cf.display_order)) FROM course_features cf WHERE cf.course_id = c.id) AS features
      FROM
          courses c
      LEFT JOIN
          course_categories cat ON c.category_id = cat.id
      
      ORDER BY
          c.created_at DESC
    `);
    return rows.map((row: mysql.RowDataPacket) => ({
      ...row,
      features: row.features || [],
    })) as Course[];
  },
  getById: async (id: number): Promise<Course | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.id = ?`, [id]);
    return (rows[0] as Course) || null;
  },
  getBySlug: async (slug: string): Promise<Course | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT c.*, c.what_youll_learn, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.slug = ?`, [slug]);
    return (rows[0] as Course) || null;
  },
  create: async (data: Partial<Course>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO courses (slug, title, description, duration, audience, category_id, popular, image_url, image_alt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.slug, data.title, data.description, data.duration, data.audience, data.category_id, data.popular ? true : false, data.image_url, data.image_alt]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<Course>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE courses SET 
      slug = ?, title = ?, description = ?, 
      what_youll_learn = ?,
      duration = ?, audience = ?, 
      category_id = ?, popular = ?, 
      image_url = ?, image_alt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`, [data.slug, data.title, data.description, data.what_youll_learn, data.duration, data.audience, data.category_id, data.popular ? true : false, data.image_url, data.image_alt, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM courses WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
};

// Course Features operations
export const courseFeaturesOps = {
  getAll: async (): Promise<CourseFeature[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM course_features ORDER BY display_order');
    return rows as CourseFeature[];
  },
  getByCourseId: async (courseId: number): Promise<CourseFeature[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM course_features WHERE course_id = ? ORDER BY display_order', [courseId]);
    return rows as CourseFeature[];
  },
  create: async (courseId: number, feature: string, order: number = 0): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO course_features (course_id, feature, display_order) 
      VALUES (?, ?, ?)`, [courseId, feature, order]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  deleteByCourseId: async (courseId: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM course_features WHERE course_id = ?', [courseId]);
    return { changes: result.affectedRows ?? 0 };
  },
};

// Team Members operations
export const teamMembersOps = {
  getAll: async (): Promise<TeamMember[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM team_members ORDER BY display_order');
    return (rows as TeamMember[]).map(row => ({
      ...row,
      specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [])
    }));
  },
  getById: async (id: number): Promise<TeamMember | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM team_members WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0] as TeamMember;
    return {
      ...row,
      specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [])
    };
  },
  getFeatured: async (): Promise<TeamMember[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM team_members WHERE featured = true ORDER BY display_order');
    return (rows as TeamMember[]).map(row => ({
      ...row,
      specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [])
    }));
  },
  create: async (data: Partial<TeamMember>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO team_members (name, role, bio, photo_url, experience_years, specializations, featured, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [data.name, data.role, data.bio, data.photo_url, data.experience_years, JSON.stringify(data.specializations || []), data.featured ? true : false, data.display_order || 0]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<TeamMember>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE team_members SET 
      name = ?, role = ?, bio = ?, photo_url = ?, 
      experience_years = ?, 
      specializations = ?, 
      featured = ?, display_order = ?, 
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`, [data.name, data.role, data.bio, data.photo_url, data.experience_years, JSON.stringify(data.specializations || []), data.featured ? true : false, data.display_order, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM team_members WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
};

// Hero Section operations
export const heroSectionOps = {
  get: async (): Promise<HeroSection | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM hero_section WHERE id = 1');
    return (rows[0] as HeroSection) || null;
  },
  upsert: async (data: Partial<HeroSection>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO hero_section (id, slogan, main_heading, highlight_text, subtitle, background_image_url, background_image_alt, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
      slogan = ?, main_heading = ?, highlight_text = ?, subtitle = ?, background_image_url = ?, background_image_alt = ?, primary_button_text = ?, primary_button_link = ?, secondary_button_text = ?, secondary_button_link = ?, updated_at = CURRENT_TIMESTAMP
    `, [data.slogan, data.main_heading, data.highlight_text, data.subtitle, data.background_image_url, data.background_image_alt, data.primary_button_text, data.primary_button_link, data.secondary_button_text, data.secondary_button_link, data.slogan, data.main_heading, data.highlight_text, data.subtitle, data.background_image_url, data.background_image_alt, data.primary_button_text, data.primary_button_link, data.secondary_button_text, data.secondary_button_link]);
    return { id: 1, changes: result.affectedRows ?? 0 };
  },
};

// Hero Stats operations
export const heroStatsOps = {
  getAll: async (): Promise<HeroStat[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM hero_stats ORDER BY display_order');
    return rows as HeroStat[];
  },
  create: async (data: Partial<HeroStat>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO hero_stats (number_text, label, description, display_order) 
      VALUES (?, ?, ?, ?)`, [data.number_text, data.label, data.description, data.display_order || 0]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<HeroStat>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE hero_stats 
      SET number_text = ?, label = ?, description = ?, display_order = ?
      WHERE id = ?`, [data.number_text, data.label, data.description, data.display_order, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM hero_stats WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM hero_stats');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Hero Features operations
export const heroFeaturesOps = {
  getAll: async (): Promise<HeroFeature[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM hero_features ORDER BY display_order');
    return rows as HeroFeature[];
  },
  create: async (data: Partial<HeroFeature>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO hero_features (title, description, display_order) 
      VALUES (?, ?, ?)`, [data.title, data.description, data.display_order || 0]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<HeroFeature>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE hero_features 
      SET title = ?, description = ?, display_order = ?
      WHERE id = ?`, [data.title, data.description, data.display_order, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM hero_features WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM hero_features');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Admin Users operations
export const adminUsersOps = {
  getByUsername: async (username: string): Promise<AdminUser | null> => {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM admin_users WHERE username = ?', [username]);
      return (rows[0] as AdminUser) || null;
    } catch (error: unknown) {
      logger.error('Database error getting user by username', { error: (error instanceof Error ? error.message : String(error)), username });
      throw new Error('Failed to retrieve user');
    }
  },
  getById: async (id: number): Promise<AdminUser | null> => {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM admin_users WHERE id = ?', [id]);
      return (rows[0] as AdminUser) || null;
    } catch (error: unknown) {
      logger.error('Database error getting user by ID', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw new Error('Failed to retrieve user');
    }
  },
  updateLastLogin: async (id: number): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating last login', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw new Error('Failed to update last login');
    }
  },
  updateTokenVersion: async (id: number): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('UPDATE admin_users SET token_version = token_version + 1 WHERE id = ?', [id]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating token version', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw new Error('Failed to update token version');
    }
  },
};

// Admin Sessions operations
export const adminSessionsOps = {
  create: async (userId: number, token: string, expiresAt: string, ipAddress: string = 'unknown', userAgent: string = 'unknown'): Promise<DbResult> => {
    try {
      const now = new Date();
      const [result] = await pool.query<mysql.ResultSetHeader>(`
        INSERT INTO admin_sessions (user_id, token, expires_at, last_activity, ip_address, user_agent, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [userId, token, formatDateForMySQL(new Date(expiresAt)), formatDateForMySQL(now), ipAddress, userAgent, formatDateForMySQL(now)]);
      return { id: result.insertId, changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error creating session', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to create session');
    }
  },
  getByToken: async (token: string): Promise<AdminSession | null> => {
    try {
      const now = new Date();
      const [rows] = await pool.query<mysql.RowDataPacket[]>(`
        SELECT s.*, u.username, u.email, u.token_version
        FROM admin_sessions s 
        JOIN admin_users u ON s.user_id = u.id 
        WHERE s.token = ? AND s.expires_at > ?`, [token, formatDateForMySQL(now)]);
      return (rows[0] as AdminSession) || null;
    } catch (error: unknown) {
      logger.error('Database error getting session by token', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to retrieve session');
    }
  },
  getByUserId: async (userId: number): Promise<AdminSession[]> => {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>(`
        SELECT s.*, u.username, u.email
        FROM admin_sessions s
        JOIN admin_users u ON s.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC`, [userId]);
      return rows as AdminSession[];
    } catch (error: unknown) {
      logger.error('Database error getting user sessions', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to retrieve user sessions');
    }
  },
  updateLastActivity: async (token: string): Promise<DbResult> => {
    try {
      const now = new Date();
      const [result] = await pool.query<mysql.ResultSetHeader>('UPDATE admin_sessions SET last_activity = ? WHERE token = ?', [formatDateForMySQL(now), token]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating session activity', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to update session activity');
    }
  },
  updateToken: async (sessionId: number, newToken: string, newExpiresAt: string): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>(`
        UPDATE admin_sessions 
        SET token = ?, expires_at = ?
        WHERE id = ?`, [newToken, newExpiresAt, sessionId]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating session token', { error: error instanceof Error ? error.message : String(error), sessionId });
      throw new Error('Failed to update session token');
    }
  },
  'delete': async (token: string): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM admin_sessions WHERE token = ?', [token]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to delete session');
    }
  },
  deleteAllExcept: async (userId: number, currentToken: string): Promise<number> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>(`
        DELETE FROM admin_sessions 
        WHERE user_id = ? AND token != ?`, [userId, currentToken]);
      return result.affectedRows ?? 0;
    } catch (error: unknown) {
      logger.error('Database error deleting other sessions', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete other sessions');
    }
  },
  deleteAllByUserId: async (userId: number): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM admin_sessions WHERE user_id = ?', [userId]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting user sessions', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete user sessions');
    }
  },
  cleanup: async (): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP');
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error cleaning up expired sessions', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to clean up expired sessions');
    }
  },
  deleteByUserId: async (userId: number): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM admin_sessions WHERE user_id = ?', [userId]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting sessions by user ID', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete sessions by user ID');
    }
  },
  deleteByToken: async (token: string): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM admin_sessions WHERE token = ?', [token]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session by token', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to delete session by token');
    }
  },
  getById: async (sessionId: number): Promise<AdminSession | null> => {
    try {
      const [rows] = await pool.query<mysql.RowDataPacket[]>(`
        SELECT s.*, u.username, u.email
        FROM admin_sessions s
        JOIN admin_users u ON s.user_id = u.id
        WHERE s.id = ?`, [sessionId]);
      return (rows[0] as AdminSession) || null;
    } catch (error: unknown) {
      logger.error('Database error getting session by ID', { error: error instanceof Error ? error.message : String(error), sessionId });
      throw new Error('Failed to retrieve session by ID');
    }
  },
  deleteById: async (sessionId: number): Promise<DbResult> => {
    try {
      const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM admin_sessions WHERE id = ?', [sessionId]);
      return { changes: result.affectedRows ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session by ID', { error: error instanceof Error ? error.message : String(error), sessionId: sessionId });
      throw new Error('Failed to delete session by ID');
    }
  },
};

// Footer Content operations
export const footerContentOps = {
  get: async (): Promise<FooterContent | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_content WHERE id = 1');
    return (rows[0] as FooterContent) || null;
  },
  upsert: async (data: Partial<FooterContent>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO footer_content (id, company_name, tagline, slogan, description, phone, email, location, logo_url, logo_alt, copyright_text, tagline_bottom, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
      company_name = ?, tagline = ?, slogan = ?, description = ?, phone = ?, email = ?, location = ?, logo_url = ?, logo_alt = ?, copyright_text = ?, tagline_bottom = ?, updated_at = CURRENT_TIMESTAMP
    `, [data.company_name, data.tagline, data.slogan, data.description, data.phone, data.email, data.location, data.logo_url, data.logo_alt, data.copyright_text, data.tagline_bottom, data.company_name, data.tagline, data.slogan, data.description, data.phone, data.email, data.location, data.logo_url, data.logo_alt, data.copyright_text, data.tagline_bottom]);
    return { id: 1, changes: result.affectedRows ?? 0 };
  },
};

// Footer Stats operations
export const footerStatsOps = {
  getAll: async (): Promise<FooterStat[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_stats ORDER BY display_order');
    return rows as FooterStat[];
  },
  create: async (data: Partial<FooterStat>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO footer_stats (number_text, label, display_order) 
      VALUES (?, ?, ?)`, [data.number_text, data.label, data.display_order || 0]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<FooterStat>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE footer_stats 
      SET number_text = ?, label = ?, display_order = ?
      WHERE id = ?`, [data.number_text, data.label, data.display_order, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_stats WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_stats');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Footer Quick Links operations
export const footerQuickLinksOps = {
  getAll: async (): Promise<FooterQuickLink[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_quick_links WHERE is_active = true ORDER BY display_order');
    return rows as FooterQuickLink[];
  },
  getAllIncludingInactive: async (): Promise<FooterQuickLink[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_quick_links ORDER BY display_order');
    return rows as FooterQuickLink[];
  },
  create: async (data: Partial<FooterQuickLink>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO footer_quick_links (title, url, display_order, is_active) 
      VALUES (?, ?, ?, ?)`, [data.title, data.url, data.display_order || 0, data.is_active !== false]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<FooterQuickLink>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE footer_quick_links 
      SET title = ?, url = ?, display_order = ?, is_active = ?
      WHERE id = ?`, [data.title, data.url, data.display_order, data.is_active !== false, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_quick_links WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_quick_links');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Footer Certifications operations
export const footerCertificationsOps = {
  getAll: async (): Promise<FooterCertification[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_certifications WHERE is_active = true ORDER BY display_order');
    return rows as FooterCertification[];
  },
  getAllIncludingInactive: async (): Promise<FooterCertification[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_certifications ORDER BY display_order');
    return rows as FooterCertification[];
  },
  create: async (data: Partial<FooterCertification>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO footer_certifications (title, icon, display_order, is_active) 
      VALUES (?, ?, ?, ?)`, [data.title, data.icon || 'Award', data.display_order || 0, data.is_active !== false]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<FooterCertification>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE footer_certifications 
      SET title = ?, icon = ?, display_order = ?, is_active = ?
      WHERE id = ?`, [data.title, data.icon, data.display_order, data.is_active !== false, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_certifications WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_certifications');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Footer Bottom Badges operations
export const footerBottomBadgesOps = {
  getAll: async (): Promise<FooterBottomBadge[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_bottom_badges WHERE is_active = true ORDER BY display_order');
    return rows as FooterBottomBadge[];
  },
  getAllIncludingInactive: async (): Promise<FooterBottomBadge[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM footer_bottom_badges ORDER BY display_order');
    return rows as FooterBottomBadge[];
  },
  create: async (data: Partial<FooterBottomBadge>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO footer_bottom_badges (title, icon, display_order, is_active) 
      VALUES (?, ?, ?, ?)`, [data.title, data.icon || 'Shield', data.display_order || 0, data.is_active !== false]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<FooterBottomBadge>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE footer_bottom_badges 
      SET title = ?, icon = ?, display_order = ?, is_active = ?
      WHERE id = ?`, [data.title, data.icon, data.display_order, data.is_active !== false, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_bottom_badges WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM footer_bottom_badges');
    return { changes: result.affectedRows ?? 0 };
  },
};

// Files operations
export const filesOps = {
  getAll: async (): Promise<File[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `);
    return rows as File[];
  },
  getById: async (id: number): Promise<File | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.id = ? AND f.status = 'active'
    `, [id]);
    return (rows[0] as File) || null;
  },
  getByCategory: async (category: string): Promise<File[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.category = ? AND f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `, [category]);
    return rows as File[];
  },
  getFeatured: async (): Promise<File[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.is_featured = true AND f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `);
    return rows as File[];
  },
  getByMimeType: async (mimeType: string): Promise<File[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.mime_type LIKE ? AND f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `, [mimeType + '%']);
    return rows as File[];
  },
  create: async (data: Partial<File>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO files (filename, original_name, file_size, mime_type, file_extension, file_url, width, height, aspect_ratio, alt_text, title, description, tags, caption, folder_id, category, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.filename, data.original_name, data.file_size, data.mime_type, data.file_extension, data.file_url, data.width, data.height, data.aspect_ratio, data.alt_text, data.title, data.description, data.tags, data.caption, data.folder_id, data.category || 'general', data.uploaded_by]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<File>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE files SET 
      alt_text = ?, title = ?, description = ?, tags = ?, caption = ?, folder_id = ?, category = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'active'
    `, [data.alt_text || null, data.title || null, data.description || null, data.tags || null, data.caption || null, data.folder_id || null, data.category || 'general', data.is_featured ? true : false, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  updateUsageCount: async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE files SET 
      usage_count = usage_count + 1,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'active'
    `, [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE files SET 
      status = 'deleted',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  hardDelete: async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM files WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  archive: async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE files SET 
      status = 'archived',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    return { changes: result.affectedRows ?? 0 };
  },
  restore: async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE files SET 
      status = 'active',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    return { changes: result.affectedRows ?? 0 };
  },
};

// File Folders operations
export const fileFoldersOps = {
  getAll: async (): Promise<FileFolder[]> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM file_folders ORDER BY display_order');
    return rows as FileFolder[];
  },
  getById: async (id: number): Promise<FileFolder | null> => {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM file_folders WHERE id = ?', [id]);
    return (rows[0] as FileFolder) || null;
  },
  create: async (data: Partial<FileFolder>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      INSERT INTO file_folders (name, description, parent_id, display_order) 
      VALUES (?, ?, ?, ?)`, [data.name, data.description, data.parent_id, data.display_order || 0]);
    return { id: result.insertId, changes: result.affectedRows ?? 0 };
  },
  update: async (id: number, data: Partial<FileFolder>): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>(`
      UPDATE file_folders SET 
      name = ?, description = ?, 
      parent_id = ?, display_order = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`, [data.name, data.description, data.parent_id, data.display_order, id]);
    return { changes: result.affectedRows ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const [result] = await pool.query<mysql.ResultSetHeader>('DELETE FROM file_folders WHERE id = ?', [id]);
    return { changes: result.affectedRows ?? 0 };
  },
};

export type { DbResult, CompanyInfo, CompanyValue, WhyChooseUs, CourseCategory, Course, CourseFeature, TeamMember, HeroSection, HeroStat, HeroFeature, AdminUser, AdminSession, FooterContent, FooterStat, FooterQuickLink, FooterCertification, FooterBottomBadge, File, FileFolder };