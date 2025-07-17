import { Metadata } from 'next';
import HeroSection from '@/app/components/home/hero-section';
import FeaturedCourses from '@/app/components/home/featured-courses';
import AboutSnippet from '@/app/components/home/about-snippet';


interface HeroSection {
  slogan?: string;
  main_heading?: string;
  highlight_text?: string;
  subtitle?: string;
  background_image_url?: string;
  background_image_alt?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
}

export const dynamic = 'force-dynamic';

// Fetch hero data server-side for better performance
async function getHeroData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section`, { cache: 'no-store' });
    
    if (response.ok) {
      const data = await response.json();
      return {
        heroSection: data.heroSection || {},
        heroStats: data.heroStats || [],
        heroFeatures: data.heroFeatures || []
      };
    }
  } catch (error) {
    console.error('Error fetching hero data:', error);
  }
  
  // Return fallback data if fetch fails
  return {
    heroSection: {},
    heroStats: [],
    heroFeatures: []
  };
}

// Generate metadata for SEO (replaces NextSeo)
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  // Fetch hero data for potential image preloading
  const heroData = await getHeroData();
  const heroImage = heroData.heroSection.background_image_url;
  
  return {
    title: 'Industrial Safety Training | Karma Industrial Safety Trainings',
    description: 'Certified industrial safety training in Northwestern BC. WorkSafeBC-compliant courses, IVES operator certification, and custom safety solutions.',
    keywords: ['industrial safety training', 'WorkSafeBC', 'IVES certification', 'Northwestern BC', 'safety courses'],
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
      canonical: '/',
    },
    openGraph: {
      title: 'Industrial Safety Training | Karma Industrial Safety Trainings',
      description: 'Certified industrial safety training in Northwestern BC. WorkSafeBC-compliant courses, IVES operator certification, and custom safety solutions.',
      url: '/',
      siteName: 'Karma Industrial Safety Trainings',
      images: [
        {
          url: heroImage || '/assets/logos/logo.png',
          width: 1200,
          height: 630,
          alt: 'Karma Industrial Safety Trainings',
          type: 'image/png',
        },
      ],
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Industrial Safety Training | Karma Industrial Safety Trainings',
      description: 'Certified industrial safety training in Northwestern BC. WorkSafeBC-compliant courses, IVES operator certification, and custom safety solutions.',
      site: '@KarmaTraining',
      images: [heroImage || '/assets/logos/logo.png'],
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
    verification: {
      google: 'your-google-verification-code', // Replace with actual verification code
    },
    // Add preload hints for critical resources
    other: heroImage
      ? { preload: `<${heroImage}>; rel=preload; as=image` }
      : {},
  };
}

// Server component (no 'use client' directive)
export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://test-training-site-v2-xjey.vercel.app';
  
  // Fetch hero data server-side
  const heroData = await getHeroData();
  const teamMembersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/team-members`, { cache: 'no-store' });
  const { teamMembers } = await teamMembersRes.json();

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Karma Industrial Safety Trainings',
    url: `${baseUrl}/`,
    logo: `${baseUrl}/assets/logos/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-250-615-3727',
      contactType: 'Customer Service',
      email: 'info@karmatraining.ca',
      areaServed: 'CA-BC',
    },
    description: 'Karma Industrial Safety Trainings provides WorkSafeBC-compliant safety training and IVES operator certification in Northwestern BC.',
    foundingDate: '2017',
    slogan: 'We believe the choices you make today will define your tomorrow',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CA',
      addressRegion: 'BC',
    },
    sameAs: [
      // Add social media URLs here
    ],
  };

  return (
    <>
      {/* Preload critical hero image */}
      {heroData.heroSection.background_image_url && (
        <link
          rel="preload"
          href={heroData.heroSection.background_image_url}
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      )}
      
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      
      <div>
        <HeroSection initialData={heroData} />
        <FeaturedCourses />
        <AboutSnippet teamMembers={teamMembers} />
      </div>
    </>
  );
}