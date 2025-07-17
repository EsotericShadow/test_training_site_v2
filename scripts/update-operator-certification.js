import { sql } from '@vercel/postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function updateOperatorCertification() {
  const course = {
    slug: 'operator-equipment',
    title: 'IVES Operator Certification Training',
    description: `We exclusively offer operator certification and recertification programs on-site at your facility, for your employees, using your equipment.`,
    overview: `### On-Site Operator Qualification

Get the operator training your company needs delivered right at your workplace using your equipment with our On-Site Operator Qualification program. Achieve the highest level of regulatory compliance in all of your in-house equipment safety training with Karma Training.`,
    includes: `*   Standard forklift
*   Rough terrain forklift
*   Rough terrain telehandler
*   MEWPs (Telescopic and articulated boomlifts including scissor lifts)
*   Skid-Steer Loader
*   Wheel Loader
*   Back-Hoe
*   Excavator`,
    format: `**Program Duration:** Minimum of 1 day*
**Program Structure:**
*   50% Classroom theory training
*   50% Practical hands-on training
**Program Capacity:** Maximum of 4-10 trainees*

_*Dependent on the type(s) of equipment, the number of trainees and their experience level._`,
    passing_grade: '70%',
    features: [
      'Applicable regulations',
      'Variations of equipment types',
      'Main parts',
      'Understanding equipment safety',
      'Fuels and batteries',
      'Pre-use inspection',
      'Safe operating procedures',
      'Parking/shut-down procedures',
    ],
  };

  try {
    const { rows } = await sql`
      SELECT id FROM courses WHERE slug = ${course.slug}
    `;

    if (rows.length === 0) {
      console.log('Course not found. Creating new course.');
      // If you want to create it if it doesn't exist
      // await coursesOps.create(course);
      return;
    }

    const courseId = rows[0].id;

    await sql`
      UPDATE courses
      SET
        title = ${course.title},
        description = ${course.description},
        overview = ${course.overview},
        includes = ${course.includes},
        format = ${course.format},
        passing_grade = ${course.passing_grade}
      WHERE id = ${courseId}
    `;

    await sql`
      DELETE FROM course_features WHERE course_id = ${courseId}
    `;

    for (let i = 0; i < course.features.length; i++) {
      await sql`
        INSERT INTO course_features (course_id, feature, display_order)
        VALUES (${courseId}, ${course.features[i]}, ${i})
      `;
    }

    console.log('Successfully updated operator certification course.');
  } catch (error) {
    console.error('Error updating operator certification course:', error);
  }
}

updateOperatorCertification();
