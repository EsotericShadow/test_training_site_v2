'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import AboutIcon from './AboutIcons';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';
import type { TeamMember } from '../../../types/database';

const WhyChooseUsBento = dynamic(() => import('@/app/components/home/WhyChooseUsBento'), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>,
});

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
  image_url?: string;
  image_alt?: string;
}

interface AboutPageClientProps {
  teamMembers: TeamMember[];
}



export default function AboutPageClient({ teamMembers }: AboutPageClientProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageAlt, setHeroImageAlt] = useState<string | null>(null);

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
    const fetchData = async () => {
      try {
        const [companyDataResponse, heroImageResponse] = await Promise.all([
          fetch('/api/about-snippet'),
          fetch('/api/about/hero-image')
        ]);

        if (companyDataResponse.ok) {
          const companyData = await companyDataResponse.json();
          setCompanyInfo(companyData.companyInfo);
          setCompanyValues(companyData.companyValues || []);
          setWhyChooseUs(companyData.whyChooseUs || []);
        } else {
          console.error('Failed to load company data');
        }

        if (heroImageResponse.ok) {
          const { file } = await heroImageResponse.json();
          setHeroImage(file.file_url);
          setHeroImageAlt(file.alt_text || 'About page hero image');
        } else {
          console.error('Failed to load hero image');
          setHeroImage('/uploads/general/1752864410580-MEWP_Splash.webp'); // Fallback
          setHeroImageAlt('Safety training in action');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="h-screen  flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>;
  }

  return (
    <div ref={sectionRefs} className="">
      <section className="relative text-white py-24">
        <div className="absolute inset-0">
          {heroImage && (
            <Image
              src={heroImage}
              alt={heroImageAlt || 'Hero background'}
              fill
              className="object-cover opacity-30"
              priority
              sizes="100vw"
            />
          )}
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
              <h2 className="text-4xl font-bold text-gray-300 dark:text-white">Our Mission</h2>
              <p className="text-gray-300">{companyInfo?.mission}</p>
              <h2 className="text-4xl font-bold text-gray-300 dark:text-white mt-12">Our Story</h2>
              <p className="text-gray-300">{companyInfo?.description}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl text-center">
                <AboutIcon name="calendar" className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-300 dark:text-white">{companyInfo?.established_year}</p>
                <p className="text-md text-gray-300">Established</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl text-center">
                <AboutIcon name="briefcase" className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-300 dark:text-white">{companyInfo?.total_experience || 'N/A'}</p>
                <p className="text-md text-gray-300">Years Experience</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl text-center">
                <AboutIcon name="users" className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-300 dark:text-white">{companyInfo?.students_trained_count || 'N/A'}</p>
                <p className="text-md text-gray-300">Students Trained</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl shadow-xl text-center">
                <AboutIcon name="book-open" className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                <p className="text-4xl font-bold text-gray-300 dark:text-white">{companyInfo?.total_courses || 'N/A'}</p>
                <p className="text-md text-gray-300">Courses Offered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-section py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-300 dark:text-white">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map(value => (
              <div key={value.id} className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-xl shadow-xl text-center">
                <div className="bg-yellow-400 text-white rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <AboutIcon name={value.icon} className="h-10 w-10" />;
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-300">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-section py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-200 dark:text-white">Why Choose Us</h2>
          </div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>}>
            <WhyChooseUsBento items={whyChooseUs} />
          </Suspense>
        </div>
      </section>

      <section className="animate-section py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-200 dark:text-white">Meet Our Team</h2>
            <p className="text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
              Our certified instructors are the backbone of our success, bringing decades of real-world experience to every course.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map(member => (
              <div key={member.id} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden text-center">
                <div className="relative aspect-[3/4]">
                  {member.photo_url ? (
                    <Image src={member.photo_url} alt={member.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" quality={75} />
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 h-full flex items-center justify-center">
                      <AboutIcon name="camera" className="h-12 w-12 text-gray-200" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-300">{member.name}</h3>
                  <p className="text-yellow-500 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-300 mb-4">{member.bio || ''}</p>
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

      <section className="text-gray-900 dark:text-white bg-yellow-400 py-20">
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