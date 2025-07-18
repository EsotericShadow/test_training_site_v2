import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CoursePageClient from './CoursePageClient';
import ExpandedCoursePageClient from './ExpandedCoursePageClient';

interface Course {
  id: number;
  slug: string;
  title: string;
  duration: string;
  audience: string;
  description: string;
  what_youll_learn: string;
  overview?: string;
  includes?: string;
  format?: string;
  passing_grade?: string;
  image_url?: string;
  image_alt?: string;
  features: { feature: string; display_order: number }[];
  category: { name: string };
  popular: boolean;
}

interface PageProps {
  params: Promise<{
    courseid: string;
  }>;
}

// Fetch course data server-side
async function getCourse(slug: string): Promise<Course | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
    const response = await fetch(`${baseUrl}/api/courses/${slug}`, {
      cache: 'no-store', // Ensure fresh data for dynamic content
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.course;
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

// Generate dynamic metadata based on course information
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await getCourse(resolvedParams.courseid);
  
  if (!course) {
    return {
      title: 'Course Not Found | Karma Industrial Safety Trainings',
      description: 'The requested course could not be found. Browse our complete catalog of WorkSafeBC-compliant safety training courses.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  // Create dynamic title and description
  const title = `${course.title} | Karma Industrial Safety Trainings`;
  const description = course.overview || course.description;
  
  // Extract key features for keywords
  const features = course.features.map(f => f.feature).slice(0, 5);
  const keywords = [
    course.title,
    course.category.name,
    'WorkSafeBC compliant',
    'safety training',
    'Northwestern BC',
    'industrial safety',
    course.audience,
    ...features
  ];

  return {
    title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Karma Industrial Safety Trainings' }],
    creator: 'Karma Industrial Safety Trainings',
    publisher: 'Karma Industrial Safety Trainings',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/courses/${course.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/courses/${course.slug}`,
      siteName: 'Karma Industrial Safety Trainings',
      images: [
        {
          url: course.image_url || '/assets/logos/logo.png',
          width: 1200,
          height: 630,
          alt: course.image_alt || `${course.title} - Safety Training Course`,
          type: 'image/png',
        },
      ],
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@KarmaTraining',
      images: [course.image_url || '/assets/logos/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Server component
export default async function CoursePage({ params }: PageProps) {
  const resolvedParams = await params;
  const course = await getCourse(resolvedParams.courseid);
  
  if (!course) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';

  // Dynamic JSON-LD structured data based on course information
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Karma Industrial Safety Trainings',
      url: `${baseUrl}/`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Northwestern British Columbia',
        addressRegion: 'BC',
        addressCountry: 'CA',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-250-615-3727',
        contactType: 'Customer Service',
        email: 'info@karmatraining.ca',
      },
    },
    url: `${baseUrl}/courses/${course.slug}`,
    image: course.image_url || `${baseUrl}/assets/logos/logo.png`,
    courseCode: course.slug.toUpperCase(),
    educationalLevel: 'Professional',
    teaches: course.features.map(feature => feature.feature),
    timeRequired: course.duration,
    audience: {
      '@type': 'Audience',
      audienceType: course.audience,
    },
    coursePrerequisites: 'No prerequisites required',
    educationalCredentialAwarded: 'WorkSafeBC Compliant Certificate',
    inLanguage: 'en-CA',
    availableLanguage: 'English',
    courseMode: course.format || 'In-person',
    locationCreated: {
      '@type': 'Place',
      name: 'Northwestern British Columbia',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'BC',
        addressCountry: 'CA',
      },
    },
    about: {
      '@type': 'Thing',
      name: course.category.name,
      description: `Professional safety training in ${course.category.name}`,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.format || 'In-person',
      instructor: {
        '@type': 'Organization',
        name: 'Karma Industrial Safety Trainings',
      },
    },
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      {course.slug === 'operator-equipment' ? (
        <ExpandedCoursePageClient course={course} />
      ) : (
        <CoursePageClient course={course} />
      )}
    </>
  );
}

