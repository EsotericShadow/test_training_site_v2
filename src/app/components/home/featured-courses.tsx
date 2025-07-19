'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Users, Camera } from 'lucide-react';
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
            <div key={course.id} className="course-card backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden">
              <div className="relative h-56">
                {course.image_url ? (
                  <Image
                    src={course.image_url}
                    alt={course.image_alt || course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" quality={75}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-3 text-gray-100 dark:text-white">{course.title}</h3>
                <p className="text-gray-200 dark:text-gray-400 mb-4 line-clamp-3">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-400 dark:text-gray-400 mb-6">
                  <div className="flex items-center"><Clock className="h-6 w-6 mr-1" /> {course.duration}</div>
                  <div className="flex items-center"><Users className="h-10 w-10 mr-1" /> {course.audience}</div>
                </div>
                <Link href={`/courses/${course.slug}`} className="inline-flex items-center text-yellow-500 hover:text-yellow-600 font-semibold">
                  Learn more about {course.title} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
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
