'use client';

import Link from 'next/link';
import Image from 'next/image';
import CourseIcon from '../CourseIcons';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

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

interface Equipment {
  name: string;
  image: string;
}

interface ExpandedCoursePageClientProps {
  course: Course;
}

const equipmentTypes: Equipment[] = [
    { name: 'Standard Forklift', image: '/uploads/course-images/1752447667439-misc_1.webp' },
    { name: 'Rough Terrain Forklift', image: '/uploads/course-images/1752447667439-misc_1.webp' },
    { name: 'Rough Terrain Telehandler', image: '/uploads/course-images/1752447667439-misc_1.webp' },
    { name: 'MEWPs (Boomlifts & Scissor Lifts)', image: '/uploads/course-images/1752447667439-misc_1.webp' },
    { name: 'Skid-Steer Loader', image: '/uploads/course-images/1752447667439-misc_1.webp' },
    { name: 'Wheel Loader', image: '/uploads/course-images/1752447667439-misc_1.webp' },
    { name: 'Back-Hoe', image: '/assets/equipment/placeholder.jpg' },
    { name: 'Excavator', image: '/assets/equipment/placeholder.jpg' },
];

export default function ExpandedCoursePageClient({ course }: ExpandedCoursePageClientProps) {
  console.log('Original what_youll_learn:', course.what_youll_learn);
  const processedMarkdown = course.what_youll_learn
    .replace(/<br\s*\/?>/gi, '\n\n') // Replace <br> with double newlines for proper paragraph breaks
    .replace(/^- \u25ba\s*/gm, '* ') // Convert - ► lines to proper markdown list items (replace - ► with *)
    .replace(/\n{3,}/g, '\n\n') // Normalize excessive newlines
    .trim(); // Remove leading/trailing whitespace
  console.log('Processed Markdown:', processedMarkdown);

  return (
    <div className="min-h-screen transition-colors duration-300">
      
      <div className="border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <Link 
            href="/courses"
            className="inline-flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors font-medium"
          >
            <CourseIcon name="arrow-left" className="h-5 w-5" />
            <span>Back to All Courses</span>
          </Link>
        </div>
      </div>

      <section className="relative py-12 sm:py-20 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 h-64 md:h-96">
          {course.image_url ? (
            <Image
              src={course.image_url}
              alt={course.image_alt || course.title}
              fill
              className="object-cover opacity-50"
              priority
              sizes="100vw"
              quality={80}
            />
          ) : (
            <div className="bg-gray-800 w-full h-full" />
          )}
          </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <span className="bg-yellow-500 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm font-semibold">
              {course.category.name}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold my-6 text-white drop-shadow-lg">{course.title}</h1>
            
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center">What You&apos;ll Learn</h2>
            <div className="text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto prose lg:prose-xl prose-ul:list-style-type-none prose-li:before:content-['►'] prose-li:before:mr-2 prose-li:before:text-yellow-400 prose-headings:text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {processedMarkdown}
              </ReactMarkdown>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {equipmentTypes.map(equipment => (
              <div key={equipment.name} className="group relative rounded-lg overflow-hidden">
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  width={300}
                  height={400}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
                  <h3 className="text-white text-2xl font-bold text-center">{equipment.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Course Overview</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {course.overview || course.description}
                </ReactMarkdown>
              </div>
            </div>
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-yellow-500 pl-4">Program Outline</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Phase 1 - Theory Training</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">The trainer guides trainees through a comprehensive and interactive review of the operator workbook covering:</p>
                    <ul className="mt-4 space-y-2">
                      {course.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CourseIcon name="check-circle" className="h-5 w-5 text-green-500 mr-2" />
                          <span>{feature.feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Phase 2 - Theory Evaluation</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">The trainer administers a written test based on the concepts covered in the operator&apos;s reference manual. The test consists of ten multiple choice/essay-type questions, which are graded and returned to the trainees, then reviewed to ensure understanding. A minimum score of 70% is required to pass.</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Phase 3 - Practical Training</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Trainees are shown the pre-use inspection, safe operating procedures, and parking/shut-down procedures and then given the opportunity to practice under the helpful eye of the program trainer.</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Phase 4 - Practical Evaluation</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Trainees that are assessed as having reached a minimum skill level are individually evaluated using the equipment in a reasonably challenging course. Following the evaluation, trainees are debriefed and given the opportunity to address any issues they may have regarding their training. Each successful trainee&apos;s employer will receive official records and documents shortly after the end of the program.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:sticky top-24 self-start">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden p-8 space-y-6">
              <h3 className="text-2xl font-bold text-yellow-400">Program Details</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <CourseIcon name="clock" className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Duration</p>
                    <p className="font-semibold text-lg">Minimum of 1 day*</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <CourseIcon name="users" className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Program Capacity</p>
                    <p className="font-semibold text-lg">4-10 trainees*</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <CourseIcon name="book-open" className="h-6 w-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Structure</p>
                    <p className="font-semibold text-lg">50% Classroom, 50% Practical</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">*Dependent on the type(s) of equipment, the number of trainees and their experience level.</p>
              <div className="pt-6 border-t border-gray-700">
                <a 
                  href="#request-syllabus"
                  className="w-full block text-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Request Syllabus
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="request-syllabus" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Certified?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Contact us today to schedule your IVES Certified Operator Training.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <a href="tel:250-615-3727" className="flex items-center space-x-4 text-yellow-400 hover:text-yellow-300 transition-colors">
                <CourseIcon name="phone" className="h-8 w-8" />
                <span className="font-bold text-2xl">250-615-3727</span>
              </a>
              <div className="border-l border-gray-600 h-12 hidden md:block"></div>
              <a href="mailto:info@karmatraining.ca" className="flex items-center space-x-4 text-yellow-400 hover:text-yellow-300 transition-colors">
                <CourseIcon name="mail" className="h-8 w-8" />
                <span className="font-bold text-2xl">info@karmatraining.ca</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}