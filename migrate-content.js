const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(process.cwd(), 'karma_cms.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Starting content migration...');

// Promisify database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

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
  { point: 'Comprehensive curriculum covering 14+ safety topics', display_order: 2 },
  { point: 'Official KIST & IVES certification upon completion', display_order: 3 },
  { point: 'Tailored for Northwestern BC industries', display_order: 4 },
  { point: 'Flexible scheduling and on-site training options', display_order: 5 },
  { point: '2000+ students trained since 2017', display_order: 6 }
];

// Team Members Data
const teamMembers = [
  { name: 'Jack', role: 'Lead Instructor', bio: 'Expert safety instructor with extensive field experience', experience_years: 20, specializations: JSON.stringify(['KIST Training', 'Fall Protection', 'WHMIS']), featured: 1, display_order: 1 },
  { name: 'Edward', role: 'Safety Specialist', bio: 'Specialized in workplace safety protocols and compliance', experience_years: 18, specializations: JSON.stringify(['Safety Compliance', 'Risk Assessment', 'Training Development']), featured: 1, display_order: 2 },
  { name: 'Lana', role: 'Training Coordinator', bio: 'Coordinates training programs and manages certifications', experience_years: 15, specializations: JSON.stringify(['Program Coordination', 'Certification Management', 'Client Relations']), featured: 1, display_order: 3 },
  { name: 'Jessica', role: 'Certification Manager', bio: 'Manages certification processes and compliance tracking', experience_years: 12, specializations: JSON.stringify(['Certification Processing', 'Compliance Tracking', 'Documentation']), featured: 1, display_order: 4 }
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
    featured: 1
  },
  {
    client_name: 'Mike Thompson',
    client_role: 'Operations Director',
    company: 'BC Forest Solutions',
    industry: 'Forestry',
    content: 'The KIST Fall Protection course was exactly what our forestry crew needed. The hands-on training with actual equipment gave our workers confidence and practical skills they use every day. Highly recommend Karma Training for any forestry operation.',
    rating: 5,
    featured: 1
  },
  {
    client_name: 'Jennifer Lee',
    client_role: 'HR Director',
    company: 'Industrial Solutions Ltd',
    industry: 'Industrial',
    content: 'We\'ve worked with Karma Training for over three years now. Their flexibility in scheduling and willingness to conduct on-site training has been invaluable. The quality of instruction and certification process is top-notch.',
    rating: 5,
    featured: 1
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

// Courses Data (from the course detail page)
const courses = [
  {
    slug: 'kist-orientation',
    title: 'KIST Orientation to Workplace Safety',
    description: 'A worksite safety orientation program developed for British Columbia workers, providing them with the core knowledge they need to understand the BC safety requirements of work sites in the province and to work there with confidence.',
    duration: '6-8 hours',
    audience: 'BC Workers',
    category_name: 'Foundation Safety',
    popular: 1,
    image_alt: 'Workplace safety orientation training session'
  },
  {
    slug: 'kist-bullying-harassment',
    title: 'KIST Bullying & Harassment',
    description: 'Training to define and specify the basic legal obligations of employers, supervisors and employees when it comes to bullying and harassment in the workplace.',
    duration: '4 hours',
    audience: 'All Workers',
    category_name: 'Workplace Safety',
    popular: 0,
    image_alt: 'Workplace harassment prevention training'
  },
  {
    slug: 'whmis-2018',
    title: 'WHMIS 2018 GHS',
    description: 'Updated WHMIS training explaining the changes that have come into effect as result of the Globally Harmonized System. This training covers the new pictograms, Safety Data Sheets, and updated regulations.',
    duration: '4 hours',
    audience: 'All Workers',
    category_name: 'Chemical Safety',
    popular: 1,
    image_alt: 'WHMIS hazardous materials training'
  },
  {
    slug: 'kist-fall-protection',
    title: 'KIST Fall Protection',
    description: 'In British Columbia training in fall protection is required for any worker working over 3m (10ft). This training provides an in-depth understanding of the safety requirements when working at heights.',
    duration: '7-8 hours',
    audience: 'Workers at Heights (over 3m/10ft)',
    category_name: 'Height Safety',
    popular: 1,
    image_alt: 'Fall protection equipment training'
  },
  {
    slug: 'kist-confined-space',
    title: 'KIST Confined Space Entry & Standby',
    description: 'In British Columbia specific instruction must be given to those who enter a confined space as well as those contributing to the work activity but not entering the space, such as standby workers and rescue personnel.',
    duration: '7 hours',
    audience: 'Entry Workers and Standby Personnel',
    category_name: 'Confined Spaces',
    popular: 0,
    image_alt: 'Confined space entry training'
  },
  {
    slug: 'kist-rigger-signalperson',
    title: 'KIST Rigger/Signalperson (Level 1)',
    description: 'Training for rigging and signaling operations, covering safe lifting practices and communication protocols for qualified workers.',
    duration: '7-8 hours',
    audience: 'Riggers and Signal Personnel',
    category_name: 'Lifting Operations',
    popular: 0,
    image_alt: 'Rigging and signaling training'
  },
  {
    slug: 'kist-loto',
    title: 'KIST Hazardous Energy Control (LOTO)',
    description: 'Lockout/Tagout procedures for controlling hazardous energy during equipment maintenance and servicing operations.',
    duration: '6 hours',
    audience: 'Maintenance and Service Workers',
    category_name: 'Energy Control',
    popular: 0,
    image_alt: 'Lockout tagout safety training'
  },
  {
    slug: 'kist-arc-flash',
    title: 'KIST Introduction to Arc Flash',
    description: 'Essential training for electrical safety, covering arc flash hazards, protective measures, and safety protocols for electrical workers.',
    duration: '4 hours',
    audience: 'Electrical Workers',
    category_name: 'Electrical Safety',
    popular: 0,
    image_alt: 'Arc flash electrical safety training'
  },
  {
    slug: 'kist-bear-safety',
    title: 'KIST Working Safely in Bear Country',
    description: 'Specialized training for workers in bear habitat areas, covering prevention strategies, awareness techniques, and emergency response procedures.',
    duration: '4 hours',
    audience: 'Outdoor Workers',
    category_name: 'Wildlife Safety',
    popular: 0,
    image_alt: 'Bear safety awareness training'
  },
  {
    slug: 'dangerous-goods',
    title: 'Transportation of Dangerous Goods',
    description: 'Training on regulations and procedures for safely transporting dangerous goods, covering classification, documentation, and emergency procedures.',
    duration: '6 hours',
    audience: 'Transport Workers and Drivers',
    category_name: 'Transportation Safety',
    popular: 0,
    image_alt: 'Dangerous goods transportation training'
  },
  {
    slug: 'kist-spotter',
    title: 'KIST Equipment & Vehicle Spotter',
    description: 'Training for equipment and vehicle spotting techniques to ensure safe operations around heavy machinery and vehicles.',
    duration: '4 hours',
    audience: 'Equipment Operators and Spotters',
    category_name: 'Equipment Safety',
    popular: 0,
    image_alt: 'Equipment spotting safety training'
  },
  {
    slug: 'kist-chainsaw',
    title: 'KIST Chainsaw Safety',
    description: 'Comprehensive chainsaw safety training covering proper operation, maintenance, and safety procedures for chainsaw use.',
    duration: '6 hours',
    audience: 'Chainsaw Operators',
    category_name: 'Tool Safety',
    popular: 0,
    image_alt: 'Chainsaw safety operation training'
  },
  {
    slug: 'operator-equipment',
    title: 'Certified Operator Equipment Training',
    description: 'IVES certification for 9 equipment types including forklifts, excavators, and more. Comprehensive training with both theoretical and practical components.',
    duration: 'Varies by Equipment',
    audience: 'Equipment Operators',
    category_name: 'Equipment Certification',
    popular: 1,
    image_alt: 'IVES equipment operator certification training'
  },
  {
    slug: 'heavy-equipment',
    title: 'Heavy Equipment Operation',
    description: 'Specialized training for heavy equipment operation with certification, covering various types of heavy machinery and advanced operating techniques.',
    duration: 'Varies by Equipment',
    audience: 'Heavy Equipment Operators',
    category_name: 'Heavy Equipment',
    popular: 0,
    image_alt: 'Heavy equipment operation training'
  }
];

// Migration functions
async function migrateCompanyInfo() {
  console.log('📊 Migrating company information...');
  
  const sql = `INSERT OR REPLACE INTO company_info 
    (id, company_name, slogan, description, mission, total_experience, 
     students_trained_count, established_year, total_courses, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
  
  await dbRun(sql, [
    companyInfo.company_name, companyInfo.slogan, companyInfo.description, 
    companyInfo.mission, companyInfo.total_experience, companyInfo.students_trained_count,
    companyInfo.established_year, companyInfo.total_courses
  ]);
  
  console.log('✅ Company information migrated');
}

async function migrateCompanyValues() {
  console.log('💎 Migrating company values...');
  
  // Clear existing values
  await dbRun('DELETE FROM company_values');
  
  for (const value of companyValues) {
    await dbRun(
      'INSERT INTO company_values (title, description, icon, display_order) VALUES (?, ?, ?, ?)',
      [value.title, value.description, value.icon, value.display_order]
    );
  }
  
  console.log(`✅ ${companyValues.length} company values migrated`);
}

async function migrateWhyChooseUs() {
  console.log('🎯 Migrating why choose us points...');
  
  // Clear existing points
  await dbRun('DELETE FROM company_why_choose_us');
  
  for (const item of whyChooseUs) {
    await dbRun(
      'INSERT INTO company_why_choose_us (point, display_order) VALUES (?, ?)',
      [item.point, item.display_order]
    );
  }
  
  console.log(`✅ ${whyChooseUs.length} why choose us points migrated`);
}

async function migrateTeamMembers() {
  console.log('👥 Migrating team members...');
  
  // Clear existing team members
  await dbRun('DELETE FROM team_members');
  
  for (const member of teamMembers) {
    await dbRun(
      `INSERT INTO team_members 
       (name, role, bio, experience_years, specializations, featured, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [member.name, member.role, member.bio, member.experience_years, 
       member.specializations, member.featured, member.display_order]
    );
  }
  
  console.log(`✅ ${teamMembers.length} team members migrated`);
}

async function migrateTestimonials() {
  console.log('💬 Migrating testimonials...');
  
  // Clear existing testimonials
  await dbRun('DELETE FROM testimonials');
  
  for (const testimonial of testimonials) {
    await dbRun(
      `INSERT INTO testimonials 
       (client_name, client_role, company, industry, content, rating, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [testimonial.client_name, testimonial.client_role, testimonial.company,
       testimonial.industry, testimonial.content, testimonial.rating, testimonial.featured]
    );
  }
  
  console.log(`✅ ${testimonials.length} testimonials migrated`);
}

async function migrateHeroSection() {
  console.log('🦸 Migrating hero section...');
  
  const sql = `INSERT OR REPLACE INTO hero_section 
    (id, slogan, main_heading, highlight_text, subtitle, 
     primary_button_text, primary_button_link, secondary_button_text, secondary_button_link, updated_at)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
  
  await dbRun(sql, [
    heroSection.slogan, heroSection.main_heading, heroSection.highlight_text, heroSection.subtitle,
    heroSection.primary_button_text, heroSection.primary_button_link,
    heroSection.secondary_button_text, heroSection.secondary_button_link
  ]);
  
  console.log('✅ Hero section migrated');
}

async function migrateHeroStats() {
  console.log('📈 Migrating hero stats...');
  
  // Clear existing stats
  await dbRun('DELETE FROM hero_stats');
  
  for (const stat of heroStats) {
    await dbRun(
      'INSERT INTO hero_stats (number_text, label, description, display_order) VALUES (?, ?, ?, ?)',
      [stat.number_text, stat.label, stat.description, stat.display_order]
    );
  }
  
  console.log(`✅ ${heroStats.length} hero stats migrated`);
}

async function migrateHeroFeatures() {
  console.log('⭐ Migrating hero features...');
  
  // Clear existing features
  await dbRun('DELETE FROM hero_features');
  
  for (const feature of heroFeatures) {
    await dbRun(
      'INSERT INTO hero_features (title, description, display_order) VALUES (?, ?, ?)',
      [feature.title, feature.description, feature.display_order]
    );
  }
  
  console.log(`✅ ${heroFeatures.length} hero features migrated`);
}

async function migrateCourseCategories() {
  console.log('📚 Migrating course categories...');
  
  // Clear existing categories
  await dbRun('DELETE FROM course_categories');
  
  for (const category of courseCategories) {
    await dbRun(
      'INSERT INTO course_categories (name, description, display_order) VALUES (?, ?, ?)',
      [category.name, category.description, category.display_order]
    );
  }
  
  console.log(`✅ ${courseCategories.length} course categories migrated`);
}

async function migrateCourses() {
  console.log('🎓 Migrating courses...');
  
  // Clear existing courses and features
  await dbRun('DELETE FROM course_features');
  await dbRun('DELETE FROM courses');
  
  for (const course of courses) {
    // Get category ID
    const category = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM course_categories WHERE name = ?', [course.category_name], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    const categoryId = category ? category.id : null;
    
    // Insert course
    const result = await dbRun(
      `INSERT INTO courses 
       (slug, title, description, duration, audience, category_id, popular, image_alt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [course.slug, course.title, course.description, course.duration, 
       course.audience, categoryId, course.popular, course.image_alt]
    );
    
    console.log(`  ✅ Course: ${course.title}`);
  }
  
  console.log(`✅ ${courses.length} courses migrated`);
}

// Main migration function
async function runMigration() {
  try {
    console.log('🚀 Starting content migration to CMS database...\n');
    
    await migrateCompanyInfo();
    await migrateCompanyValues();
    await migrateWhyChooseUs();
    await migrateTeamMembers();
    await migrateTestimonials();
    await migrateHeroSection();
    await migrateHeroStats();
    await migrateHeroFeatures();
    await migrateCourseCategories();
    await migrateCourses();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Company information: ✅`);
    console.log(`   • Company values: ${companyValues.length} items`);
    console.log(`   • Why choose us: ${whyChooseUs.length} points`);
    console.log(`   • Team members: ${teamMembers.length} people`);
    console.log(`   • Testimonials: ${testimonials.length} reviews`);
    console.log(`   • Hero section: ✅`);
    console.log(`   • Hero stats: ${heroStats.length} stats`);
    console.log(`   • Hero features: ${heroFeatures.length} features`);
    console.log(`   • Course categories: ${courseCategories.length} categories`);
    console.log(`   • Courses: ${courses.length} courses`);
    
    console.log('\n🔗 Next steps:');
    console.log('   1. Visit http://localhost:3000/admin to see your populated CMS');
    console.log('   2. Check the API endpoints to verify data migration');
    console.log('   3. Update your frontend components to use the API data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

