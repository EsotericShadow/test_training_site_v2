/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/components/home/featured-courses.tsx
 * Description: Static featured courses component for homepage with highlighted course offerings.
 * Dependencies: React 19, Next.js 15
 * Created: 2025-06-06
 * Last Modified: 2025-08-03
 * Version: 1.0.14
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CourseIcon from '@/app/courses/CourseIcons';
import { useGsap } from '@/app/hooks/useGsap';
import { gsap } from 'gsap';

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  duration: string;
  audience: string;
  features: { feature: string; display_order: number }[];
  popular: boolean;
  image_url?: string;
  image_alt?: string;
  category?: { name: string };
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.courses)) {
          setCourses(data.courses.filter((course: Course) => course.popular).slice(0, 3));
        } else {
          setError('Failed to load featured courses');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load featured courses');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-100 dark:text-white">Featured Courses</h2>
          <p className="text-xl text-gray-300 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Explore our most popular safety training programs, designed for the industries of Northwestern BC.
          </p>
        </div>

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
                    quality={75}
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
                  <div className="flex items-center space-x-1 icon-container">
                    <CourseIcon name="clock" className="h-6 w-6 text-yellow-500 icon" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 icon-container">
                    <CourseIcon name="users" className="h-10 w-10 text-yellow-500 icon" />
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

        <div className="text-center mt-12">
          <Link href="/courses" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
            View All Courses
          </Link>
        </div>
      </div>
    </section>
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