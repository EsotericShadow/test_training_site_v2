import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import {
  db,
  companyInfoOps,
  companyValuesOps,
  whyChooseUsOps,
  courseCategoriesOps,
  coursesOps,
  courseFeaturesOps,
  teamMembersOps,
  heroSectionOps,
  heroStatsOps,
  heroFeaturesOps,
  footerContentOps,
  footerStatsOps,
  footerQuickLinksOps,
  footerCertificationsOps,
  footerBottomBadgesOps,
  filesOps,
  fileFoldersOps,
} from '../lib/database.js';
import { logger } from '../lib/logger.js';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedDataDir = path.join(__dirname, 'seed_data');

async function parseCsv(filename) {
  const filePath = path.join(seedDataDir, filename);
  try {
    const fileContent = await fs.readFile(filePath, { encoding: 'utf8' });
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    logger.info(`Successfully parsed ${records.length} records from ${filename}`);
    return records;
  } catch (error) {
    logger.error(`Failed to parse CSV ${filename}:`, error);
    return [];
  }
}

async function seedContent() {
  logger.info('Starting content seeding...');

  try {
    // Order of seeding is important due to foreign key constraints

    // 1. file_folders (no FKs)
    const fileFolders = await parseCsv('file_folders.csv');
    for (const data of fileFolders) {
      await fileFoldersOps.create({
        id: parseInt(data.id),
        name: data.name,
        description: data.description,
        parent_id: data.parent_id ? parseInt(data.parent_id) : null,
        display_order: parseInt(data.display_order),
      });
    }
    logger.info('Seeded file_folders.');

    // 2. files (FK to file_folders)
    const files = await parseCsv('files.csv');
    for (const data of files) {
      await filesOps.create({
        id: parseInt(data.id),
        filename: data.filename,
        original_name: data.original_name,
        file_size: parseInt(data.file_size),
        mime_type: data.mime_type,
        file_extension: data.file_extension,
        file_url: data.file_url,
        width: data.width ? parseInt(data.width) : null,
        height: data.height ? parseInt(data.height) : null,
        aspect_ratio: data.aspect_ratio ? parseFloat(data.aspect_ratio) : null,
        alt_text: data.alt_text === 'NULL' ? null : data.alt_text,
        title: data.title === 'NULL' ? null : data.title,
        description: data.description === 'NULL' ? null : data.description,
        tags: data.tags === 'NULL' ? null : data.tags,
        caption: data.caption === 'NULL' ? null : data.caption,
        folder_id: data.folder_id ? parseInt(data.folder_id) : null,
        category: data.category,
        usage_count: parseInt(data.usage_count),
        is_featured: data.is_featured === '1',
        uploaded_by: data.uploaded_by ? parseInt(data.uploaded_by) : null,
        status: data.status,
      });
    }
    logger.info('Seeded files.');

    // 3. company_info (no FKs)
    const companyInfo = await parseCsv('company_info.csv');
    for (const data of companyInfo) {
      await companyInfoOps.upsert({
        id: parseInt(data.id),
        company_name: data.company_name,
        slogan: data.slogan,
        description: data.description,
        mission: data.mission,
        total_experience: parseInt(data.total_experience),
        students_trained_count: parseInt(data.students_trained_count),
        established_year: parseInt(data.established_year),
        total_courses: parseInt(data.total_courses),
        phone: data.phone,
        email: data.email,
        location: data.location,
        business_hours: data.business_hours,
        response_time: data.response_time,
        service_area: data.service_area,
        emergency_availability: data.emergency_availability,
      });
    }
    logger.info('Seeded company_info.');

    // 4. company_values (no FKs)
    const companyValues = await parseCsv('company_values.csv');
    for (const data of companyValues) {
      await companyValuesOps.create({
        id: parseInt(data.id),
        title: data.title,
        description: data.description,
        icon: data.icon,
        display_order: parseInt(data.display_order),
      });
    }
    logger.info('Seeded company_values.');

    // 5. company_why_choose_us (no FKs)
    const whyChooseUs = await parseCsv('company_why_choose_us.csv');
    for (const data of whyChooseUs) {
      await whyChooseUsOps.create({
        id: parseInt(data.id),
        point: data.point,
        display_order: parseInt(data.display_order),
        image_url: data.image_url === 'NULL' ? null : data.image_url,
        image_alt: data.image_alt === 'NULL' ? null : data.image_alt,
      });
    }
    logger.info('Seeded company_why_choose_us.');

    // 6. course_categories (no FKs)
    const courseCategories = await parseCsv('course_categories.csv');
    for (const data of courseCategories) {
      await courseCategoriesOps.create({
        id: parseInt(data.id),
        name: data.name,
        description: data.description,
        display_order: parseInt(data.display_order),
      });
    }
    logger.info('Seeded course_categories.');

    // 7. courses (FK to course_categories)
    const courses = await parseCsv('courses.csv');
    for (const data of courses) {
      await coursesOps.create({
        id: parseInt(data.id),
        slug: data.slug,
        title: data.title,
        description: data.description,
        duration: data.duration,
        audience: data.audience,
        category_id: data.category_id ? parseInt(data.category_id) : null,
        popular: data.popular === '1',
        image_url: data.image_url,
        image_alt: data.image_alt,
        overview: data.overview === 'NULL' ? null : data.overview,
        what_youll_learn: data.what_youll_learn === 'NULL' ? null : data.what_youll_learn,
      });
    }
    logger.info('Seeded courses.');

    // 8. course_features (FK to courses)
    const courseFeatures = await parseCsv('course_features.csv');
    for (const data of courseFeatures) {
      await courseFeaturesOps.create(
        parseInt(data.course_id),
        data.feature,
        parseInt(data.display_order)
      );
    }
    logger.info('Seeded course_features.');

    // 9. team_members (no FKs, but photo_url might refer to files)
    const teamMembers = await parseCsv('team_members.csv');
    for (const data of teamMembers) {
      await teamMembersOps.create({
        id: parseInt(data.id),
        name: data.name,
        role: data.role,
        bio: data.bio,
        photo_url: data.photo_url,
        experience_years: data.experience_years ? parseInt(data.experience_years) : null,
        specializations: JSON.parse(data.specializations),
        featured: data.featured === '1',
        display_order: parseInt(data.display_order),
      });
    }
    logger.info('Seeded team_members.');

    // 10. hero_section (no FKs, but background_image_url might refer to files)
    const heroSection = await parseCsv('hero_section.csv');
    for (const data of heroSection) {
      await heroSectionOps.upsert({
        id: parseInt(data.id),
        slogan: data.slogan,
        main_heading: data.main_heading,
        highlight_text: data.highlight_text,
        subtitle: data.subtitle,
        background_image_url: data.background_image_url,
        background_image_alt: data.background_image_alt,
        primary_button_text: data.primary_button_text,
        primary_button_link: data.primary_button_link,
        secondary_button_text: data.secondary_button_text,
        secondary_button_link: data.secondary_button_link,
      });
    }
    logger.info('Seeded hero_section.');

    // 11. hero_stats (no FKs)
    const heroStats = await parseCsv('hero_stats.csv');
    for (const data of heroStats) {
      await heroStatsOps.create({
        id: parseInt(data.id),
        number_text: data.number_text,
        label: data.label,
        description: data.description,
        display_order: parseInt(data.display_order),
      });
    }
    logger.info('Seeded hero_stats.');

    // 12. hero_features (no FKs)
    const heroFeatures = await parseCsv('hero_features.csv');
    for (const data of heroFeatures) {
      await heroFeaturesOps.create({
        id: parseInt(data.id),
        title: data.title,
        description: data.description,
        display_order: parseInt(data.display_order),
      });
    }
    logger.info('Seeded hero_features.');

    // 13. footer_content (no FKs, but logo_url might refer to files)
    const footerContent = await parseCsv('footer_content.csv');
    for (const data of footerContent) {
      await footerContentOps.upsert({
        id: parseInt(data.id),
        company_name: data.company_name,
        tagline: data.tagline,
        slogan: data.slogan,
        description: data.description,
        phone: data.phone,
        email: data.email,
        location: data.location,
        logo_url: data.logo_url,
        logo_alt: data.logo_alt,
        copyright_text: data.copyright_text,
        tagline_bottom: data.tagline_bottom,
      });
    }
    logger.info('Seeded footer_content.');

    // 14. footer_stats (no FKs)
    const footerStats = await parseCsv('footer_stats.csv');
    for (const data of footerStats) {
      await footerStatsOps.create({
        id: parseInt(data.id),
        number_text: data.number_text,
        label: data.label,
        display_order: parseInt(data.display_order),
      });
    }
    logger.info('Seeded footer_stats.');

    // 15. footer_quick_links (no FKs)
    const footerQuickLinks = await parseCsv('footer_quick_links.csv');
    for (const data of footerQuickLinks) {
      await footerQuickLinksOps.create({
        id: parseInt(data.id),
        title: data.title,
        url: data.url,
        display_order: parseInt(data.display_order),
        is_active: data.is_active === '1',
      });
    }
    logger.info('Seeded footer_quick_links.');

    // 16. footer_certifications (no FKs)
    const footerCertifications = await parseCsv('footer_certifications.csv');
    for (const data of footerCertifications) {
      await footerCertificationsOps.create({
        id: parseInt(data.id),
        title: data.title,
        icon: data.icon,
        display_order: parseInt(data.display_order),
        is_active: data.is_active === '1',
      });
    }
    logger.info('Seeded footer_certifications.');

    // 17. footer_bottom_badges (no FKs)
    const footerBottomBadges = await parseCsv('footer_bottom_badges.csv');
    for (const data of footerBottomBadges) {
      await footerBottomBadgesOps.create({
        id: parseInt(data.id),
        title: data.title,
        icon: data.icon,
        display_order: parseInt(data.display_order),
        is_active: data.is_active === '1',
      });
    }
    logger.info('Seeded footer_bottom_badges.');

    logger.info('Content seeding complete.');
  } catch (error) {
    logger.error('Error seeding content:', error);
    process.exit(1);
  } finally {
    // Close the database connection pool
    if (db && typeof db.end === 'function') {
      await db.end();
      logger.info('Database connection pool closed.');
    }
  }
}

seedContent();
