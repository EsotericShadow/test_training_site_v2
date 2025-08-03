'use client';

import Link from 'next/link';
import Image from 'next/image';
import LayoutIcon from './LayoutIcons';
import { PopularCourse } from '../../layout';

interface FooterContent {
  company_name: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  logo_url: string;
  copyright_text: string;
}

interface FooterProps {
  footerContent: FooterContent | null;
  popularCourses: PopularCourse[];
}

export default function Footer({ footerContent, popularCourses }: FooterProps) {

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            {footerContent?.logo_url && <Image src={footerContent.logo_url} alt={footerContent.company_name} width={150} height={50} className="mb-4" />}
            <p className="text-gray-400">{footerContent?.description}</p>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.facebook.com/share/12MLNsHCu94/?mibextid=wwXIfr" aria-label="Follow us on Facebook" className="text-gray-400 hover:text-white"><LayoutIcon name="facebook" /></a>
              <a href="https://www.linkedin.com/in/jack-cook-34113652?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" aria-label="Follow us on LinkedIn" className="text-gray-400 hover:text-white"><LayoutIcon name="linkedin" /></a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-yellow-400">About Us</Link></li>
              <li><Link href="/courses" className="hover:text-yellow-400">All Courses</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-400">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Popular Courses</h3>
            <ul className="space-y-2">
              {popularCourses.map(course => (
                <li key={course.slug}><Link href={`/courses/${course.slug}`} className="hover:text-yellow-400">{course.title}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start"><LayoutIcon name="map-pin" className="h-6 w-6 mr-3 mt-1 text-yellow-400" /><span>{footerContent?.location}</span></li>
              <li className="flex items-center"><LayoutIcon name="mail" className="h-5 w-5 mr-3 text-yellow-400" /><a href={`mailto:${footerContent?.email}`} className="hover:text-yellow-400">{footerContent?.email}</a></li>
              <li className="flex items-center"><LayoutIcon name="phone" className="h-5 w-5 mr-3 text-yellow-400" /><a href={`tel:${footerContent?.phone}`} className="hover:text-yellow-400">Call us at {footerContent?.phone}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-300">
          <p>
            <a href="https://www.evergreenwebsolutions.ca" className="hover:text-yellow-400">
              {footerContent?.copyright_text || `© ${new Date().getFullYear()} ${footerContent?.company_name}. All Rights Reserved.`}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}