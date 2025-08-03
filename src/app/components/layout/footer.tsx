'use client';

import Link from 'next/link';
import Image from 'next/image';
import LayoutIcon from './LayoutIcons';
import { PopularCourse } from '../../layout';
import type { FooterContent, FooterStat, FooterQuickLink, FooterCertification, FooterBottomBadge } from '../../../../lib/database';

interface FooterProps {
  footerContent: FooterContent | null;
  popularCourses: PopularCourse[];
  footerStats: FooterStat[];
  footerQuickLinks: FooterQuickLink[];
  footerCertifications: FooterCertification[];
  footerBottomBadges: FooterBottomBadge[];
}

export default function Footer({ footerContent, popularCourses, footerStats, footerQuickLinks, footerCertifications, footerBottomBadges }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Top row grid container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company info section */}
          <div className="lg:col-span-2">
            {footerContent?.logo_url && (
              <Image
                src={footerContent.logo_url}
                alt={footerContent.company_name}
                width={150}
                height={50}
                className="mb-4 w-auto h-auto"
              />
            )}
            <p className="text-gray-400">{footerContent?.description}</p>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.facebook.com/share/12MLNsHCu94/?mibextid=wwXIfr" aria-label="Follow us on Facebook" className="text-gray-400 hover:text-white">
                <LayoutIcon name="facebook" />
              </a>
              <a href="https://www.linkedin.com/in/jack-cook-34113652?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" aria-label="Follow us on LinkedIn" className="text-gray-400 hover:text-white">
                <LayoutIcon name="linkedin" />
              </a>
            </div>
          </div> {/* Closes lg:col-span-2 div */}
          
          {/* Quick Links section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-center">Quick Links</h3>
            <ul className="space-y-2">
              {footerQuickLinks.filter(link => link.is_active).map(link => (
                <li key={link.id}>
                  <Link href={link.url} className="hover:text-yellow-400">{link.title}</Link>
                </li>
              ))}
            </ul>
          </div> {/* Closes Quick Links div */}
          
          {/* Popular Courses section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-center">Popular Courses</h3>
            <ul className="space-y-2">
              {popularCourses.map(course => (
                <li key={course.slug}>
                  <Link href={`/courses/${course.slug}`} className="hover:text-yellow-400">{course.title}</Link>
                </li>
              ))}
            </ul>
          </div> {/* Closes Popular Courses div */}
          
          {/* Contact Info section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-center">Contact Info</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <LayoutIcon name="map-pin" className="h-6 w-6 mr-3 mt-1 text-yellow-400" />
                <span>{footerContent?.location}</span>
              </li>
              <li className="flex items-center">
                <LayoutIcon name="mail" className="h-5 w-5 mr-3 text-yellow-400" />
                <a href={`mailto:${footerContent?.email}`} className="hover:text-yellow-400">{footerContent?.email}</a>
              </li>
              <li className="flex items-center">
                <LayoutIcon name="phone" className="h-5 w-5 mr-3 text-yellow-400" />
                <a href={`tel:${footerContent?.phone}`} className="hover:text-yellow-400">Call us at {footerContent?.phone}</a>
              </li>
            </ul>
          </div> {/* Closes Contact Info div */}
        </div> {/* Closes Top row grid container */}

        {/* Bottom row grid container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {/* Our Achievements section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-center">Our Achievements</h3>
            <div className="grid grid-cols-2 gap-4">
              {footerStats.map(stat => (
                <div key={stat.id} className="flex flex-col items-center text-center">
                  <span className="text-yellow-400 text-2xl font-bold">{stat.number_text}</span>
                  <span className="text-gray-400 text-sm">{stat.label}</span>
                </div>
              ))}
            </div> {/* Closes Achievements grid */}
          </div> {/* Closes Our Achievements div */}

          {/* Certifications section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-center">Certifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {footerCertifications.filter(cert => cert.is_active).map(cert => (
                <div key={cert.id} className="flex items-center space-x-2">
                  <LayoutIcon name={cert.icon} className="h-6 w-6 text-yellow-400" />
                  <span className="text-gray-400 text-sm">{cert.title}</span>
                </div>
              ))}
            </div> {/* Closes Certifications grid */}
          </div> {/* Closes Certifications div */}

          {/* Partners section */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-center">Partners</h3>
            <div className="flex flex-wrap items-center justify-center gap-8 py-4">
              {footerBottomBadges.filter(badge => badge.is_active).map(badge => (
                (badge.icon.startsWith('/') || badge.icon.startsWith('http://') || badge.icon.startsWith('https://')) ? (
                  <Image
                    key={badge.id}
                    src={badge.icon}
                    alt={badge.title}
                    width={160}
                    height={160}
                    className="object-contain"
                  />
                ) : null
              ))}
            </div> {/* Closes Partners div */}
          </div> {/* Closes Partners div */}
        </div> {/* Closes main grid container */}
        
        {/* Copyright section */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-300">
          <p>
            <a href="https://www.evergreenwebsolutions.ca" className="hover:text-yellow-400">
              {footerContent?.copyright_text || `© ${new Date().getFullYear()} ${footerContent?.company_name}. All Rights Reserved.`}
            </a>
          </p>
        </div> {/* Closes Copyright div */}
      </div> {/* Closes container div */}
    </footer>
  );
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