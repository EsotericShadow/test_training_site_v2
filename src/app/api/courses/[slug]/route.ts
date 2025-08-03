/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: route.ts
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
import { coursesOps, courseFeaturesOps } from '../../../../../lib/database';
import type { CourseFeature } from '../../../../../types/database';

export async function GET(
  _request: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Course slug is required' },
        { status: 400 }
      );
    }

    const course = await coursesOps.getBySlug(slug);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' }, 
        { status: 404 }
      );
    }

    const features = await courseFeaturesOps.getByCourseId(course.id);

    const enrichedCourse = {
      ...course,
      features: features.map((feature: CourseFeature) => ({
        feature: feature.feature,
        display_order: feature.display_order || 0
      })).sort((a, b) => a.display_order - b.display_order),
      category: {
        name: course.category_name || 'Uncategorized'
      }
    };

    return NextResponse.json({
      course: enrichedCourse
    });
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Error fetching course with slug ${resolvedParams.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch course' }, 
      { status: 500 }
    );
  }
}


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
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 