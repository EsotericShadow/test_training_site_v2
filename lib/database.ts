/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: database.ts
 * Description: This script centralizes all database operations for the Karma Training Website.
 * It provides a consistent and organized way to interact with the PostgreSQL database,
 * abstracting the SQL queries into a set of exported objects. Each object corresponds
 * to a specific database table and contains methods for common CRUD (Create, Read,
 * Update, Delete) operations. This approach promotes code reusability, simplifies
 * maintenance, and enhances security by preventing SQL injection vulnerabilities
 * through the use of parameterized queries with the `@vercel/postgres` library.
 *
 * Dependencies:
 * - @vercel/postgres: Used for connecting to and querying the Vercel PostgreSQL database.
 * - ./logger: The application's centralized logging utility, for recording database-related errors.
 * - ../types/database: Contains TypeScript type definitions for all database tables, ensuring type safety.
 *
 * Created: 2025-07-17
 * Last Modified: 2025-07-18
 * Version: 1.0.1
 */
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

interface CourseRow extends Course {
  features: { feature: string; display_order: number }[];
  category_name: string | null;
}

type DbResult<T = never> = {
  id?: number | null;
  changes: number;
  data?: T;
};

/**
 * @constant companyInfoOps
 * @description A collection of database operations for the `company_info` table.
 * This table stores a single row of company information, so the operations are
 * designed to either retrieve or update this single row.
 */
export const companyInfoOps = {
  /**
   * @method get
   * @description Retrieves the company information from the database.
   * @returns {Promise<CompanyInfo | null>} The company information, or null if not found.
   */
  get: async (): Promise<CompanyInfo | null> => {
    const { rows } = await sql`SELECT * FROM company_info WHERE id = 1`;
    return (rows[0] as CompanyInfo) || null;
  },
  /**
   * @method upsert
   * @description Inserts or updates the company information in the database.
   * The `ON CONFLICT` clause ensures that if the row with `id = 1` already exists,
   * it will be updated instead of throwing an error.
   * @param {Partial<CompanyInfo>} data - The company information to be inserted or updated.
   * @returns {Promise<DbResult>} The result of the operation.
   */
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

/**
 * @constant companyValuesOps
 * @description A collection of database operations for the `company_values` table.
 * This table stores the company's core values, which are displayed on the website.
 */
export const companyValuesOps = {
  /**
   * @method getAll
   * @description Retrieves all company values from the database, ordered by their display order.
   * @returns {Promise<CompanyValue[]>} A list of all company values.
   */
  getAll: async (): Promise<CompanyValue[]> => {
    const { rows } = await sql`SELECT * FROM company_values ORDER BY display_order`;
    return rows as CompanyValue[];
  },
  /**
   * @method create
   * @description Creates a new company value in the database.
   * @param {Partial<CompanyValue>} data - The data for the new company value.
   * @returns {Promise<DbResult>} The result of the operation, including the new value's ID.
   */
  create: async (data: Partial<CompanyValue>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO company_values (title, description, icon, display_order) 
      VALUES (${data.title}, ${data.description}, ${data.icon}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing company value in the database.
   * @param {number} id - The ID of the company value to update.
   * @param {Partial<CompanyValue>} data - The new data for the company value.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<CompanyValue>): Promise<DbResult> => {
    const result = await sql`
      UPDATE company_values 
      SET title = ${data.title}, description = ${data.description}, icon = ${data.icon}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a company value from the database.
   * @param {number} id - The ID of the company value to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_values WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all company values from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_values`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant whyChooseUsOps
 * @description A collection of database operations for the `company_why_choose_us` table.
 * This table stores the reasons why customers should choose the company, which are displayed on the website.
 */
export const whyChooseUsOps = {
  /**
   * @method getAll
   * @description Retrieves all "Why Choose Us" points from the database, ordered by their display order.
   * @returns {Promise<WhyChooseUs[]>} A list of all "Why Choose Us" points.
   */
  getAll: async (): Promise<WhyChooseUs[]> => {
    const { rows } = await sql`SELECT * FROM company_why_choose_us ORDER BY display_order`;
    return rows as WhyChooseUs[];
  },
  /**
   * @method create
   * @description Creates a new "Why Choose Us" point in the database.
   * @param {Partial<WhyChooseUs>} data - The data for the new point.
   * @returns {Promise<DbResult>} The result of the operation, including the new point's ID.
   */
  create: async (data: Partial<WhyChooseUs>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO company_why_choose_us (point, display_order, image_url, image_alt) 
      VALUES (${data.point}, ${data.display_order || 0}, ${data.image_url || null}, ${data.image_alt || null})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing "Why Choose Us" point in the database.
   * @param {number} id - The ID of the point to update.
   * @param {Partial<WhyChooseUs>} data - The new data for the point.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<WhyChooseUs>): Promise<DbResult> => {
    const result = await sql`
      UPDATE company_why_choose_us 
      SET point = ${data.point}, display_order = ${data.display_order}, image_url = ${data.image_url || null}, image_alt = ${data.image_alt || null} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a "Why Choose Us" point from the database.
   * @param {number} id - The ID of the point to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_why_choose_us WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all "Why Choose Us" points from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM company_why_choose_us`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant courseCategoriesOps
 * @description A collection of database operations for the `course_categories` table.
 * This table stores the different categories of courses offered by the company.
 */
export const courseCategoriesOps = {
  /**
   * @method getAll
   * @description Retrieves all course categories from the database, ordered by their display order.
   * @returns {Promise<CourseCategory[]>} A list of all course categories.
   */
  getAll: async (): Promise<CourseCategory[]> => {
    const { rows } = await sql`SELECT * FROM course_categories ORDER BY display_order`;
    return rows as CourseCategory[];
  },
  /**
   * @method getById
   * @description Retrieves a single course category by its ID.
   * @param {number} id - The ID of the course category to retrieve.
   * @returns {Promise<CourseCategory | null>} The course category, or null if not found.
   */
  getById: async (id: number): Promise<CourseCategory | null> => {
    const { rows } = await sql`SELECT * FROM course_categories WHERE id = ${id}`;
    return (rows[0] as CourseCategory) || null;
  },
  /**
   * @method create
   * @description Creates a new course category in the database.
   * @param {Partial<CourseCategory>} data - The data for the new course category.
   * @returns {Promise<DbResult>} The result of the operation, including the new category's ID.
   */
  create: async (data: Partial<CourseCategory>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO course_categories (name, description, display_order) 
      VALUES (${data.name}, ${data.description}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing course category in the database.
   * @param {number} id - The ID of the course category to update.
   * @param {Partial<CourseCategory>} data - The new data for the course category.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<CourseCategory>): Promise<DbResult> => {
    const result = await sql`
      UPDATE course_categories 
      SET name = ${data.name}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a course category from the database.
   * @param {number} id - The ID of the course category to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM course_categories WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant coursesOps
 * @description A collection of database operations for the `courses` table.
 * This table stores the details of the courses offered by the company.
 */
export const coursesOps = {
  /**
   * @method getAll
   * @description Retrieves all courses from the database, along with their category name.
   * @returns {Promise<Course[]>} A list of all courses.
   */
  getAll: async (): Promise<Course[]> => {
    const { rows } = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      ORDER BY c.created_at DESC
    `;
    return rows as Course[];
  },
  /**
   * @method getAllWithDetails
   * @description Retrieves all courses from the database, along with their category name and a list of their features.
   * @returns {Promise<Course[]>} A list of all courses with their details.
   */
  getAllWithDetails: async (): Promise<Course[]> => {
    const { rows } = await sql<CourseRow>`
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
          ARRAY_AGG(json_build_object('feature', cf.feature, 'display_order', cf.display_order) ORDER BY cf.display_order) FILTER (WHERE cf.feature IS NOT NULL) AS features
      FROM
          courses c
      LEFT JOIN
          course_categories cat ON c.category_id = cat.id
      LEFT JOIN
          course_features cf ON c.id = cf.course_id
      GROUP BY
          c.id, c.slug, c.title, c.description, c.duration, c.audience, c.category_id, c.popular, c.image_url, c.image_alt, c.created_at, c.updated_at, c.overview, c.what_youll_learn, cat.name
      ORDER BY
          c.created_at DESC
    `;
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      what_youll_learn: row.what_youll_learn,
      duration: row.duration,
      audience: row.audience,
      category_id: row.category_id,
      popular: row.popular,
      image_url: row.image_url,
      image_alt: row.image_alt,
      created_at: row.created_at,
      updated_at: row.updated_at,
      overview: row.overview,
      category_name: row.category_name,
      features: row.features || [],
    })) as Course[];
  },
  /**
   * @method getById
   * @description Retrieves a single course by its ID, along with its category name.
   * @param {number} id - The ID of the course to retrieve.
   * @returns {Promise<Course | null>} The course, or null if not found.
   */
  getById: async (id: number): Promise<Course | null> => {
    const { rows } = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.id = ${id}
    `;
    return (rows[0] as Course) || null;
  },
  /**
   * @method getBySlug
   * @description Retrieves a single course by its slug, along with its category name.
   * @param {string} slug - The slug of the course to retrieve.
   * @returns {Promise<Course | null>} The course, or null if not found.
   */
  getBySlug: async (slug: string): Promise<Course | null> => {
    const { rows } = await sql`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cat ON c.category_id = cat.id 
      WHERE c.slug = ${slug}
    `;
    return (rows[0] as Course) || null;
  },
  /**
   * @method create
   * @description Creates a new course in the database.
   * @param {Partial<Course>} data - The data for the new course.
   * @returns {Promise<DbResult>} The result of the operation, including the new course's ID.
   */
  create: async (data: Partial<Course>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO courses (slug, title, description, duration, audience, category_id, popular, image_url, image_alt)
      VALUES (${data.slug}, ${data.title}, ${data.description}, ${data.duration}, ${data.audience}, ${data.category_id}, ${data.popular ? true : false}, ${data.image_url}, ${data.image_alt})
      RETURNING id
    `;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing course in the database.
   * @param {number} id - The ID of the course to update.
   * @param {Partial<Course>} data - The new data for the course.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<Course>): Promise<DbResult> => {
    const result = await sql`
      UPDATE courses SET 
      slug = ${data.slug}, title = ${data.title}, description = ${data.description}, 
      what_youll_learn = ${data.what_youll_learn},
      duration = ${data.duration}, audience = ${data.audience}, 
      category_id = ${data.category_id}, popular = ${data.popular ? true : false}, 
      image_url = ${data.image_url}, image_alt = ${data.image_alt}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a course from the database.
   * @param {number} id - The ID of the course to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM courses WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant courseFeaturesOps
 * @description A collection of database operations for the `course_features` table.
 * This table stores the features of each course, which are displayed on the course details page.
 */
export const courseFeaturesOps = {
  /**
   * @method getAll
   * @description Retrieves all course features from the database, ordered by their display order.
   * @returns {Promise<CourseFeature[]>} A list of all course features.
   */
  getAll: async (): Promise<CourseFeature[]> => {
    const { rows } = await sql`SELECT * FROM course_features ORDER BY display_order`;
    return rows as CourseFeature[];
  },
  /**
   * @method getByCourseId
   * @description Retrieves all features for a specific course, ordered by their display order.
   * @param {number} courseId - The ID of the course to retrieve features for.
   * @returns {Promise<CourseFeature[]>} A list of all features for the specified course.
   */
  getByCourseId: async (courseId: number): Promise<CourseFeature[]> => {
    const { rows } = await sql`SELECT * FROM course_features WHERE course_id = ${courseId} ORDER BY display_order`;
    return rows as CourseFeature[];
  },
  /**
   * @method create
   * @description Creates a new course feature in the database.
   * @param {number} courseId - The ID of the course this feature belongs to.
   * @param {string} feature - The description of the feature.
   * @param {number} [order=0] - The display order of the feature.
   * @returns {Promise<DbResult>} The result of the operation, including the new feature's ID.
   */
  create: async (courseId: number, feature: string, order: number = 0): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO course_features (course_id, feature, display_order)
      VALUES (${courseId}, ${feature}, ${order})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteByCourseId
   * @description Deletes all features for a specific course from the database.
   * @param {number} courseId - The ID of the course to delete features for.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteByCourseId: async (courseId: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM course_features WHERE course_id = ${courseId}`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant teamMembersOps
 * @description A collection of database operations for the `team_members` table.
 * This table stores information about the company's team members.
 */
export const teamMembersOps = {
  /**
   * @method getAll
   * @description Retrieves all team members from the database, ordered by their display order.
   * It safely parses the `specializations` field, which is stored as a JSON string in the database.
   * If parsing fails, it defaults to an empty array and logs the error, preventing a crash.
   * @returns {Promise<TeamMember[]>} A list of all team members.
   */
  getAll: async (): Promise<TeamMember[]> => {
    const { rows } = await sql`SELECT * FROM team_members ORDER BY display_order`;
    return rows.map(row => {
      try {
        return {
          ...row,
          specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [] as string[])
        };
      } catch (e: unknown) {
        logger.error('Failed to parse specializations', { error: e instanceof Error ? e.message : String(e), memberId: row.id });
        return { ...row, specializations: [] as string[] };
      }
    }) as TeamMember[];
  },

  /**
   * @method getById
   * @description Retrieves a single team member by their ID.
   * It safely parses the `specializations` field, which is stored as a JSON string.
   * This is crucial for ensuring that malformed JSON in the database doesn't crash the application.
   * @param {number} id - The ID of the team member to retrieve.
   * @returns {Promise<TeamMember | null>} The team member, or null if not found.
   */
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
        logger.error('Failed to parse specializations', { error: e instanceof Error ? e.message : String(e), memberId: id });
        return { ...row, specializations: [] as string[] } as TeamMember;
      }
  },

  /**
   * @method getFeatured
   * @description Retrieves all featured team members from the database, ordered by their display order.
   * This is used to highlight specific team members on the website's main pages.
   * @returns {Promise<TeamMember[]>} A list of all featured team members.
   */
  getFeatured: async (): Promise<TeamMember[]> => {
    const { rows } = await sql`SELECT * FROM team_members WHERE featured = true ORDER BY display_order`;
    return rows.map(row => {
      try {
        return {
          ...row,
          specializations: typeof row.specializations === 'string' ? JSON.parse(row.specializations) : (row.specializations || [] as string[])
        };
      } catch (e: unknown) {
        logger.error('Failed to parse specializations for featured member', { error: e instanceof Error ? e.message : String(e), memberId: row.id });
        return { ...row, specializations: [] as string[] };
      }
    }) as TeamMember[];
  },

  /**
   * @method create
   * @description Creates a new team member in the database.
   * The `specializations` array is converted to a JSON string before being stored.
   * @param {Partial<TeamMember>} data - The data for the new team member.
   * @returns {Promise<DbResult>} The result of the operation, including the new member's ID.
   */
  create: async (data: Partial<TeamMember>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO team_members (name, role, bio, photo_url, experience_years, specializations, featured, display_order)
      VALUES (${data.name}, ${data.role}, ${data.bio}, ${data.photo_url}, ${data.experience_years}, ${JSON.stringify(data.specializations || [] as string[])}, ${data.featured ? true : false}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },

  /**
   * @method update
   * @description Updates an existing team member in the database.
   * The `specializations` array is converted to a JSON string before being stored.
   * @param {number} id - The ID of the team member to update.
   * @param {Partial<TeamMember>} data - The new data for the team member.
   * @returns {Promise<DbResult>} The result of the operation.
   */
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

  /**
   * @method delete
   * @description Deletes a team member from the database.
   * @param {number} id - The ID of the team member to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM team_members WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant heroSectionOps
 * @description A collection of database operations for the `hero_section` table.
 * This table stores the hero section content that appears at the top of the website's homepage.
 * Like company_info, this table is designed to hold a single row of data.
 */
export const heroSectionOps = {
  /**
   * @method get
   * @description Retrieves the hero section data from the database.
   * @returns {Promise<HeroSection | null>} The hero section data, or null if not found.
   */
  get: async (): Promise<HeroSection | null> => {
    const { rows } = await sql`SELECT * FROM hero_section WHERE id = 1`;
    return (rows[0] as HeroSection) || null;
  },
  /**
   * @method upsert
   * @description Inserts or updates the hero section data in the database.
   * Uses the ON CONFLICT clause to update the existing row if it already exists.
   * @param {Partial<HeroSection>} data - The hero section data to be inserted or updated.
   * @returns {Promise<DbResult>} The result of the operation.
   */
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

/**
 * @constant heroStatsOps
 * @description A collection of database operations for the `hero_stats` table.
 * This table stores statistical information displayed in the hero section to showcase company achievements.
 */
export const heroStatsOps = {
  /**
   * @method getAll
   * @description Retrieves all hero statistics from the database, ordered by their display order.
   * @returns {Promise<HeroStat[]>} A list of all hero statistics.
   */
  getAll: async (): Promise<HeroStat[]> => {
    const { rows } = await sql`SELECT * FROM hero_stats ORDER BY display_order`;
    return rows as HeroStat[];
  },
  /**
   * @method create
   * @description Creates a new hero statistic in the database.
   * @param {Partial<HeroStat>} data - The data for the new hero statistic.
   * @returns {Promise<DbResult>} The result of the operation, including the new statistic's ID.
   */
  create: async (data: Partial<HeroStat>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO hero_stats (number_text, label, description, display_order) 
      VALUES (${data.number_text}, ${data.label}, ${data.description}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing hero statistic in the database.
   * @param {number} id - The ID of the hero statistic to update.
   * @param {Partial<HeroStat>} data - The new data for the hero statistic.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<HeroStat>): Promise<DbResult> => {
    const result = await sql`
      UPDATE hero_stats 
      SET number_text = ${data.number_text}, label = ${data.label}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a hero statistic from the database.
   * @param {number} id - The ID of the hero statistic to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_stats WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all hero statistics from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_stats`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant heroFeaturesOps
 * @description A collection of database operations for the `hero_features` table.
 * This table stores key features or selling points displayed in the hero section.
 */
export const heroFeaturesOps = {
  /**
   * @method getAll
   * @description Retrieves all hero features from the database, ordered by their display order.
   * @returns {Promise<HeroFeature[]>} A list of all hero features.
   */
  getAll: async (): Promise<HeroFeature[]> => {
    const { rows } = await sql`SELECT * FROM hero_features ORDER BY display_order`;
    return rows as HeroFeature[];
  },
  /**
   * @method create
   * @description Creates a new hero feature in the database.
   * @param {Partial<HeroFeature>} data - The data for the new hero feature.
   * @returns {Promise<DbResult>} The result of the operation, including the new feature's ID.
   */
  create: async (data: Partial<HeroFeature>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO hero_features (title, description, display_order) 
      VALUES (${data.title}, ${data.description}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing hero feature in the database.
   * @param {number} id - The ID of the hero feature to update.
   * @param {Partial<HeroFeature>} data - The new data for the hero feature.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<HeroFeature>): Promise<DbResult> => {
    const result = await sql`
      UPDATE hero_features 
      SET title = ${data.title}, description = ${data.description}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a hero feature from the database.
   * @param {number} id - The ID of the hero feature to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_features WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all hero features from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM hero_features`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant adminUsersOps
 * @description A collection of database operations for the `admin_users` table.
 * This table stores administrator user accounts with authentication and authorization data.
 * All methods include comprehensive error handling and logging for security purposes.
 */
export const adminUsersOps = {
  /**
   * @method getByUsername
   * @description Retrieves an admin user by their username.
   * This method is primarily used during the authentication process.
   * Includes error handling to prevent information leakage in case of database errors.
   * @param {string} username - The username of the admin user to retrieve.
   * @returns {Promise<AdminUser | null>} The admin user, or null if not found.
   * @throws {Error} Throws a generic error message to prevent information disclosure.
   */
  getByUsername: async (username: string): Promise<AdminUser | null> => {
    try {
      const { rows } = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
      return (rows[0] as AdminUser) || null;
    } catch (error: unknown) {
      logger.error('Database error getting user by username', { error: (error instanceof Error ? error.message : String(error)), username });
      throw new Error('Failed to retrieve user');
    }
  },
  /**
   * @method getById
   * @description Retrieves an admin user by their ID.
   * Used for session validation and user profile operations.
   * @param {number} id - The ID of the admin user to retrieve.
   * @returns {Promise<AdminUser | null>} The admin user, or null if not found.
   * @throws {Error} Throws a generic error message to prevent information disclosure.
   */
  getById: async (id: number): Promise<AdminUser | null> => {
    try {
      const { rows } = await sql`SELECT * FROM admin_users WHERE id = ${id}`;
      return (rows[0] as AdminUser) || null;
    } catch (error: unknown) {
      logger.error('Database error getting user by ID', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw new Error('Failed to retrieve user');
    }
  },
  /**
   * @method updateLastLogin
   * @description Updates the last login timestamp for an admin user.
   * This is called automatically when a user successfully authenticates.
   * @param {number} id - The ID of the admin user.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the update fails.
   */
  updateLastLogin: async (id: number): Promise<DbResult> => {
    try {
      const result = await sql`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ${id}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error updating last login', { error: error instanceof Error ? error.message : String(error), userId: id });
      throw new Error('Failed to update last login');
    }
  },
  /**
   * @method updateTokenVersion
   * @description Increments the token version for an admin user.
   * This invalidates all existing JWT tokens for the user, effectively logging them out from all devices.
   * Used for security purposes when a user's account may be compromised.
   * @param {number} id - The ID of the admin user.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the update fails.
   */
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

/**
 * @constant adminSessionsOps
 * @description A collection of database operations for the `admin_sessions` table.
 * This table stores active admin sessions for authentication and session management.
 * All methods include comprehensive error handling and logging for security auditing.
 */
export const adminSessionsOps = {
  /**
   * @method create
   * @description Creates a new admin session in the database.
   * This is called when an admin user successfully logs in.
   * @param {number} userId - The ID of the admin user.
   * @param {string} token - The session token (typically a JWT).
   * @param {string} expiresAt - The expiration timestamp for the session.
   * @param {string} [ipAddress='unknown'] - The IP address of the client.
   * @param {string} [userAgent='unknown'] - The user agent string of the client.
   * @returns {Promise<DbResult>} The result of the operation, including the new session's ID.
   * @throws {Error} Throws a generic error message if the creation fails.
   */
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
  /**
   * @method getByToken
   * @description Retrieves a session by its token, including user information.
   * This method is used for session validation during authenticated requests.
   * Only returns non-expired sessions.
   * @param {string} token - The session token to look up.
   * @returns {Promise<AdminSession | null>} The session with user data, or null if not found or expired.
   * @throws {Error} Throws a generic error message if the retrieval fails.
   */
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
  /**
   * @method getByUserId
   * @description Retrieves all sessions for a specific user.
   * Used for session management and security monitoring.
   * @param {number} userId - The ID of the user whose sessions to retrieve.
   * @returns {Promise<AdminSession[]>} A list of all sessions for the user.
   * @throws {Error} Throws a generic error message if the retrieval fails.
   */
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
  /**
   * @method updateLastActivity
   * @description Updates the last activity timestamp for a session.
   * This is called on each authenticated request to track session usage.
   * @param {string} token - The session token to update.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the update fails.
   */
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
  /**
   * @method updateToken
   * @description Updates the token and expiration time for an existing session.
   * Used for token refresh operations.
   * @param {number} sessionId - The ID of the session to update.
   * @param {string} newToken - The new session token.
   * @param {string} newExpiresAt - The new expiration timestamp.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the update fails.
   */
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
  /**
   * @method delete
   * @description Deletes a session by its token.
   * Used for logout operations.
   * @param {string} token - The session token to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the deletion fails.
   */
  'delete': async (token: string): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to delete session');
    }
  },
  /**
   * @method deleteAllExcept
   * @description Deletes all sessions for a user except the current one.
   * Used for "logout from other devices" functionality.
   * @param {number} userId - The ID of the user.
   * @param {string} currentToken - The current session token to preserve.
   * @returns {Promise<number>} The number of sessions deleted.
   * @throws {Error} Throws a generic error message if the deletion fails.
   */
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
  /**
   * @method deleteAllByUserId
   * @description Deletes all sessions for a specific user.
   * Used for security purposes when an account is compromised.
   * @param {number} userId - The ID of the user whose sessions to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the deletion fails.
   */
  deleteAllByUserId: async (userId: number): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE user_id = ${userId}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting user sessions', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete user sessions');
    }
  },
  /**
   * @method cleanup
   * @description Removes expired sessions from the database.
   * This should be called periodically to maintain database hygiene.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the cleanup fails.
   */
  cleanup: async (): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error cleaning up expired sessions', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to clean up expired sessions');
    }
  },
  /**
   * @method deleteByUserId
   * @description Alternative method name for deleteAllByUserId for backward compatibility.
   * @param {number} userId - The ID of the user whose sessions to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the deletion fails.
   */
  deleteByUserId: async (userId: number): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE user_id = ${userId}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting sessions by user ID', { error: error instanceof Error ? error.message : String(error), userId });
      throw new Error('Failed to delete sessions by user ID');
    }
  },
  /**
   * @method deleteByToken
   * @description Alternative method name for delete for backward compatibility.
   * @param {string} token - The session token to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the deletion fails.
   */
  deleteByToken: async (token: string): Promise<DbResult> => {
    try {
      const result = await sql`DELETE FROM admin_sessions WHERE token = ${token}`;
      return { changes: result.rowCount ?? 0 };
    } catch (error: unknown) {
      logger.error('Database error deleting session by token', { error: error instanceof Error ? error.message : String(error) });
      throw new Error('Failed to delete session by token');
    }
  },
  /**
   * @method getById
   * @description Retrieves a session by its ID, including user information.
   * @param {number} sessionId - The ID of the session to retrieve.
   * @returns {Promise<AdminSession | null>} The session with user data, or null if not found.
   * @throws {Error} Throws a generic error message if the retrieval fails.
   */
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
  /**
   * @method deleteById
   * @description Deletes a session by its ID.
   * @param {number} sessionId - The ID of the session to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   * @throws {Error} Throws a generic error message if the deletion fails.
   */
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

/**
 * @constant footerContentOps
 * @description A collection of database operations for the `footer_content` table.
 * This table stores the main footer content that appears at the bottom of every page.
 * Like company_info and hero_section, this table is designed to hold a single row of data.
 */
export const footerContentOps = {
  /**
   * @method get
   * @description Retrieves the footer content from the database.
   * @returns {Promise<FooterContent | null>} The footer content, or null if not found.
   */
  get: async (): Promise<FooterContent | null> => {
    const { rows } = await sql`SELECT * FROM footer_content WHERE id = 1`;
    return (rows[0] as FooterContent) || null;
  },
  /**
   * @method upsert
   * @description Inserts or updates the footer content in the database.
   * Uses the ON CONFLICT clause to update the existing row if it already exists.
   * @param {Partial<FooterContent>} data - The footer content data to be inserted or updated.
   * @returns {Promise<DbResult>} The result of the operation.
   */
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

/**
 * @constant footerStatsOps
 * @description A collection of database operations for the `footer_stats` table.
 * This table stores statistical information displayed in the footer section.
 */
export const footerStatsOps = {
  /**
   * @method getAll
   * @description Retrieves all footer statistics from the database, ordered by their display order.
   * @returns {Promise<FooterStat[]>} A list of all footer statistics.
   */
  getAll: async (): Promise<FooterStat[]> => {
    const { rows } = await sql`SELECT * FROM footer_stats ORDER BY display_order`;
    return rows as FooterStat[];
  },
  /**
   * @method create
   * @description Creates a new footer statistic in the database.
   * @param {Partial<FooterStat>} data - The data for the new footer statistic.
   * @returns {Promise<DbResult>} The result of the operation, including the new statistic's ID.
   */
  create: async (data: Partial<FooterStat>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_stats (number_text, label, display_order) 
      VALUES (${data.number_text}, ${data.label}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing footer statistic in the database.
   * @param {number} id - The ID of the footer statistic to update.
   * @param {Partial<FooterStat>} data - The new data for the footer statistic.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<FooterStat>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_stats 
      SET number_text = ${data.number_text}, label = ${data.label}, display_order = ${data.display_order} 
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a footer statistic from the database.
   * @param {number} id - The ID of the footer statistic to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_stats WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all footer statistics from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_stats`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant footerQuickLinksOps
 * @description A collection of database operations for the `footer_quick_links` table.
 * This table stores navigation links displayed in the footer for quick access to important pages.
 */
export const footerQuickLinksOps = {
  /**
   * @method getAll
   * @description Retrieves all active footer quick links from the database, ordered by their display order.
   * Only returns links that are marked as active.
   * @returns {Promise<FooterQuickLink[]>} A list of all active footer quick links.
   */
  getAll: async (): Promise<FooterQuickLink[]> => {
    const { rows } = await sql`SELECT * FROM footer_quick_links WHERE is_active = true ORDER BY display_order`;
    return rows as FooterQuickLink[];
  },
  /**
   * @method getAllIncludingInactive
   * @description Retrieves all footer quick links from the database, including inactive ones.
   * Used for administrative purposes where all links need to be managed.
   * @returns {Promise<FooterQuickLink[]>} A list of all footer quick links.
   */
  getAllIncludingInactive: async (): Promise<FooterQuickLink[]> => {
    const { rows } = await sql`SELECT * FROM footer_quick_links ORDER BY display_order`;
    return rows as FooterQuickLink[];
  },
  /**
   * @method create
   * @description Creates a new footer quick link in the database.
   * @param {Partial<FooterQuickLink>} data - The data for the new footer quick link.
   * @returns {Promise<DbResult>} The result of the operation, including the new link's ID.
   */
  create: async (data: Partial<FooterQuickLink>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_quick_links (title, url, display_order, is_active) 
      VALUES (${data.title}, ${data.url}, ${data.display_order || 0}, ${data.is_active !== false})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing footer quick link in the database.
   * @param {number} id - The ID of the footer quick link to update.
   * @param {Partial<FooterQuickLink>} data - The new data for the footer quick link.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<FooterQuickLink>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_quick_links 
      SET title = ${data.title}, url = ${data.url}, display_order = ${data.display_order}, is_active = ${data.is_active !== false}
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a footer quick link from the database.
   * @param {number} id - The ID of the footer quick link to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_quick_links WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all footer quick links from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_quick_links`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant footerCertificationsOps
 * @description A collection of database operations for the `footer_certifications` table.
 * This table stores certifications and accreditations displayed in the footer to build trust and credibility.
 */
export const footerCertificationsOps = {
  /**
   * @method getAll
   * @description Retrieves all active footer certifications from the database, ordered by their display order.
   * Only returns certifications that are marked as active.
   * @returns {Promise<FooterCertification[]>} A list of all active footer certifications.
   */
  getAll: async (): Promise<FooterCertification[]> => {
    const { rows } = await sql`SELECT * FROM footer_certifications WHERE is_active = true ORDER BY display_order`;
    return rows as FooterCertification[];
  },
  /**
   * @method getAllIncludingInactive
   * @description Retrieves all footer certifications from the database, including inactive ones.
   * Used for administrative purposes where all certifications need to be managed.
   * @returns {Promise<FooterCertification[]>} A list of all footer certifications.
   */
  getAllIncludingInactive: async (): Promise<FooterCertification[]> => {
    const { rows } = await sql`SELECT * FROM footer_certifications ORDER BY display_order`;
    return rows as FooterCertification[];
  },
  /**
   * @method create
   * @description Creates a new footer certification in the database.
   * @param {Partial<FooterCertification>} data - The data for the new footer certification.
   * @returns {Promise<DbResult>} The result of the operation, including the new certification's ID.
   */
  create: async (data: Partial<FooterCertification>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_certifications (title, icon, display_order, is_active) 
      VALUES (${data.title}, ${data.icon || 'Award'}, ${data.display_order || 0}, ${data.is_active !== false})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing footer certification in the database.
   * @param {number} id - The ID of the footer certification to update.
   * @param {Partial<FooterCertification>} data - The new data for the footer certification.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<FooterCertification>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_certifications 
      SET title = ${data.title}, icon = ${data.icon}, display_order = ${data.display_order}, is_active = ${data.is_active !== false}
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a footer certification from the database.
   * @param {number} id - The ID of the footer certification to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_certifications WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all footer certifications from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_certifications`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant footerBottomBadgesOps
 * @description A collection of database operations for the `footer_bottom_badges` table.
 * This table stores badges and awards displayed at the bottom of the footer for additional credibility.
 */
export const footerBottomBadgesOps = {
  /**
   * @method getAll
   * @description Retrieves all active footer bottom badges from the database, ordered by their display order.
   * Only returns badges that are marked as active.
   * @returns {Promise<FooterBottomBadge[]>} A list of all active footer bottom badges.
   */
  getAll: async (): Promise<FooterBottomBadge[]> => {
    const { rows } = await sql`SELECT * FROM footer_bottom_badges WHERE is_active = true ORDER BY display_order`;
    return rows as FooterBottomBadge[];
  },
  /**
   * @method getAllIncludingInactive
   * @description Retrieves all footer bottom badges from the database, including inactive ones.
   * Used for administrative purposes where all badges need to be managed.
   * @returns {Promise<FooterBottomBadge[]>} A list of all footer bottom badges.
   */
  getAllIncludingInactive: async (): Promise<FooterBottomBadge[]> => {
    const { rows } = await sql`SELECT * FROM footer_bottom_badges ORDER BY display_order`;
    return rows as FooterBottomBadge[];
  },
  /**
   * @method create
   * @description Creates a new footer bottom badge in the database.
   * @param {Partial<FooterBottomBadge>} data - The data for the new footer bottom badge.
   * @returns {Promise<DbResult>} The result of the operation, including the new badge's ID.
   */
  create: async (data: Partial<FooterBottomBadge>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO footer_bottom_badges (title, icon, display_order, is_active) 
      VALUES (${data.title}, ${data.icon || 'Award'}, ${data.display_order || 0}, ${data.is_active !== false})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing footer bottom badge in the database.
   * @param {number} id - The ID of the footer bottom badge to update.
   * @param {Partial<FooterBottomBadge>} data - The new data for the footer bottom badge.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<FooterBottomBadge>): Promise<DbResult> => {
    const result = await sql`
      UPDATE footer_bottom_badges 
      SET title = ${data.title}, icon = ${data.icon}, display_order = ${data.display_order}, is_active = ${data.is_active !== false}
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Deletes a footer bottom badge from the database.
   * @param {number} id - The ID of the footer bottom badge to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_bottom_badges WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method deleteAll
   * @description Deletes all footer bottom badges from the database.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  deleteAll: async (): Promise<DbResult> => {
    const result = await sql`DELETE FROM footer_bottom_badges`;
    return { changes: result.rowCount ?? 0 };
  },
};

/**
 * @constant filesOps
 * @description A collection of database operations for the `files` table.
 * This table stores metadata for uploaded files, including images, documents, and other media assets.
 * Files have a soft-delete mechanism using the 'status' field to maintain referential integrity.
 */
export const filesOps = {
  /**
   * @method getAll
   * @description Retrieves all active files from the database, including their folder names.
   * Only returns files with 'active' status, ordered by upload date (newest first).
   * @returns {Promise<File[]>} A list of all active files with folder information.
   */
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
  /**
   * @method getById
   * @description Retrieves a single active file by its ID, including folder information.
   * @param {number} id - The ID of the file to retrieve.
   * @returns {Promise<File | null>} The file with folder information, or null if not found or inactive.
   */
  getById: async (id: number): Promise<File | null> => {
    const { rows } = await sql`
      SELECT f.*, ff.name as folder_name 
      FROM files f 
      LEFT JOIN file_folders ff ON f.folder_id = ff.id 
      WHERE f.id = ${id} AND f.status = 'active'
    `;
    return (rows[0] as File) || null;
  },
  /**
   * @method getByCategory
   * @description Retrieves all active files in a specific category.
   * @param {string} category - The category of files to retrieve.
   * @returns {Promise<File[]>} A list of all active files in the specified category.
   */
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
  /**
   * @method getFeatured
   * @description Retrieves all featured active files from the database.
   * Featured files are typically highlighted in the admin interface or used for special purposes.
   * @returns {Promise<File[]>} A list of all featured active files.
   */
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
  /**
   * @method getByMimeType
   * @description Retrieves all active files matching a specific MIME type pattern.
   * Uses LIKE operator to match MIME type prefixes (e.g., 'image/' for all image types).
   * @param {string} mimeType - The MIME type pattern to match.
   * @returns {Promise<File[]>} A list of all active files matching the MIME type pattern.
   */
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
  /**
   * @method create
   * @description Creates a new file record in the database.
   * This method stores file metadata but does not handle the actual file upload to blob storage.
   * @param {Partial<File>} data - The file metadata to store.
   * @returns {Promise<DbResult>} The result of the operation, including the new file's ID.
   */
  create: async (data: Partial<File>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO files (filename, original_name, file_size, mime_type, file_extension, blob_url, blob_pathname, blob_token, width, height, aspect_ratio, alt_text, title, description, tags, caption, folder_id, category, uploaded_by)
      VALUES (${data.filename}, ${data.original_name}, ${data.file_size}, ${data.mime_type}, ${data.file_extension}, ${data.blob_url}, ${data.blob_pathname}, ${data.blob_token}, ${data.width}, ${data.height}, ${data.aspect_ratio}, ${data.alt_text}, ${data.title}, ${data.description}, ${data.tags}, ${data.caption}, ${data.folder_id}, ${data.category || 'general'}, ${data.uploaded_by})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates metadata for an existing active file.
   * Only updates descriptive fields, not core file properties like filename or blob URLs.
   * @param {number} id - The ID of the file to update.
   * @param {Partial<File>} data - The new metadata for the file.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  update: async (id: number, data: Partial<File>): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      alt_text = ${data.alt_text || null}, title = ${data.title || null}, description = ${data.description || null}, tags = ${data.tags || null}, caption = ${data.caption || null}, folder_id = ${data.folder_id || null}, category = ${data.category || 'general'}, is_featured = ${data.is_featured ? true : false}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND status = 'active'
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method updateUsageCount
   * @description Increments the usage count for a file.
   * This tracks how often a file is accessed or referenced, useful for analytics and cleanup decisions.
   * @param {number} id - The ID of the file to update.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  updateUsageCount: async (id: number): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      usage_count = usage_count + 1,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND status = 'active'
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method delete
   * @description Soft-deletes a file by changing its status to 'deleted'.
   * This preserves the record for potential recovery and maintains referential integrity.
   * @param {number} id - The ID of the file to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      status = 'deleted',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method hardDelete
   * @description Permanently removes a file record from the database.
   * This should be used with caution as it cannot be undone and may break references.
   * @param {number} id - The ID of the file to permanently delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  hardDelete: async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM files WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method archive
   * @description Changes a file's status to 'archived'.
   * Archived files are not shown in normal listings but can be restored if needed.
   * @param {number} id - The ID of the file to archive.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  archive: async (id: number): Promise<DbResult> => {
    const result = await sql`
      UPDATE files SET 
      status = 'archived',
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    return { changes: result.rowCount ?? 0 };
  },
  /**
   * @method restore
   * @description Restores a deleted or archived file by changing its status back to 'active'.
   * @param {number} id - The ID of the file to restore.
   * @returns {Promise<DbResult>} The result of the operation.
   */
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

/**
 * @constant fileFoldersOps
 * @description A collection of database operations for the `file_folders` table.
 * This table provides organizational structure for files, allowing hierarchical folder organization.
 */
export const fileFoldersOps = {
  /**
   * @method getAll
   * @description Retrieves all file folders from the database, ordered by their display order.
   * @returns {Promise<FileFolder[]>} A list of all file folders.
   */
  getAll: async (): Promise<FileFolder[]> => {
    const { rows } = await sql`SELECT * FROM file_folders ORDER BY display_order`;
    return rows as FileFolder[];
  },
  /**
   * @method getById
   * @description Retrieves a single file folder by its ID.
   * @param {number} id - The ID of the file folder to retrieve.
   * @returns {Promise<FileFolder | null>} The file folder, or null if not found.
   */
  getById: async (id: number): Promise<FileFolder | null> => {
    const { rows } = await sql`SELECT * FROM file_folders WHERE id = ${id}`;
    return (rows[0] as FileFolder) || null;
  },
  /**
   * @method create
   * @description Creates a new file folder in the database.
   * Supports hierarchical organization through the parent_id field.
   * @param {Partial<FileFolder>} data - The data for the new file folder.
   * @returns {Promise<DbResult>} The result of the operation, including the new folder's ID.
   */
  create: async (data: Partial<FileFolder>): Promise<DbResult> => {
    const result = await sql`
      INSERT INTO file_folders (name, description, parent_id, display_order) 
      VALUES (${data.name}, ${data.description}, ${data.parent_id}, ${data.display_order || 0})
      RETURNING id`;
    return { id: result.rows[0]?.id, changes: result.rowCount ?? 0 };
  },
  /**
   * @method update
   * @description Updates an existing file folder in the database.
   * @param {number} id - The ID of the file folder to update.
   * @param {Partial<FileFolder>} data - The new data for the file folder.
   * @returns {Promise<DbResult>} The result of the operation.
   */
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
  /**
   * @method delete
   * @description Deletes a file folder from the database.
   * Note: This will fail if there are files or subfolders still referencing this folder.
   * Consider implementing cascade deletion or moving contents before deletion.
   * @param {number} id - The ID of the file folder to delete.
   * @returns {Promise<DbResult>} The result of the operation.
   */
  'delete': async (id: number): Promise<DbResult> => {
    const result = await sql`DELETE FROM file_folders WHERE id = ${id}`;
    return { changes: result.rowCount ?? 0 };
  },
};

export { sql };

export type { DbResult, CompanyInfo, CompanyValue, WhyChooseUs, CourseCategory, Course, CourseFeature, TeamMember, HeroSection, HeroStat, HeroFeature, AdminUser, AdminSession, FooterContent, FooterStat, FooterQuickLink, FooterCertification, FooterBottomBadge, File, FileFolder };


//   ___________       *Written and developed by Gabriel Lacroix*               __      ___.
//   \_   _____/__  __ ___________  ___________   ____   ____   ____   /  \    /  \ ____\_ |__  
//    |    __)_\  \/ // __ \_  __ \/ ___\_  __ \_/ __ \_/ __ \ /    \  \   \/\/   // __ \| __ \ 
//    |        \\   /\  ___/|  | \/ /_/  >  | \/\  ___/\  ___/|   |  \  \        /\  ___/| \_\ \
//   /_______  / \_/  \___  >__|  \___  /|__|    \___  >\___  >___|  /   \__/\  /  \___  >___  /
//           \/           \/     /_____/             \/     \/     \/         \/       \/    \/ 
//                     _________      .__          __  .__                                      
//                    /   _____/ ____ |  |  __ ___/  |_|__| ____   ____   ______                
//                    \_____  \ /  _ \|  | |  |  \   __\  |/  _ \ /    \ /  ___/                
//                    /        (  <_> )  |_|  |  /|  | |  (  <_> )   |  \\___ \                 
//                   /_______  /\____/|____/____/ |__| |__|\____/|___|  /____  >                
//                           \/                                       \/     \/                 