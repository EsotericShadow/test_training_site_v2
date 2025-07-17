'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Linkedin, Twitter } from 'lucide-react';

interface FooterContent {
  company_name: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  logo_url: string;
  copyright_text: string;
}

interface Course {
  slug: string;
  title: string;
}

export default function Footer() {
  const [footerData, setFooterData] = useState<{
    footerContent: FooterContent | null;
    popularCourses: Course[];
  }>({ footerContent: null, popularCourses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer')
      .then(res => res.json())
      .then(data => {
        setFooterData({
          footerContent: data.footerContent,
          popularCourses: data.popularCourses || [],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <footer className="bg-gray-900 text-white py-12"></footer>;

  const { footerContent, popularCourses } = footerData;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            {footerContent?.logo_url && <Image src={footerContent.logo_url} alt={footerContent.company_name} width={150} height={50} className="mb-4" />}
            <p className="text-gray-400">{footerContent?.description}</p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
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
              <li className="flex items-start"><MapPin className="h-6 w-6 mr-3 mt-1 text-yellow-400" /><span>{footerContent?.location}</span></li>
              <li className="flex items-center"><Mail className="h-5 w-5 mr-3 text-yellow-400" /><a href={`mailto:${footerContent?.email}`} className="hover:text-yellow-400">{footerContent?.email}</a></li>
              <li className="flex items-center"><Phone className="h-5 w-5 mr-3 text-yellow-400" /><a href={`tel:${footerContent?.phone}`} className="hover:text-yellow-400">{footerContent?.phone}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>{footerContent?.copyright_text || `© ${new Date().getFullYear()} ${footerContent?.company_name}. All Rights Reserved.`}</p>
        </div>
      </div>
    </footer>
  );
}