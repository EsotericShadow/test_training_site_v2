import { config } from 'dotenv';
config({ path: '.env.local' });

import { sql } from '@vercel/postgres';

async function updateCourseDatabase() {
  try {
    console.log('🚀 Starting course database update...');
    console.log('🔗 Connecting to database...');
    
    // Test connection
    const testResult = await sql`SELECT NOW() as now`;
    console.log('✅ Database connection successful:', testResult.rows[0].now);

    // First, clear existing data
    console.log('🧹 Clearing existing course data...');
    await sql`DELETE FROM course_features`;
    await sql`DELETE FROM courses`;
    await sql`DELETE FROM course_categories`;

    // Create course categories
    console.log('📚 Creating course categories...');
    
    const kistCategory = await sql`
      INSERT INTO course_categories (name, description, display_order)
      VALUES ('KIST Safety Training', 'Karma Industrial Safety Training programs based on WorkSafeBC regulations', 1)
      RETURNING id
    `;
    
    const operatorCategory = await sql`
      INSERT INTO course_categories (name, description, display_order)
      VALUES ('Operator Certification', 'IVES certified operator training and equipment certification', 2)
      RETURNING id
    `;
    
    const specializedCategory = await sql`
      INSERT INTO course_categories (name, description, display_order)
      VALUES ('Specialized Training', 'Specialized safety training programs for specific industries', 3)
      RETURNING id
    `;

    const kistCategoryId = kistCategory.rows[0].id;
    const operatorCategoryId = operatorCategory.rows[0].id;
    const specializedCategoryId = specializedCategory.rows[0].id;

    console.log('✅ Course categories created');

    // KIST Safety Training Courses
    console.log('📖 Adding KIST Safety Training courses...');
    
    const kistCourses = [
      {
        slug: 'kist-orientation',
        title: 'KIST Orientation to Workplace Safety',
        description: 'A worksite safety orientation program developed for British Columbia workers, providing them with the core knowledge they need to understand the BC safety requirements of work sites in the province and to work there with confidence. This program provides an overall knowledge of the importance of safety practices in the workplace and at home.',
        duration: '6-8 hours',
        audience: 'BC Workers',
        popular: true,
        image_alt: 'Workplace safety orientation training session'
      },
      {
        slug: 'kist-bullying-harassment',
        title: 'KIST Bullying & Harassment',
        description: 'Training to define and specify the basic legal obligations of employers, supervisors and employees when it comes to bullying and harassment in the workplace. Advance awareness of the harmful consequences of bullying and harassment.',
        duration: '4 hours',
        audience: 'All Workers',
        popular: false,
        image_alt: 'Workplace harassment prevention training'
      },
      {
        slug: 'kist-fall-protection',
        title: 'KIST Fall Protection',
        description: 'In British Columbia training in fall protection is required for any worker working over 3m (10ft). This training provides an in-depth understanding of the safety requirements when working at heights. Includes theoretical test (70%), equipment inspection (10%), and harness fitting (20%).',
        duration: '7-8 hours',
        audience: 'Workers at Heights (over 3m/10ft)',
        popular: true,
        image_alt: 'Fall protection equipment training'
      },
      {
        slug: 'kist-confined-space',
        title: 'KIST Confined Space Entry & Standby',
        description: 'In British Columbia specific instruction must be given to those who enter a confined space as well as those contributing to the work activity but not entering the space, such as standby workers and rescue personnel. Includes gas detection systems training.',
        duration: '7 hours',
        audience: 'Entry Workers and Standby Personnel',
        popular: true,
        image_alt: 'Confined space entry training'
      },
      {
        slug: 'kist-rigger-signalperson',
        title: 'KIST Rigger/Signalperson (Level 1)',
        description: 'Training for rigging and signaling operations, covering safe lifting practices and communication protocols for qualified workers. In-class training with practical exercises.',
        duration: '7-8 hours',
        audience: 'Riggers and Signal Personnel',
        popular: false,
        image_alt: 'Rigging and signaling training'
      },
      {
        slug: 'kist-loto',
        title: 'KIST Hazardous Energy Control (LOTO)',
        description: 'Lockout/Tagout procedures for controlling hazardous energy during equipment maintenance and servicing operations. Essential training for maintenance and service workers.',
        duration: '6 hours',
        audience: 'Maintenance and Service Workers',
        popular: false,
        image_alt: 'Lockout tagout safety training'
      },
      {
        slug: 'kist-arc-flash',
        title: 'KIST Introduction to Arc Flash',
        description: 'Essential training for electrical safety, covering arc flash hazards, protective measures, and safety protocols for electrical workers. Introduction level course for electrical safety awareness.',
        duration: '4 hours',
        audience: 'Electrical Workers',
        popular: false,
        image_alt: 'Arc flash electrical safety training'
      },
      {
        slug: 'kist-bear-safety',
        title: 'KIST Working Safely in Bear Country',
        description: 'Specialized training for workers in bear habitat areas, covering prevention strategies, awareness techniques, and emergency response procedures. Essential for outdoor workers in Northwestern BC.',
        duration: '4 hours',
        audience: 'Outdoor Workers',
        popular: false,
        image_alt: 'Bear safety awareness training'
      },
      {
        slug: 'kist-spotter',
        title: 'KIST Equipment & Vehicle Spotter',
        description: 'Training for equipment and vehicle spotting techniques to ensure safe operations around heavy machinery and vehicles. Critical safety training for equipment operators and spotters.',
        duration: '4 hours',
        audience: 'Equipment Operators and Spotters',
        popular: false,
        image_alt: 'Equipment spotting safety training'
      },
      {
        slug: 'kist-chainsaw',
        title: 'KIST Chainsaw Safety',
        description: 'Comprehensive chainsaw safety training covering proper operation, maintenance, and safety procedures for chainsaw use. Essential for forestry and outdoor workers.',
        duration: '6 hours',
        audience: 'Chainsaw Operators',
        popular: false,
        image_alt: 'Chainsaw safety operation training'
      }
    ];

    // Insert KIST courses
    for (const course of kistCourses) {
      const result = await sql`
        INSERT INTO courses (
          slug, title, description, duration, audience, popular, image_alt, category_id
        ) VALUES (
          ${course.slug}, ${course.title}, ${course.description}, ${course.duration}, 
          ${course.audience}, ${course.popular}, ${course.image_alt}, ${kistCategoryId}
        ) RETURNING id
      `;
      
      // Add basic features for each course
      const features = [
        'WorkSafeBC compliant training',
        'Professional certification upon completion',
        'Experienced instructors with industry background',
        'In-class instruction with practical components',
        '80% passing grade required for certification'
      ];
      
      for (let i = 0; i < features.length; i++) {
        await sql`
          INSERT INTO course_features (course_id, feature, display_order)
          VALUES (${result.rows[0].id}, ${features[i]}, ${i})
        `;
      }
    }

    // Operator Certification Courses
    console.log('🚜 Adding Operator Certification courses...');
    
    const operatorCourses = [
      {
        slug: 'operator-equipment',
        title: 'Certified Operator Equipment Training',
        description: 'IVES certification for 9 equipment types including forklifts, excavators, and more. Comprehensive training with both theoretical and practical components. IVES requires a passing grade of 70% for certification.',
        duration: 'Varies by Equipment',
        audience: 'Equipment Operators',
        popular: true,
        image_alt: 'IVES equipment operator certification training'
      },
      {
        slug: 'heavy-equipment',
        title: 'Heavy Equipment Operation',
        description: 'Specialized training for heavy equipment operation with certification, covering various types of heavy machinery and advanced operating techniques. Practical and classroom training combined.',
        duration: 'Varies by Equipment',
        audience: 'Heavy Equipment Operators',
        popular: false,
        image_alt: 'Heavy equipment operation training'
      }
    ];

    // Insert Operator courses
    for (const course of operatorCourses) {
      const result = await sql`
        INSERT INTO courses (
          slug, title, description, duration, audience, popular, image_alt, category_id
        ) VALUES (
          ${course.slug}, ${course.title}, ${course.description}, ${course.duration}, 
          ${course.audience}, ${course.popular}, ${course.image_alt}, ${operatorCategoryId}
        ) RETURNING id
      `;
      
      // Add features for operator courses
      const features = [
        'IVES certified training programs',
        'Both theoretical and practical components',
        'Industry-recognized certification',
        'Equipment-specific training modules',
        '70% passing grade required for IVES certification'
      ];
      
      for (let i = 0; i < features.length; i++) {
        await sql`
          INSERT INTO course_features (course_id, feature, display_order)
          VALUES (${result.rows[0].id}, ${features[i]}, ${i})
        `;
      }
    }

    // Specialized Training Courses
    console.log('⚗️ Adding Specialized Training courses...');
    
    const specializedCourses = [
      {
        slug: 'whmis-2018',
        title: 'WHMIS 2018 GHS',
        description: 'Updated WHMIS training explaining the changes that have come into effect as result of the Globally Harmonized System. This training covers the new pictograms, Safety Data Sheets, and updated regulations. Includes 64-page pocket handbook.',
        duration: '4 hours',
        audience: 'All Workers',
        popular: true,
        image_alt: 'WHMIS hazardous materials training'
      },
      {
        slug: 'dangerous-goods',
        title: 'Transportation of Dangerous Goods',
        description: 'Training on regulations and procedures for safely transporting dangerous goods, covering classification, documentation, and emergency procedures. Essential for transport workers and drivers.',
        duration: '6 hours',
        audience: 'Transport Workers and Drivers',
        popular: false,
        image_alt: 'Dangerous goods transportation training'
      }
    ];

    // Insert Specialized courses
    for (const course of specializedCourses) {
      const result = await sql`
        INSERT INTO courses (
          slug, title, description, duration, audience, popular, image_alt, category_id
        ) VALUES (
          ${course.slug}, ${course.title}, ${course.description}, ${course.duration}, 
          ${course.audience}, ${course.popular}, ${course.image_alt}, ${specializedCategoryId}
        ) RETURNING id
      `;
      
      // Add features for specialized courses
      const features = [
        'Regulatory compliance training',
        'Up-to-date industry standards',
        'Professional certification upon completion',
        'Expert instruction and guidance',
        '80% passing grade required for certification'
      ];
      
      for (let i = 0; i < features.length; i++) {
        await sql`
          INSERT INTO course_features (course_id, feature, display_order)
          VALUES (${result.rows[0].id}, ${features[i]}, ${i})
        `;
      }
    }

    console.log('✅ All courses added successfully!');
    console.log('🎉 Course database update completed!');
    
    // Summary
    const courseCount = await sql`SELECT COUNT(*) as count FROM courses`;
    const categoryCount = await sql`SELECT COUNT(*) as count FROM course_categories`;
    const featureCount = await sql`SELECT COUNT(*) as count FROM course_features`;
    
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categoryCount.rows[0].count}`);
    console.log(`   - Courses: ${courseCount.rows[0].count}`);
    console.log(`   - Features: ${featureCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error updating course database:', error);
    throw error;
  }
}

// Run the update
updateCourseDatabase()
  .then(() => {
    console.log('✅ Course database update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Course database update failed:', error);
    process.exit(1);
  });

