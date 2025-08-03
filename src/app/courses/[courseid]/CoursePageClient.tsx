/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: CoursePageClient.tsx
 * Description: Client-side individual Course page component with detailed course information and enrollment.
 * Dependencies: React 19, Next.js 15, course data management
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import CourseIcon from '../CourseIcons';

interface Course {
  id: number;
  slug: string;
  title: string;
  duration: string;
  audience: string;
  description: string;
  what_youll_learn: string;
  overview?: string;
  includes?: string;
  format?: string;
  passing_grade?: string;
  image_url?: string;
  image_alt?: string;
  features: { feature: string; display_order: number }[];
  category: { name: string };
  popular: boolean;
}

interface CoursePageClientProps {
  course: Course;
}

export default function CoursePageClient({ course }: CoursePageClientProps) {
  // Sanitize Markdown content to handle <br> tags and normalize line breaks
  const sanitizeMarkdown = (content: string) => {
    return content
      .replace(/<br\s*\/?>\s*/gi, '\n\n') // Convert <br> to double newlines for paragraph breaks
      .replace(/\n\s*\n+/g, '\n\n') // Normalize multiple newlines to double newlines
      .trim();
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="border-b border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <Link 
            href="/courses"
            className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
          >
            <CourseIcon name="arrow-left" className="h-5 w-5" />
            <span>Back to All Courses</span>
          </Link>
        </div>
      </div>

      <section className="relative py-12 sm:py-20 text-white overflow-hidden h-[500px] md:h-[600px]">
        <div className="absolute inset-0 z-0">
          {course.image_url ? (
            <Image
              src={course.image_url}
              alt={course.image_alt || course.title}
              fill
              className="object-cover object-top opacity-50"
              priority
              sizes="100vw"
              quality={80}
            />
          ) : (
            <div className="bg-gray-800 w-full h-full" />
          )}
        </div>
        <div className="container mx-auto px-4 relative z-10 flex items-center h-full">
          <div className="max-w-4xl">
            <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
              {course.category.name}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold my-6 text-white drop-shadow-lg">{course.title}</h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-8 pb-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="backdrop-blur-md bg-white/10 backdrop-brightness-110 backdrop-saturate-150 border border-white/20 rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Overview</h2>
              <div className="prose prose-lg max-w-none text-gray-200 [&>ul]:space-y-2 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 [&>ul>li]:list-none [&>ul>li]:before:content-['►'] [&>ul>li]:before:text-yellow-400 [&>ul>li]:before:font-bold [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:leading-relaxed [&>p]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sanitizeMarkdown(course.overview || course.description)}
                </ReactMarkdown>
              </div>
            </div>

            <div className="backdrop-blur-md bg-white/10 backdrop-brightness-110 backdrop-saturate-150 border border-white/20 rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-white mb-6">What You&apos;ll Learn</h2>
              <div className="prose prose-lg max-w-none text-gray-200 [&>ul]:space-y-2 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 [&>ul>li]:list-none [&>ul>li]:before:content-['►'] [&>ul>li]:before:text-yellow-400 [&>ul>li]:before:font-bold [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:leading-relaxed [&>p]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sanitizeMarkdown(course.what_youll_learn)}
                </ReactMarkdown>
              </div>
            </div>

            {course.features && course.features.length > 0 && (
              <div className="backdrop-blur-md bg-white/10 backdrop-brightness-110 backdrop-saturate-150 border border-white/20 rounded-xl shadow-lg p-8">
                <h3 className="text-3xl font-bold text-white mb-6 border-l-4 border-yellow-400 pl-4">Learning Objectives</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {course.features
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((objective, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CourseIcon name="check-circle" className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-200 text-lg">{objective.feature}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {course.includes && (
              <div className="backdrop-blur-md bg-white/10 backdrop-brightness-110 backdrop-saturate-150 border border-white/20 rounded-xl shadow-lg p-8">
                <h3 className="text-3xl font-bold text-white mb-6 border-l-4 border-yellow-400 pl-4">What&apos;s Included</h3>
                <div className="prose prose-lg max-w-none text-gray-200 [&>ul]:space-y-2 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-2 [&>ul>li]:list-none [&>ul>li]:before:content-['►'] [&>ul>li]:before:text-yellow-400 [&>ul>li]:before:font-bold [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:leading-relaxed [&>p]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sanitizeMarkdown(course.includes)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky top-24 self-start">
            <div className="backdrop-blur-md bg-white/10 backdrop-brightness-110 backdrop-saturate-150 border border-white/20 rounded-xl shadow-lg p-8 space-y-6">
              <h3 className="text-2xl font-bold text-yellow-400">Course Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <CourseIcon name="clock" className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-semibold text-lg text-white">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <CourseIcon name="users" className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Target Audience</p>
                    <p className="font-semibold text-lg text-white">{course.audience}</p>
                  </div>
                </div>
                {course.format && (
                  <div className="flex items-center space-x-4">
                    <CourseIcon name="book-open" className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Format</p>
                      <p className="font-semibold text-lg text-white">{course.format}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <CourseIcon name="shield" className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Compliance</p>
                    <p className="font-semibold text-lg text-white">WorkSafeBC Approved</p>
                  </div>
                </div>
                {course.passing_grade && (
                  <div className="flex items-center space-x-4">
                    <CourseIcon name="award" className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Passing Grade</p>
                      <p className="font-semibold text-lg text-white">{course.passing_grade}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-gray-700/50">
                <a 
                  href="#request-syllabus"
                  className="w-full block text-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Request Syllabus
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="request-syllabus" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Get Started Today</h2>
            <p className="text-xl text-gray-400 mb-10">
              Contact us to schedule this course for your team or to join an upcoming session.
            </p>
            <div className="backdrop-blur-md bg-gray-800/30 border border-gray-700/50 border-white/10 rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-center gap-8">
              <a href="tel:250-615-3727" className="flex items-center space-x-4 text-yellow-400 hover:text-yellow-300 transition-colors">
                <CourseIcon name="phone" className="h-8 w-8" />
                <span className="font-bold text-2xl text-white">250-615-3727</span>
              </a>
              <div className="border-l border-gray-600/50 h-12 hidden md:block"></div>
              <a href="mailto:info@karmatraining.ca" className="flex items-center space-x-4 text-yellow-400 hover:text-yellow-300 transition-colors">
                <CourseIcon name="mail" className="h-8 w-8" />
                <span className="font-bold text-2xl text-white">info@karmatraining.ca</span>
              </a>
            </div>
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