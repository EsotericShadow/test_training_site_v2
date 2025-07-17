import { sql } from '@vercel/postgres';
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

type DbResult<T = never> = {
  id?: number | null;
  changes: number;
  data?: T;
};

// Company Info operations
export const companyInfoOps = {
  get: async (): Promise<CompanyInfo | null> => {
    const { rows } = await sql`SELECT * FROM company_info WHERE id = 1`;
    return (rows[0] as CompanyInfo) || null;
  },
  upsert: async (data: Partial<CompanyInfo>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO company_info (id, company_name, slogan, description, mission, total_experience, students_trained_count, established_year, total_courses, phone, email, location, business_hours, response_time, service_area, emergency_availability, updated_at)
      VALUES (1, ${data.company_name}, ${data.slogan}, ${data.description}, ${data.mission}, ${data.total_experience}, ${data.students_trained_count}, ${data.established_year}, ${data.total_courses}, ${data.phone}, ${data.email}, ${data.location}, ${data.business_hours}, ${data.response_time}, ${data.service_area}, ${data.emergency_availability}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      company_name = ${data.company_name}, slogan = ${data.slogan}, description = ${data.description}, mission = ${data.mission}, total_experience = ${data.total_experience}, students_trained_count = ${data.students_trained_count}, established_year = ${data.established_year}, total_courses = ${data.total_courses}, phone = ${data.phone}, email = ${data.email}, location = ${data.location}, business_hours = ${data.business_hours}, response_time = ${data.response_time}, service_area = ${data.service_area}, emergency_availability = ${data.emergency_availability}, updated_at = CURRENT_TIMESTAMP
    `;
    return { id: 1, changes: result.rowCount ?? 0 };
  },
};

// Company Values operations
export const companyValuesOps = {
  getAll: async (): Promise<CompanyValue[]> => {
    const { rows } = await sql`SELECT * FROM company_values ORDER BY display_order`;
    return rows as CompanyValue[];
  },
  create: async (data: Partial<CompanyValue>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO company_values (title, description, icon, display_order) 
      VALUES (${data.title}, ${data.description}, ${data.icon}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<CompanyValue>): Promise<DbResult> => {
    const result = await sql`
      UPDATE company_values 
      SET title = ${data.title}, description = ${data.description}, icon = ${data.icon}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_values WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_values`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Why Choose Us operations
export const whyChooseUsOps = {
  getAll: async (): Promise<WhyChooseUs[]> => {
    const { rows } = await sql`SELECT * FROM company_why_choose_us ORDER BY display_order`;
    return rows as WhyChooseUs[];
  },
  create: async (data: Partial<WhyChooseUs>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO company_why_choose_us (point, display_order) 
      VALUES (${data.point}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<WhyChooseUs>): Promise<DbResult> => {
    const result = await sql`
      UPDATE company_why_choose_us 
      SET point = ${data.point}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_why_choose_us WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_why_choose_us`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Course Categories operations
export const courseCategoriesOps = {
  getAll: async (): Promise<CourseCategory[]> => {
    const { rows } = await sql`SELECT * FROM course_categories ORDER BY display_order`;
    return rows as CourseCategory[];
  },
  getById: async (id: number): Promise<CourseCategory | null> => {
    const { rows } = await sql`SELECT * FROM course_categories WHERE id = ${id}`;
    return (rows[0] as CourseCategory) || null;
  },
  create: async (data: Partial<CourseCategory>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO course_categories (name, description, display_order) 
      VALUES (${data.name}, ${data.description}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<CourseCategory>): Promise<DbResult> => {
    const result = await sql`
      UPDATE course_categories 
      SET name = ${data.name}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM course_categories WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Courses operations
export const coursesOps = {
  getAll: async (): Promise<Course[]> => {
    const { rows } = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      ORDER BY c.created_at DESC
    `;
    return rows as Course[];
  },
  getById: async (id: number): Promise<Course | null> => {
    const { rows } = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.id = ${id}
    `;
    return (rows[0] as Course) || null;
  },
  getBySlug: async (slug: string): Promise<Course | null> => {
    const { rows } = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.slug = ${slug}
    `;
    return (rows[0] as Course) || null;
  },
  create: async (data: Partial<Course>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO courses (slug, title, description, duration, audience, category_id, popular, image_url, image_alt)
      VALUES (${data.slug}, ${data.title}, ${data.description}, ${data.duration}, ${data.audience}, ${data.category_id}, ${data.popular ? true : false}, ${data.image_url}, ${data.image_alt})
      RETURNING id
    `;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<Course>): Promise<DbResult> => {
    const result = await sql`
      UPDATE courses SET 
      slug = ${data.slug}, title = ${data.title}, description = ${data.description}, 
      duration = ${data.duration}, audience = ${data.audience}, 
      category_id = ${data.category_id}, popular = ${data.popular ? true : false}, 
      image_url = ${data.image_url}, image_alt = ${data.image_alt}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM courses WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Course Features operations
export const courseFeaturesOps = {
  getAll: async (): Promise<CourseFeature[]> => {
    const { rows } = await sql`SELECT * FROM course_features ORDER BY display_order`;
    return rows as CourseFeature[];
  },
  getByCourseId: async (courseId: number): Promise<CourseFeature[]> => {
    const { rows } = await sql`SELECT * FROM course_features WHERE course_id = ${courseId} ORDER BY display_order`;
    return rows as CourseFeature[];
  },
  create: async (courseId: number, feature: string, order: number = 0): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO course_features (course_id, feature, display_order) 
      VALUES (${courseId}, ${feature}, ${order})
      RETURNING id
    `;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  deleteByCourseId: async (courseId: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM course_features WHERE course_id = ${courseId}`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Team Members operations
export const teamMembersOps = {
  getAll: async (): Promise<TeamMember[]> => {
    const { rows } = await sql`SELECT * FROM team_members ORDER BY display_order`;
    return rows.map(row => {
      try {
        return {
          ...row,
          specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [] as string[])
        };
      } catch (e: unknown) {
        logger.error('Failed to parse specializations', { error: e instanceof Error ? e.message : String(e) });
        return { ...row, specializations: [] as string[] };
      }
    }) as TeamMember[];
  },
  getById: async (id: number): Promise<TeamMember | null> => {
    const { rows } = await sql`SELECT * FROM team_members WHERE id = ${id}`;
    if (rows.length === 0) return null;
    const row = rows[0]!;
    try {
        return {
          ...row,
          specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [] as string[])
        } as TeamMember;
      } catch (e: unknown) {
        logger.error('Failed to parse specializations', { error: e instanceof Error ? e.message : String(e) });
        return { ...row, specializations: [] as string[] } as TeamMember;
      }
  },
  getFeatured: async (): Promise<TeamMember[]> => {
    const { rows } = await sql`SELECT * FROM team_members WHERE featured = true ORDER BY display_order`;
    return rows.map(row => {
      try {
        return {
          ...row,
          specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [] as string[])
        };
      } catch (e: unknown) {
        logger.error('Failed to parse specializations', { error: e instanceof Error ? e.message : String(e) });
        return { ...row, specializations: [] as string[] };
      }
    }) as TeamMember[];
  },
  create: async (data: Partial<TeamMember>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO team_members (name, role, bio, photo_url, experience_years, specializations, featured, display_order)
      VALUES (${data.name}, ${data.role}, ${data.bio}, ${data.photo_url}, ${data.experience_years}, ${JSON.stringify(data.specializations || [] as string[])}, ${data.featured ? true : false}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<TeamMember>): Promise<DbResult> => {
    const result = await sql`
      UPDATE team_members SET 
      name = ${data.name}, role = ${data.role}, bio = ${data.bio}, photo_url = ${data.photo_url}, 
      experience_years = ${data.experience_years}, 
      specializations = ${JSON.stringify(data.specializations || [] as string[])}, 
      featured = ${data.featured ? true : false}, display_order = ${data.display_order}, 
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM team_members WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Hero Section operations
export const heroSectionOps = {
  get: async (): Promise<HeroSection | null> => {
    const { rows } = await sql`SELECT * FROM hero_section WHERE id = 1`;
    return (rows[0] as HeroSection) || null;
  },
  upsert: async (data: Partial<HeroSection>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO hero_section (id, slogan, main_heading, highlight_text, subtitle, background_image_url, background_image_alt, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, updated_at)
      VALUES (1, ${data.slogan}, ${data.main_heading}, ${data.highlight_text}, ${data.subtitle}, ${data.background_image_url}, ${data.background_image_alt}, ${data.primary_button_text}, ${data.primary_button_link}, ${data.secondary_button_text}, ${data.secondary_button_link}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      slogan = ${data.slogan}, main_heading = ${data.main_heading}, highlight_text = ${data.highlight_text}, subtitle = ${data.subtitle}, background_image_url = ${data.background_image_url}, background_image_alt = ${data.background_image_alt}, primary_button_text = ${data.primary_button_text}, primary_button_link = ${data.primary_button_link}, secondary_button_text = ${data.secondary_button_text}, secondary_button_link = ${data.secondary_button_link}, updated_at = CURRENT_TIMESTAMP
    `;
    return { id: 1, changes: result.rowCount ?? 0 };
  },
};

// Hero Stats operations
export const heroStatsOps = {
  getAll: async (): Promise<HeroStat[]> => {
    const { rows } = await sql`SELECT * FROM hero_stats ORDER BY display_order`;
    return rows as HeroStat[];
  },
  create: async (data: Partial<HeroStat>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO hero_stats (number_text, label, description, display_order) 
      VALUES (${data.number_text}, ${data.label}, ${data.description}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<HeroStat>): Promise<DbResult> => {
    const result = await sql`
      UPDATE hero_stats 
      SET number_text = ${data.number_text}, label = ${data.label}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_stats WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_stats`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Hero Features operations
export const heroFeaturesOps = {
  getAll: async (): Promise<HeroFeature[]> => {
    const { rows } = await sql`SELECT * FROM hero_features ORDER BY display_order`;
    return rows as HeroFeature[];
  },
  create: async (data: Partial<HeroFeature>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO hero_features (title, description, display_order) 
      VALUES (${data.title}, ${data.description}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<HeroFeature>): Promise<DbResult> => {
    const result = await sql`
      UPDATE hero_features 
      SET title = ${data.title}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_features WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_features`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Admin Users operations
export const adminUsersOps = {
  getByUsername: async (username: string): Promise<AdminUser | null> => {
    try {
      const { rows } = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
      return (rows[0] as AdminUser) || null;
    } catch (error: unknown) {
      logger.error('Database error getting user by username', { error: (error instanceof Error ? error.message : String(error)), username });
      throw new Error('Failed to retrieve user');
    }
  },
  getById: async (id: number): Promise<AdminUser | null> => {
    try {
      const { rows } = await sql`SELECT * FROM admin_users WHERE id = ${id}`;
      return (rows[0] as AdminUser) || null;
    } catch (error: unknown) {
      logger.error('Database error getting user by ID', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw new Error('Failed to retrieve user');
    }
  },
  updateLastLogin: async (id: number): Promise<DbResult> => {
    try {
      const result = await sql`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ${id}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating last login', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw new Error('Failed to update last login');
    }
  },
  updateTokenVersion: async (id: number): Promise<DbResult> => {
    try {
      const result = await sql`UPDATE admin_users SET token_version = token_version + 1 WHERE id = ${id}`;
      return { changes: result.rowCount ?? 0 };
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
      const now = new Date().toISOString();
      const result = await sql`
        INSERT INTO admin_sessions (user_id, token, expires_at, last_activity, ip_address, user_agent, created_at) 
        VALUES (${userId}, ${token}, ${expiresAt}, ${now}, ${ipAddress}, ${userAgent}, ${now})
        RETURNING id
      `;
      return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error creating session', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to create session');
    }
  },
  getByToken: async (token: string): Promise<AdminSession | null> => {
    try {
      const { rows } = await sql`
        SELECT s.*, u.username, u.email, u.token_version
        FROM admin_sessions s 
        JOIN admin_users u ON s.user_id = u.id 
        WHERE s.token = ${token} AND s.expires_at > CURRENT_TIMESTAMP
      `;
      return (rows[0] as AdminSession) || null;
    } catch (error: unknown) {
      logger.error('Database error getting session by token', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to retrieve session');
    }
  },
  getByUserId: async (userId: number): Promise<AdminSession[]> => {
    try {
      const { rows } = await sql`
        SELECT s.*, u.username, u.email
        FROM admin_sessions s
        JOIN admin_users u ON s.user_id = u.id
        WHERE s.user_id = ${userId}
        ORDER BY s.created_at DESC
      `;
      return rows as AdminSession[];
    } catch (error: unknown) {
      logger.error('Database error getting user sessions', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to retrieve user sessions');
    }
  },
  updateLastActivity: async (token: string): Promise<DbResult> => {
    try {
      const now = new Date().toISOString();
      const result = await sql`UPDATE admin_sessions SET last_activity = ${now} WHERE token = ${token}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating session activity', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to update session activity');
    }
  },
  updateToken: async (sessionId: number, newToken: string, newExpiresAt: string): Promise<DbResult> => {
    try {
      const result = await sql`
        UPDATE admin_sessions 
        SET token = ${newToken}, expires_at = ${newExpiresAt} 
        WHERE id = ${sessionId}
      `;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating session token', { error: error instanceof Error ? error.message : String(error), sessionId });
      throw new Error('Failed to update session token');
    }
  },
  'delete': async (token: string): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to delete session');
    }
  },
  deleteAllExcept: async (userId: number, currentToken: string): Promise<number> => {
    try {
      const result = await sql`
        DELETE FROM admin_sessions 
        WHERE user_id = ${userId} AND token != ${currentToken}
      `;
      return result.rowCount ?? 0;
    } catch (error: unknown) {
      logger.error('Database error deleting other sessions', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete other sessions');
    }
  },
  deleteAllByUserId: async (userId: number): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE user_id = ${userId}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting user sessions', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete user sessions');
    }
  },
  cleanup: async (): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error cleaning up expired sessions', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to clean up expired sessions');
    }
  },
  deleteByUserId: async (userId: number): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE user_id = ${userId}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting sessions by user ID', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete sessions by user ID');
    }
  },
  deleteByToken: async (token: string): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session by token', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to delete session by token');
    }
  },
  getById: async (sessionId: number): Promise<AdminSession | null> => {
    try {
      const { rows } = await sql`
        SELECT s.*, u.username, u.email
        FROM admin_sessions s
        JOIN admin_users u ON s.user_id = u.id
        WHERE s.id = ${sessionId}
      `;
      return (rows[0] as AdminSession) || null;
    } catch (error: unknown) {
      logger.error('Database error getting session by ID', { error: error instanceof Error ? error.message : String(error), sessionId });
      throw new Error('Failed to retrieve session by ID');
    }
  },
  deleteById: async (sessionId: number): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE id = ${sessionId}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session by ID', { error: error instanceof Error ? error.message : String(error), sessionId: sessionId });
      throw new Error('Failed to delete session by ID');
    }
  },
};

// Footer Content operations
export const footerContentOps = {
  get: async (): Promise<FooterContent | null> => {
    const { rows } = await sql`SELECT * FROM footer_content WHERE id = 1`;
    return (rows[0] as FooterContent) || null;
  },
  upsert: async (data: Partial<FooterContent>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_content (id, company_name, tagline, slogan, description, phone, email, location, logo_url, logo_alt, copyright_text, tagline_bottom, updated_at)
      VALUES (1, ${data.company_name}, ${data.tagline}, ${data.slogan}, ${data.description}, ${data.phone}, ${data.email}, ${data.location}, ${data.logo_url}, ${data.logo_alt}, ${data.copyright_text}, ${data.tagline_bottom}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
      company_name = ${data.company_name}, tagline = ${data.tagline}, slogan = ${data.slogan}, description = ${data.description}, phone = ${data.phone}, email = ${data.email}, location = ${data.location}, logo_url = ${data.logo_url}, logo_alt = ${data.logo_alt}, copyright_text = ${data.copyright_text}, tagline_bottom = ${data.tagline_bottom}, updated_at = CURRENT_TIMESTAMP
    `;
    return { id: 1, changes: result.rowCount ?? 0 };
  },
};

// Footer Stats operations
export const footerStatsOps = {
  getAll: async (): Promise<FooterStat[]> => {
    const { rows } = await sql`SELECT * FROM footer_stats ORDER BY display_order`;
    return rows as FooterStat[];
  },
  create: async (data: Partial<FooterStat>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_stats (number_text, label, display_order) 
      VALUES (${data.number_text}, ${data.label}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<FooterStat>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_stats 
      SET number_text = ${data.number_text}, label = ${data.label}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_stats WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_stats`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Footer Quick Links operations
export const footerQuickLinksOps = {
  getAll: async (): Promise<FooterQuickLink[]> => {
    const { rows } = await sql`SELECT * FROM footer_quick_links WHERE is_active = true ORDER BY display_order`;
    return rows as FooterQuickLink[];
  },
  getAllIncludingInactive: async (): Promise<FooterQuickLink[]> => {
    const { rows } = await sql`SELECT * FROM footer_quick_links ORDER BY display_order`;
    return rows as FooterQuickLink[];
  },
  create: async (data: Partial<FooterQuickLink>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_quick_links (title, url, display_order, is_active) 
      VALUES (${data.title}, ${data.url}, ${data.display_order || 0}, ${data.is_active !== false})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<FooterQuickLink>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_quick_links 
      SET title = ${data.title}, url = ${data.url}, display_order = ${data.display_order}, is_active = ${data.is_active !== false}
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_quick_links WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_quick_links`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Footer Certifications operations
export const footerCertificationsOps = {
  getAll: async (): Promise<FooterCertification[]> => {
    const { rows } = await sql`SELECT * FROM footer_certifications WHERE is_active = true ORDER BY display_order`;
    return rows as FooterCertification[];
  },
  getAllIncludingInactive: async (): Promise<FooterCertification[]> => {
    const { rows } = await sql`SELECT * FROM footer_certifications ORDER BY display_order`;
    return rows as FooterCertification[];
  },
  create: async (data: Partial<FooterCertification>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_certifications (title, icon, display_order, is_active) 
      VALUES (${data.title}, ${data.icon || 'Award'}, ${data.display_order || 0}, ${data.is_active !== false})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<FooterCertification>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_certifications 
      SET title = ${data.title}, icon = ${data.icon}, display_order = ${data.display_order}, is_active = ${data.is_active !== false}
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_certifications WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_certifications`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Footer Bottom Badges operations
export const footerBottomBadgesOps = {
  getAll: async (): Promise<FooterBottomBadge[]> => {
    const { rows } = await sql`SELECT * FROM footer_bottom_badges WHERE is_active = true ORDER BY display_order`;
    return rows as FooterBottomBadge[];
  },
  getAllIncludingInactive: async (): Promise<FooterBottomBadge[]> => {
    const { rows } = await sql`SELECT * FROM footer_bottom_badges ORDER BY display_order`;
    return rows as FooterBottomBadge[];
  },
  create: async (data: Partial<FooterBottomBadge>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_bottom_badges (title, icon, display_order, is_active) 
      VALUES (${data.title}, ${data.icon || 'Award'}, ${data.display_order || 0}, ${data.is_active !== false})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<FooterBottomBadge>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_bottom_badges 
      SET title = ${data.title}, icon = ${data.icon}, display_order = ${data.display_order}, is_active = ${data.is_active !== false}
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_bottom_badges WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_bottom_badges`;
    return { changes: result.rowCount ?? 0 };
  },
};

// Files operations
export const filesOps = {
  getAll: async (): Promise<File[]> => {
    const { rows } = await sql`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `;
    return rows as File[];
  },
  getById: async (id: number): Promise<File | null> => {
    const { rows } = await sql`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.id = ${id} AND f.status = 'active'
    `;
    return (rows[0] as File) || null;
  },
  getByCategory: async (category: string): Promise<File[]> => {
    const { rows } = await sql`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.category = ${category} AND f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `;
    return rows as File[];
  },
  getFeatured: async (): Promise<File[]> => {
    const { rows } = await sql`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.is_featured = true AND f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `;
    return rows as File[];
  },
  getByMimeType: async (mimeType: string): Promise<File[]> => {
    const { rows } = await sql`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.mime_type LIKE ${mimeType + '%'} AND f.status = 'active'
      ORDER BY f.uploaded_at DESC
    `;
    return rows as File[];
  },
  create: async (data: Partial<File>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO files (filename, original_name, file_size, mime_type, file_extension, blob_url, blob_pathname, blob_token, width, height, aspect_ratio, alt_text, title, description, tags, caption, folder_id, category, uploaded_by)
      VALUES (${data.filename}, ${data.original_name}, ${data.file_size}, ${data.mime_type}, ${data.file_extension}, ${data.blob_url}, ${data.blob_pathname}, ${data.blob_token}, ${data.width}, ${data.height}, ${data.aspect_ratio}, ${data.alt_text}, ${data.title}, ${data.description}, ${data.tags}, ${data.caption}, ${data.folder_id}, ${data.category || 'general'}, ${data.uploaded_by})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<File>): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      alt_text = ${data.alt_text || null}, title = ${data.title || null}, description = ${data.description || null}, tags = ${data.tags || null}, caption = ${data.caption || null}, folder_id = ${data.folder_id || null}, category = ${data.category || 'general'}, is_featured = ${data.is_featured ? true : false}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND status = 'active'
    `;
    return { changes: result.rowCount ?? 0 };
  },
  updateUsageCount: async (id: number): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      usage_count = usage_count + 1,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND status = 'active'
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      status = 'deleted',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  hardDelete: async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM files WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  archive: async (id: number): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      status = 'archived',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  restore: async (id: number): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      status = 'active',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
};

// File Folders operations
export const fileFoldersOps = {
  getAll: async (): Promise<FileFolder[]> => {
    const { rows } = await sql`SELECT * FROM file_folders ORDER BY display_order`;
    return rows as FileFolder[];
  },
  getById: async (id: number): Promise<FileFolder | null> => {
    const { rows } = await sql`SELECT * FROM file_folders WHERE id = ${id}`;
    return (rows[0] as FileFolder) || null;
  },
  create: async (data: Partial<FileFolder>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO file_folders (name, description, parent_id, display_order) 
      VALUES (${data.name}, ${data.description}, ${data.parent_id}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  update: async (id: number, data: Partial<FileFolder>): Promise<DbResult> => {
    const result = await sql`
      UPDATE file_folders SET 
      name = ${data.name}, description = ${data.description}, 
      parent_id = ${data.parent_id}, display_order = ${data.display_order},
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM file_folders WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

export { sql };

export type { DbResult, CompanyInfo, CompanyValue, WhyChooseUs, CourseCategory, Course, CourseFeature, TeamMember, HeroSection, HeroStat, HeroFeature, AdminUser, AdminSession, FooterContent, FooterStat, FooterQuickLink, FooterCertification, FooterBottomBadge, File, FileFolder };