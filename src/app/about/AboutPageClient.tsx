'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import AboutIcon from './AboutIcons';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';
import type { TeamMember, Course } from '../../../types/database';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageAlt, setHeroImageAlt] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null); // Track selected member for modal

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
        const [companyDataResponse, heroImageResponse, coursesResponse] = await Promise.all([
          fetch('/api/about-snippet'),
          fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files?category=other'),
          fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses'),
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
          setHeroImage(file.blob_url);
          setHeroImageAlt(file.alt_text || 'About page hero image');
        } else {
          console.error('Failed to load hero image');
          setHeroImage('https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/1750011620811-IMG_8439.JPG');
          setHeroImageAlt('Safety training in action');
        }

        if (coursesResponse.ok) {
          const { courses } = await coursesResponse.json();
          setCourses(courses || []);
        } else {
          console.error('Failed to load courses');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>;
  }

  return (
    <div ref={sectionRefs} className="bg-gray-900 pt-13" >
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
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">About <span className="text-yellow-400">{companyInfo?.company_name || 'Us'}</span></h1>
          <p className="text-lg md:text-xl text-gray-400 font-semibold">{companyInfo?.slogan}</p>
        </div>
      </section>

      <section className="animate-section py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              <p className="text-gray-400">{companyInfo?.mission}</p>
              <h2 className="text-3xl font-bold text-white mt-8">Our Story</h2>
              <p className="text-gray-400">{companyInfo?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="backdrop-blur-md bg-gray-800/80 border border-gray-700 p-4 rounded-xl shadow-xl text-center">
                <AboutIcon name="calendar" className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{companyInfo?.established_year}</p>
                <p className="text-sm text-gray-400">Established</p>
              </div>
              <div className="backdrop-blur-md bg-gray-800/80 border border-gray-700 p-4 rounded-xl shadow-xl text-center">
                <AboutIcon name="briefcase" className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{companyInfo?.total_experience || 'N/A'}</p>
                <p className="text-sm text-gray-400">Years Experience</p>
              </div>
              <div className="backdrop-blur-md bg-gray-800/80 border border-gray-700 p-4 rounded-xl shadow-xl text-center">
                <AboutIcon name="users" className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{companyInfo?.students_trained_count || 'N/A'}</p>
                <p className="text-sm text-gray-400">Students Trained</p>
              </div>
              <div className="backdrop-blur-md bg-gray-800/80 border border-gray-700 p-4 rounded-xl shadow-xl text-center">
                <AboutIcon name="book-open" className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{companyInfo?.total_courses || 'N/A'}</p>
                <p className="text-sm text-gray-400">Courses Offered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-section py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyValues.map(value => (
              <div key={value.id} className="backdrop-blur-md bg-gray-800/80 border border-gray-700 p-6 rounded-xl shadow-xl text-center hover:shadow-2xl transition-shadow duration-300">
                <div className="bg-yellow-400 text-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AboutIcon name={value.icon} className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-section py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Why Choose Us</h2>
          </div>
          <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>}>
            <WhyChooseUsBento items={whyChooseUs} courseImages={courses.filter(c => c.image_url).map(c => ({ url: c.image_url!, alt: c.image_alt || c.title }))} />
          </Suspense>
        </div>
      </section>

      <section className="animate-section py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Meet Our Team</h2>
            <p className="text-lg text-gray-400 mt-3 max-w-2xl mx-auto">
              Our certified instructors are the backbone of our success, bringing decades of real-world experience to every course.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map(member => (
              <div key={member.id} className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
                <div className="relative aspect-square w-full">
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      quality={75}
                    />
                  ) : (
                    <div className="bg-gray-700 h-full flex items-center justify-center">
                      <AboutIcon name="camera" className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-yellow-400 text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{member.bio || 'No bio available'}</p>
                  <button 
                    onClick={() => openModal(member)} 
                    className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors"
                  >
                    View Full Bio
                  </button>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {Array.isArray(member.specializations) && member.specializations.length > 0 ? (
                      member.specializations.slice(0, 3).map((spec: string, i: number) => (
                        <span key={i} className="bg-yellow-900/20 text-yellow-400 text-xs font-medium px-2 py-1 rounded-full border border-yellow-800">
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No specializations listed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bio Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                {selectedMember.photo_url ? (
                  <Image
                    src={selectedMember.photo_url}
                    alt={selectedMember.name}
                    fill
                    className="object-cover rounded-full"
                    quality={75}
                  />
                ) : (
                  <div className="bg-gray-700 h-full rounded-full flex items-center justify-center">
                    <AboutIcon name="camera" className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{selectedMember.name}</h3>
              <p className="text-yellow-400 text-sm font-medium mb-4">{selectedMember.role}</p>
              <p className="text-gray-400 text-sm text-center mb-4">{selectedMember.bio || 'No bio available'}</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {Array.isArray(selectedMember.specializations) && selectedMember.specializations.length > 0 ? (
                  selectedMember.specializations.map((spec: string, i: number) => (
                    <span key={i} className="bg-yellow-900/20 text-yellow-400 text-xs font-medium px-2 py-1 rounded-full border border-yellow-800">
                      {spec}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs">No specializations listed</span>
                )}
              </div>
              <button
                onClick={closeModal}
                className="bg-gray-700 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="text-white bg-yellow-400 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Workplace Safety?</h2>
          <p className="text-lg mb-6">Let&apos;s work together to create a safer, more productive environment for your team.</p>
          <Link href="/contact" className="bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}