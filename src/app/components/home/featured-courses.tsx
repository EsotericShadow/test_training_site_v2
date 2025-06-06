'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Users, Award, Camera } from 'lucide-react';

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  duration: number;
  audience: string;
  features: { feature: string; display_order: number }[];
  popular: boolean;
  image_url?: string;
}

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data.filter((course: Course) => course.popular));
        } else {
          console.error('Expected array from /api/courses, got:', data);
          setError('Failed to load featured courses');
          setCourses([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching courses:', error);
        setError('Failed to load featured courses');
        setCourses([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Safety Courses
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover our most popular workplace safety training programs designed for Northwestern BC industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                {course.image_url ? (
                  <Image
                    src={course.image_url}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Camera className="h-12 w-12 mx-auto mb-2 text-brand-yellow" />
                      <p className="text-sm">Course Image</p>
                    </div>
                  </div>
                )}
                {course.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-brand-yellow text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>{course.audience}</span>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">What You&apos;ll Learn:</h4>
                  <ul className="space-y-1">
                    {course.features.slice(0, 3).map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Award className="h-3 w-3 text-brand-yellow mt-1 flex-shrink-0" />
                        <span>{objective.feature}</span>
                      </li>
                    ))}
                    {course.features.length > 3 && (
                      <li className="text-sm text-gray-500 dark:text-gray-500 italic">
                        +{course.features.length - 3} more objectives
                      </li>
                    )}
                  </ul>
                </div>
                <Link 
                  href={`/courses/${course.slug}`}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-brand-yellow hover:bg-brand-yellow-dark text-black px-4 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1"
                >
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/courses"
            className="inline-flex items-center space-x-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-black px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
          >
            <span>View All 14 Courses</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}