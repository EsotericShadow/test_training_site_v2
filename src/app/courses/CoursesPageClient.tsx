/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/courses/CoursesPageClient.tsx
 * Description: Client-side Courses page component with course listing, filtering, and search functionality.
 * Dependencies: React 19, Next.js 15, course data fetching
 * Created: 2025-06-06
 * Last Modified: 2025-08-03
 * Version: 1.0.11
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CourseIcon from './CourseIcons';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';

interface Course {
  id: number;
  slug: string;
  title: string;
  duration: string;
  audience: string;
  description: string;
  image_url?: string;
  image_alt?: string;
  features: { feature: string; display_order: number }[];
  category?: { name: string };
  popular: boolean;
}

export default function CoursesPageClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageAlt, setHeroImageAlt] = useState<string | null>(null);

  const sectionRef = useGsap((ref) => {
    if (!ref.current) return;
    gsap.from(ref.current.querySelectorAll('.course-card'), {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
      },
    });

    const iconContainers = ref.current.querySelectorAll('.icon-container');
    iconContainers.forEach(container => {
      const icon = container.querySelector('.icon');
      container.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          rotation: 360,
          duration: 1,
          ease: 'power3.out'
        });
      });
      container.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          rotation: 0,
          duration: 1,
          ease: 'power3.out'
        });
      });
    });

    const courseCards = ref.current.querySelectorAll('.course-card');
    courseCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power3.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: 'power3.out'
        });
      });
    });
  });

  useEffect(() => {
    const fetchCoursesAndHero = async () => {
      try {
        const [coursesResponse, heroImageResponse] = await Promise.all([
          fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses'),
          fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files?category=other')
        ]);

        if (coursesResponse.ok) {
          const { courses } = await coursesResponse.json();
          setCourses(courses);


        } else {
          setError('Failed to load courses');
        }

        if (heroImageResponse.ok) {
          const { file } = await heroImageResponse.json();
          setHeroImage(file.blob_url);
          setHeroImageAlt(file.alt_text || 'Courses page hero image');
        } else {
          console.error('Failed to load hero image');
          setHeroImage('https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/1750011620811-IMG_8439.JPG'); // Fallback
          setHeroImageAlt('Safety training in action');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setHeroImage('https://bluvpssu00ym8qv7.public.blob.vercel-storage.com/other/1750011620811-IMG_8439.JPG'); // Fallback
        setHeroImageAlt('Safety training in action');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndHero();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-300 mb-4">Error Loading Courses</h1>
          <p className="text-gray-200 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="min-h-screen pt-13">
      <section className="relative text-white py-32">
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
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">Our Courses</h1>
          <p className="text-xl md:text-2xl text-yellow-400 font-semibold">Comprehensive Safety Training for a Secure Workplace</p>
        </div>
      </section>

      <section className="py-12 border-b border-yellow-500/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3 icon-container">
              <CourseIcon name="shield" className="h-8 w-8 text-yellow-500 icon" />
              <span className="font-semibold text-gray-300">WorkSafeBC Compliant</span>
            </div>
            <div className="flex items-center justify-center space-x-3 icon-container">
              <CourseIcon name="award" className="h-8 w-8 text-yellow-500 icon" />
              <span className="font-semibold text-gray-300">Official Certification</span>
            </div>
            <div className="flex items-center justify-center space-x-3 icon-container">
              <CourseIcon name="users" className="h-8 w-8 text-yellow-500 icon" />
              <span className="font-semibold text-gray-300">Expert Instructors</span>
            </div>
            <div className="flex items-center justify-center space-x-3 icon-container">
              <CourseIcon name="clock" className="h-8 w-8 text-yellow-500 icon" />
              <span className="font-semibold text-gray-300">Flexible Scheduling</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-200">Complete Course Catalog</h2>
            <p className="text-xl text-gray-400 mt-4 max-w-2xl mx-auto">
              Choose from our comprehensive selection of safety training courses,
              each designed to meet industry standards and regulatory requirements.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
                <CourseIcon name="shield" className="w-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">No Courses Available</h3>
              <p className="text-gray-200">
                Courses are being updated. Please check back soon or contact us for more information.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden"
                >
                  <div className="relative">
                    {course.image_url ? (
                      <Image
                        src={course.image_url}
                        alt={course.image_alt || course.title}
                        width={400}
                        height={300}
                        layout="responsive"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-200">
                        <div className="text-center">
                          <CourseIcon name="camera" className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs">{course.image_alt || 'Professional safety training course'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                      <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
                        {course.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-100 mb-3">{course.title}</h3>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <CourseIcon name="clock" className="h-6 w-6 text-yellow-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CourseIcon name="users" className="h-10 w-10 text-yellow-500" />
                        <span>{course.audience}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-6 leading-relaxed line-clamp-3">
                      {course.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-auto mb-4">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-3 rounded-lg font-semibold text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow flex items-center justify-center space-x-2 animate-fadeIn"
                      >
                        <span>Learn More</span>
                        <CourseIcon name="arrow-right" className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/courses/${course.slug}#request-syllabus`}
                        className="inline-flex items-center justify-center space-x-2 bg-transparent border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 text-white px-4 py-2 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow"
                      >
                        <span>Get Syllabus</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Contact us today to schedule training for your team or to discuss custom course development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Contact Us Today
            </Link>
            <a
              href="tel:250-615-3727"
              className="inline-flex items-center justify-center space-x-2 bg-transparent border-2 border-amber-400 hover:bg-amber-400 hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Call (250) 615-3727
            </a>
          </div>
        </div>
      </section>
    </div>
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