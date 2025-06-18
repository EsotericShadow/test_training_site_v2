'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Users, Award, LucideIcon } from 'lucide-react';

interface FooterContent {
  company_name: string;
  tagline: string;
  slogan: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  logo_url: string;
  logo_alt: string;
  copyright_text: string;
  tagline_bottom: string;
}

interface FooterStat {
  id: number;
  number_text: string;
  label: string;
  display_order: number;
}

interface FooterQuickLink {
  id: number;
  title: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

interface FooterCertification {
  id: number;
  title: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface FooterBottomBadge {
  id: number;
  title: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface Course {
  id: number;
  slug: string;
  title: string;
  popular: boolean;
}

// Icon mapping for dynamic icons
const iconMap: { [key: string]: LucideIcon } = {
  Award,
  Users,
  Phone,
  Mail,
  MapPin
};

export default function Footer() {
  const [footerData, setFooterData] = useState<{
    footerContent: FooterContent | null;
    footerStats: FooterStat[];
    footerQuickLinks: FooterQuickLink[];
    footerCertifications: FooterCertification[];
    footerBottomBadges: FooterBottomBadge[];
    popularCourses: Course[];
  }>({
    footerContent: null,
    footerStats: [],
    footerQuickLinks: [],
    footerCertifications: [],
    footerBottomBadges: [],
    popularCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/footer')
      .then((res) => res.json())
      .then((data) => {
        setFooterData({
          footerContent: data.footerContent || null,
          footerStats: data.footerStats || [],
          footerQuickLinks: data.footerQuickLinks || [],
          footerCertifications: data.footerCertifications || [],
          footerBottomBadges: data.footerBottomBadges || [],
          popularCourses: data.popularCourses || []
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching footer data:', error);
        setLoading(false);
      });
  }, []);

  // Fallback data
  const fallbackFooterContent = {
    company_name: 'Fallback data 01',
    tagline: 'Fallback data 02',
    slogan: 'Fallback data 03',
    description: 'Fallback data 04',
    phone: 'Fallback data 05',
    email: 'Fallback data 06',
    location: 'Fallback data 07',
    logo_url: 'Fallback data 08',
    logo_alt: 'Fallback data 09',
    copyright_text: 'Fallback data 10',
    tagline_bottom: 'Fallback data 11'
  };

  const fallbackStats = [
    { id: 1, number_text: 'fallback', label: 'fallback', display_order: 1 },
    { id: 2, number_text: 'fallback', label: 'fallback', display_order: 2 },
    { id: 3, number_text: 'fallback', label: 'fallback', display_order: 3 }
  ];

  const fallbackQuickLinks = [
    { id: 1, title: 'fallback', url: '/about', display_order: 1, is_active: true },
    { id: 2, title: 'fallback', url: '/courses', display_order: 2, is_active: true },
    { id: 3, title: 'fallback', url: '/contact', display_order: 3, is_active: true },
    { id: 4, title: 'fallback', url: '/about#team', display_order: 4, is_active: true },
    { id: 5, title: 'fallback', url: '/privacy', display_order: 5, is_active: true },
    { id: 6, title: 'fallback', url: '/terms', display_order: 6, is_active: true }
  ];

  const fallbackCertifications = [
    { id: 1, title: 'fallback', icon: 'Award', display_order: 1, is_active: true },
    { id: 2, title: 'fallback', icon: 'Users', display_order: 2, is_active: true },
    { id: 3, title: 'fallback', icon: 'Award', display_order: 3, is_active: true },
    { id: 4, title: 'fallback', icon: 'Users', display_order: 4, is_active: true }
  ];

  const fallbackBottomBadges = [
    { id: 1, title: 'fallback', icon: 'Award', display_order: 1, is_active: true },
    { id: 2, title: 'fallback', icon: 'Users', display_order: 2, is_active: true }
  ];

  const fallbackCourses = [
    { id: 1, slug: 'fallback', title: 'fallback', popular: true },
    { id: 2, slug: 'fallback', title: 'fallback', popular: true },
    { id: 3, slug: 'fallback', title: 'fallback', popular: true },
    { id: 4, slug: 'fallback', title: 'fallback', popular: true },
    { id: 5, slug: 'fallback', title: 'fallback', popular: true }
  ];

  // Use CMS data or fallback
  const displayFooterContent = footerData.footerContent || fallbackFooterContent;
  const displayStats = footerData.footerStats.length > 0 ? footerData.footerStats : fallbackStats;
  const displayQuickLinks = footerData.footerQuickLinks.length > 0 ? footerData.footerQuickLinks : fallbackQuickLinks;
  const displayCertifications = footerData.footerCertifications.length > 0 ? footerData.footerCertifications : fallbackCertifications;
  const displayBottomBadges = footerData.footerBottomBadges.length > 0 ? footerData.footerBottomBadges : fallbackBottomBadges;
  const displayCourses = footerData.popularCourses.length > 0 ? footerData.popularCourses : fallbackCourses;

  // Helper function to get icon component
  const getIcon = (iconName: string, className: string = '') => {
    const IconComponent = iconMap[iconName] || Award;
    return <IconComponent className={className} />;
  };

  if (loading) {
    return (
      <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-300">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="mb-6">
              <Image
                src={displayFooterContent.logo_url}
                alt={`${displayFooterContent.company_name} - ${displayFooterContent.tagline}`}
                width={200}
                height={64}
                className="h-16 w-auto"
              />
            </div>
            
            <p className="text-brand-yellow font-medium italic mb-4">
              &quot;{displayFooterContent.slogan}&quot;
            </p>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {displayFooterContent.description}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 text-brand-yellow flex-shrink-0" />
                <span className="font-medium">{displayFooterContent.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 text-brand-yellow flex-shrink-0" />
                <span>{displayFooterContent.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 text-brand-yellow flex-shrink-0" />
                <span>{displayFooterContent.location}</span>
              </div>
            </div>
            
            {/* Company Stats */}
            {displayStats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700">
                {displayStats.map((stat) => (
                  <div key={stat.id} className="text-center">
                    <div className="text-2xl font-bold text-brand-yellow">{stat.number_text}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-brand-yellow">Quick Links</h3>
            <ul className="space-y-3">
              {displayQuickLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.url} className="text-gray-300 hover:text-brand-yellow transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-brand-yellow">Popular Courses</h3>
            <ul className="space-y-3 text-sm">
              {displayCourses.map((course) => (
                <li key={course.id}>
                  <Link 
                    href={`/courses/${course.slug}`} 
                    className="text-gray-300 hover:text-brand-yellow transition-colors"
                  >
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certifications Section */}
        {displayCertifications.length > 0 && (
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-brand-yellow mb-4">Certifications</h3>
              <p className="text-gray-300 mb-4">
                All our courses provide official certification upon completion.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {displayCertifications.map((cert) => (
                  <div key={cert.id} className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-full">
                    {getIcon(cert.icon, "h-4 w-4 text-brand-yellow")}
                    <span className="text-gray-300">{cert.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-300">
                {displayFooterContent.copyright_text}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {displayFooterContent.tagline_bottom}
              </p>
            </div>
            
            {displayBottomBadges.length > 0 && (
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                {displayBottomBadges.map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-2">
                    {getIcon(badge.icon, "h-4 w-4 text-brand-yellow")}
                    <span>{badge.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

