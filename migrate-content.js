// Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now import @vercel/postgres with the environment variables already loaded
import { createPool } from '@vercel/postgres';

console.log('🚀 Starting content migration...');

// Create a connection pool with explicit connection string
const pool = createPool({
  connectionString: process.env.POSTGRES_URL
});

// Company Information Data
const companyInfo = {
  company_name: 'Karma Training',
  slogan: 'We believe the choices you make today will define your tomorrow',
  description: 'Karma Training is Northwestern British Columbia\'s premier provider of workplace safety training. We specialize in delivering comprehensive, industry-specific safety courses that meet the unique challenges of our region\'s diverse industries.',
  mission: 'Our expert instructors bring real-world experience and deep knowledge of safety regulations, ensuring that every participant receives practical, applicable training that enhances workplace safety.',
  total_experience: 70,
  students_trained_count: 2000,
  established_year: 2017,
  total_courses: 14
};

// Company Values Data
const companyValues = [
  { title: 'Mission', description: 'Enhance workplace safety through expert training', icon: 'target', display_order: 1 },
  { title: 'Team', description: '70+ years combined experience', icon: 'users', display_order: 2 },
  { title: 'Values', description: 'Environmental responsibility', icon: 'leaf', display_order: 3 }
];

// Why Choose Us Data
const whyChooseUs = [
  { point: 'Expert instructors with 70+ years combined experience', display_order: 1 },
  { point: 'Comprehensive syllabus covering 14+ safety topics', display_order: 2 },
  { point: 'Official KIST & IVES certification upon completion', display_order: 3 },
  { point: 'Tailored for Northwestern BC industries', display_order: 4 },
  { point: 'Flexible scheduling and on-site training options', display_order: 5 },
  { point: '2000+ students trained since 2017', display_order: 6 }
];

// Team Members Data
const teamMembers = [
  { name: 'Jack', role: 'Lead Instructor', bio: 'Expert safety instructor with extensive field experience', experience_years: 20, specializations: JSON.stringify(['KIST Training', 'Fall Protection', 'WHMIS']), featured: true, display_order: 1 },
  { name: 'Edward', role: 'Safety Specialist', bio: 'Specialized in workplace safety protocols and compliance', experience_years: 18, specializations: JSON.stringify(['Safety Compliance', 'Risk Assessment', 'Training Development']), featured: true, display_order: 2 },
  { name: 'Lana', role: 'Training Coordinator', bio: 'Coordinates training programs and manages certifications', experience_years: 15, specializations: JSON.stringify(['Program Coordination', 'Certification Management', 'Client Relations']), featured: true, display_order: 3 },
  { name: 'Jessica', role: 'Certification Manager', bio: 'Manages certification processes and compliance tracking', experience_years: 12, specializations: JSON.stringify(['Certification Processing', 'Compliance Tracking', 'Documentation']), featured: true, display_order: 4 }
];

// Testimonials Data
const testimonials = [
  {
    client_name: 'Sarah Mitchell',
    client_role: 'Safety Manager',
    company: 'Northern Mining Corp',
    industry: 'Mining',
    content: 'Karma Training provided exceptional safety training for our mining operations. Their instructors brought real-world experience and made complex safety concepts easy to understand. Our incident rates have significantly decreased since implementing their training programs.',
    rating: 5,
    featured: true
  },
  {
    client_name: 'Mike Thompson',
    client_role: 'Operations Director',
    company: 'BC Forest Solutions',
    industry: 'Forestry',
    content: 'The KIST Fall Protection course was exactly what our forestry crew needed. The hands-on training with actual equipment gave our workers confidence and practical skills they use every day. Highly recommend Karma Training for any forestry operation.',
    rating: 5,
    featured: true
  },
  {
    client_name: 'Jennifer Lee',
    client_role: 'HR Director',
    company: 'Industrial Solutions Ltd',
    industry: 'Industrial',
    content: 'We\'ve worked with Karma Training for over three years now. Their flexibility in scheduling and willingness to conduct on-site training has been invaluable. The quality of instruction and certification process is top-notch.',
    rating: 5,
    featured: true
  }
];

// Hero Section Data
const heroSection = {
  slogan: 'We believe the choices you make today will define your tomorrow',
  main_heading: 'Northwestern BC\'s Premier Workplace Safety Training',
  highlight_text: 'Expert Safety Training',
  subtitle: 'Comprehensive safety courses designed for mining, forestry, construction, and industrial workers. Get certified with KIST and IVES approved programs.',
  primary_button_text: 'View Our 14 Courses',
  primary_button_link: '/courses',
  secondary_button_text: 'Contact Us',
  secondary_button_link: '/contact'
};

// Hero Stats Data
const heroStats = [
  { number_text: '14+', label: 'Safety Courses', description: 'Comprehensive training programs', display_order: 1 },
  { number_text: '70+', label: 'Years Experience', description: 'Combined team expertise', display_order: 2 },
  { number_text: '2000+', label: 'Students Trained', description: 'Successful certifications', display_order: 3 }
];

// Hero Features Data
const heroFeatures = [
  { title: 'WorkSafeBC Compliant', description: 'All courses meet provincial safety standards', display_order: 1 },
  { title: 'On-Site Training', description: 'Training at your facility with your equipment', display_order: 2 },
  { title: 'Expert Instructors', description: 'KIST, IVES, and 3M certified professionals', display_order: 3 }
];

// Course Categories Data
const courseCategories = [
  { name: 'Foundation Safety', description: 'Basic workplace safety training', display_order: 1 },
  { name: 'Workplace Safety', description: 'General workplace safety protocols', display_order: 2 },
  { name: 'Chemical Safety', description: 'Hazardous materials and chemical safety', display_order: 3 },
  { name: 'Height Safety', description: 'Fall protection and working at heights', display_order: 4 },
  { name: 'Confined Spaces', description: 'Confined space entry and safety', display_order: 5 },
  { name: 'Lifting Operations', description: 'Rigging and lifting safety', display_order: 6 },
  { name: 'Energy Control', description: 'Lockout/tagout procedures', display_order: 7 },
  { name: 'Electrical Safety', description: 'Electrical hazards and safety', display_order: 8 },
  { name: 'Wildlife Safety', description: 'Working safely in wildlife areas', display_order: 9 },
  { name: 'Transportation Safety', description: 'Transportation and vehicle safety', display_order: 10 },
  { name: 'Equipment Safety', description: 'Equipment operation and safety', display_order: 11 },
  { name: 'Tool Safety', description: 'Tool operation and maintenance', display_order: 12 },
  { name: 'Equipment Certification', description: 'Professional equipment certification', display_order: 13 },
  { name: 'Heavy Equipment', description: 'Heavy machinery operation', display_order: 14 }
];

// Courses Data (truncated for brevity - you can add the full course data)
const courses = [
  {
    slug: 'kist-orientation',
    title: 'KIST Orientation to Workplace Safety',
    description: 'A worksite safety orientation program developed for British Columbia workers, providing them with the core knowledge they need to understand the BC safety requirements of work sites in the province and to work there with confidence.',
    duration: '6-8 hours',
    audience: 'BC Workers',
    category_name: 'Foundation Safety',
    popular: true,
    image_alt: 'Workplace safety orientation training session'
  },
  {
    slug: 'kist-bullying-harassment',
    title: 'KIST Bullying & Harassment',
    description: 'Comprehensive training on identifying, preventing, and addressing workplace bullying and harassment in accordance with BC workplace safety standards.',
    duration: '4 hours',
    audience: 'All Workers',
    category_name: 'Workplace Safety',
    popular: false,
    image_alt: 'Workplace harassment prevention training'
  }
  // Add more courses as needed
];

async function runMigration() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Test the connection first
    const testResult = await pool.sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', testResult.rows[0].current_time);

    console.log('🚀 Starting content migration to CMS database...');

    // Migrate company information
    await migrateCompanyInfo();
    
    // Migrate company values
    await migrateCompanyValues();
    
    // Migrate why choose us points
    await migrateWhyChooseUs();
    
    // Migrate team members
    await migrateTeamMembers();
    
    // Migrate testimonials
    await migrateTestimonials();
    
    // Migrate hero section
    await migrateHeroSection();
    
    // Migrate hero stats
    await migrateHeroStats();
    
    // Migrate hero features
    await migrateHeroFeatures();
    
    // Migrate course categories
    await migrateCourseCategories();
    
    // Migrate courses
    await migrateCourses();

    console.log('🎉 Content migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

async function migrateCompanyInfo() {
  console.log('📊 Migrating company information...');
  
  await pool.sql`
    INSERT INTO company_info 
    (id, company_name, slogan, description, mission, total_experience, 
     students_trained_count, established_year, total_courses, updated_at)
    VALUES (1, ${companyInfo.company_name}, ${companyInfo.slogan}, ${companyInfo.description}, 
            ${companyInfo.mission}, ${companyInfo.total_experience}, ${companyInfo.students_trained_count}, 
            ${companyInfo.established_year}, ${companyInfo.total_courses}, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
    company_name = ${companyInfo.company_name}, slogan = ${companyInfo.slogan}, 
    description = ${companyInfo.description}, mission = ${companyInfo.mission},
    total_experience = ${companyInfo.total_experience}, 
    students_trained_count = ${companyInfo.students_trained_count}, 
    established_year = ${companyInfo.established_year}, 
    total_courses = ${companyInfo.total_courses}, 
    updated_at = CURRENT_TIMESTAMP
  `;
  
  console.log('✅ Company information migrated');
}

async function migrateCompanyValues() {
  console.log('💎 Migrating company values...');
  
  // Clear existing values
  await pool.sql`DELETE FROM company_values`;
  
  for (const value of companyValues) {
    await pool.sql`
      INSERT INTO company_values (title, description, icon, display_order)
      VALUES (${value.title}, ${value.description}, ${value.icon}, ${value.display_order})
    `;
  }
  
  console.log('✅ Company values migrated');
}

async function migrateWhyChooseUs() {
  console.log('🎯 Migrating why choose us points...');
  
  // Clear existing points
  await pool.sql`DELETE FROM company_why_choose_us`;
  
  for (const point of whyChooseUs) {
    await pool.sql`
      INSERT INTO company_why_choose_us (point, display_order)
      VALUES (${point.point}, ${point.display_order})
    `;
  }
  
  console.log('✅ Why choose us points migrated');
}

async function migrateTeamMembers() {
  console.log('👥 Migrating team members...');
  
  // Clear existing team members
  await pool.sql`DELETE FROM team_members`;
  
  for (const member of teamMembers) {
    await pool.sql`
      INSERT INTO team_members 
      (name, role, bio, experience_years, specializations, featured, display_order)
      VALUES (${member.name}, ${member.role}, ${member.bio}, ${member.experience_years}, 
              ${member.specializations}, ${member.featured}, ${member.display_order})
    `;
  }
  
  console.log('✅ Team members migrated');
}

async function migrateTestimonials() {
  console.log('💬 Migrating testimonials...');
  
  // Clear existing testimonials
  await pool.sql`DELETE FROM testimonials`;
  
  for (const testimonial of testimonials) {
    await pool.sql`
      INSERT INTO testimonials 
      (client_name, client_role, company, industry, content, rating, featured)
      VALUES (${testimonial.client_name}, ${testimonial.client_role}, ${testimonial.company}, 
              ${testimonial.industry}, ${testimonial.content}, ${testimonial.rating}, ${testimonial.featured})
    `;
  }
  
  console.log('✅ Testimonials migrated');
}

async function migrateHeroSection() {
  console.log('🦸 Migrating hero section...');
  
  await pool.sql`
    INSERT INTO hero_section 
    (id, slogan, main_heading, highlight_text, subtitle, primary_button_text, 
     primary_button_link, secondary_button_text, secondary_button_link, updated_at)
    VALUES (1, ${heroSection.slogan}, ${heroSection.main_heading}, ${heroSection.highlight_text}, 
            ${heroSection.subtitle}, ${heroSection.primary_button_text}, ${heroSection.primary_button_link}, 
            ${heroSection.secondary_button_text}, ${heroSection.secondary_button_link}, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO UPDATE SET
    slogan = ${heroSection.slogan}, main_heading = ${heroSection.main_heading}, 
    highlight_text = ${heroSection.highlight_text}, subtitle = ${heroSection.subtitle},
    primary_button_text = ${heroSection.primary_button_text}, 
    primary_button_link = ${heroSection.primary_button_link},
    secondary_button_text = ${heroSection.secondary_button_text}, 
    secondary_button_link = ${heroSection.secondary_button_link},
    updated_at = CURRENT_TIMESTAMP
  `;
  
  console.log('✅ Hero section migrated');
}

async function migrateHeroStats() {
  console.log('📈 Migrating hero stats...');
  
  // Clear existing stats
  await pool.sql`DELETE FROM hero_stats`;
  
  for (const stat of heroStats) {
    await pool.sql`
      INSERT INTO hero_stats (number_text, label, description, display_order)
      VALUES (${stat.number_text}, ${stat.label}, ${stat.description}, ${stat.display_order})
    `;
  }
  
  console.log('✅ Hero stats migrated');
}

async function migrateHeroFeatures() {
  console.log('⭐ Migrating hero features...');
  
  // Clear existing features
  await pool.sql`DELETE FROM hero_features`;
  
  for (const feature of heroFeatures) {
    await pool.sql`
      INSERT INTO hero_features (title, description, display_order)
      VALUES (${feature.title}, ${feature.description}, ${feature.display_order})
    `;
  }
  
  console.log('✅ Hero features migrated');
}

async function migrateCourseCategories() {
  console.log('📚 Migrating course categories...');
  
  // Clear existing categories
  await pool.sql`DELETE FROM course_categories`;
  
  for (const category of courseCategories) {
    await pool.sql`
      INSERT INTO course_categories (name, description, display_order)
      VALUES (${category.name}, ${category.description}, ${category.display_order})
    `;
  }
  
  console.log('✅ Course categories migrated');
}

async function migrateCourses() {
  console.log('🎓 Migrating courses...');
  
  // Clear existing courses
  await pool.sql`DELETE FROM courses`;
  
  for (const course of courses) {
    // Get category ID
    const categoryResult = await pool.sql`
      SELECT id FROM course_categories WHERE name = ${course.category_name}
    `;
    
    const categoryId = categoryResult.rows[0]?.id;
    
    await pool.sql`
      INSERT INTO courses 
      (slug, title, description, duration, audience, category_id, popular, image_alt)
      VALUES (${course.slug}, ${course.title}, ${course.description}, ${course.duration}, 
              ${course.audience}, ${categoryId}, ${course.popular}, ${course.image_alt})
    `;
  }
  
  console.log('✅ Courses migrated');
}

runMigration();

