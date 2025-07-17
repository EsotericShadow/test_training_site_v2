'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Camera, Briefcase, Calendar, Users, BookOpen } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';
import type { TeamMember } from '../../../types/database';

interface CompanyInfo {
  company_name: string;
  slogan: string;
  description: string;
  mission: string;
  established_year: number;
  total_experience?: number;
  students_trained_count?: number;
  total_courses?: number;
  phone?: string;
  email?: string;
  location?: string;
  business_hours?: string;
  response_time?: string;
  service_area?: string;
  emergency_availability?: string;
}

interface CompanyValue {
  id?: number;
  title: string;
  description: string;
  icon: string;
}

interface WhyChooseUs {
  id?: number;
  point: string;
}

interface AboutPageClientProps {
  teamMembers: TeamMember[];
}

function toPascalCase(str: string): string {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}

export default function AboutPageClient({ teamMembers }: AboutPageClientProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [loading, setLoading] = useState(true);

  const sectionRefs = useGsap(() => {
    gsap.utils.toArray<HTMLElement>('.animate-section').forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
      });
    });
  });

  useEffect(() => {
    fetch('/api/about-snippet').then(res => res.json())
    .then((companyData) => {
      setCompanyInfo(companyData.companyInfo);
      setCompanyValues(companyData.companyValues || []);
      setWhyChooseUs(companyData.whyChooseUs || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>;
  }

  return (
    <div ref={sectionRefs} className="bg-white dark:bg-gray-900">
      <section className="relative bg-gray-900 text-white py-24">
        <div className="absolute inset-0">
          <Image
            src="https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/1750011620811-IMG_8439.JPG"
            alt="Safety training in action"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">About <span className="text-yellow-400">{companyInfo?.company_name || 'Us'}</span></h1>
          <p className="text-xl md:text-2xl text-gray-300 font-semibold">{companyInfo?.slogan}</p>
        </div>
      </section>

      <section className="animate-section py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="prose prose-xl dark:prose-invert max-w-none">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              <p>{companyInfo?.mission}</p>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-12">Our Story</h2>
              <p>{companyInfo?.description}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <Calendar className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{companyInfo?.established_year}</p>
                <p className="text-md text-gray-600 dark:text-gray-400">Established</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <Briefcase className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{companyInfo?.total_experience || 'N/A'}</p>
                <p className="text-md text-gray-600 dark:text-gray-400">Years Experience</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <Users className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{companyInfo?.students_trained_count || 'N/A'}</p>
                <p className="text-md text-gray-600 dark:text-gray-400">Students Trained</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <BookOpen className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{companyInfo?.total_courses || 'N/A'}</p>
                <p className="text-md text-gray-600 dark:text-gray-400">Courses Offered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-section py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map(value => (
              <div key={value.id} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
                <div className="bg-yellow-400 text-white rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  {(() => {
                    console.log('Company Value Icon:', value.icon); // Log the icon name
                    const iconName = toPascalCase(value.icon);
                    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType | undefined ?? Shield;
                    return <IconComponent className="h-10 w-10" />;
                  })()}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-section py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Why Choose Us</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg text-center">
                <h3 className="text-2xl font-semibold mb-3">{item.point}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-section py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Meet Our Team</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
              Our certified instructors are the backbone of our success, bringing decades of real-world experience to every course.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden text-center">
                <div className="relative aspect-[3/4]">
                  {member.photo_url ? (
                    <Image src={member.photo_url} alt={member.name} fill className="object-cover" />
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 h-full flex items-center justify-center">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold">{member.name}</h3>
                  <p className="text-yellow-500 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{member.bio || ''}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.isArray(member.specializations) ? member.specializations.map((spec: string, i: number) => (
                      <span key={i} className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">{spec}</span>
                    )) : []}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-yellow-500 text-black py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Improve Your Workplace Safety?</h2>
          <p className="text-xl mb-8">Let&apos;s work together to create a safer, more productive environment for your team.</p>
          <Link href="/contact" className="bg-black text-white font-bold py-4 px-8 rounded-lg hover:bg-gray-800 transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}