import Link from 'next/link';
import { ArrowLeft, Clock, Users, Award, CheckCircle, Camera, Phone, Mail, Shield, MapPin, BookOpen } from 'lucide-react';

// Define Course interface to replace any
interface Course {
  title: string;
  duration: string;
  audience: string;
  format: string;
  passingGrade: string;
  description: string;
  overview: string;
  includes: string;
  category: string;
  imageAlt: string;
  image_url?: string; // Optional, as not present in provided data
}

// Complete course data with all official information from the 2025 catalogue
const courseData: { [key: string]: Course } = {
  'kist-orientation': {
    title: 'KIST Orientation to Workplace Safety',
    duration: '6-8 hours',
    audience: 'BC Workers',
    format: 'In-class, instructor led',
    passingGrade: 'Certificate of Completion',
    description: 'A worksite safety orientation program developed for British Columbia workers, providing them with the core knowledge they need to understand the BC safety requirements of work sites in the province and to work there with confidence.',
    overview: 'This program provides an overall knowledge of the importance of safety practices in the workplace and at home. It is designed to develop and nurture a safety consciousness that works in all aspects of daily life. This orientation is great for new hires or can be delivered to seasoned employees who would benefit from a review of safety in industry.',
    includes: 'In-class, instructor led power point presentation and lecture, various safety videos and open discussion.',
    category: 'Foundation Safety',
    imageAlt: 'Workplace safety orientation training session'
  },
  'kist-bullying-harassment': {
    title: 'KIST Bullying & Harassment',
    duration: '4 hours',
    audience: 'All Workers',
    format: 'In-class training with discussion',
    passingGrade: 'Certificate of Completion',
    description: 'Training to define and specify the basic legal obligations of employers, supervisors and employees when it comes to bullying and harassment in the workplace.',
    overview: 'The objective of the training is to advance awareness of the harmful consequences of bully and harassment and to develop the knowledge and understanding required to ensure the health and safety of everyone in the workplace.',
    includes: 'Discussion throughout the training with built-in opportunities for participants to share experiences, offer constructive feedback, and develop solutions.',
    category: 'Workplace Safety',
    imageAlt: 'Workplace harassment prevention training'
  },
  'whmis-2018': {
    title: 'WHMIS 2018 GHS',
    duration: '4 hours',
    audience: 'All Workers',
    format: 'In-class training',
    passingGrade: '80% required for certification',
    description: 'Updated WHMIS training explaining the changes that have come into effect as result of the Globally Harmonized System. This training covers the new pictograms, Safety Data Sheets, and updated regulations.',
    overview: 'Because the global marketplace has grown, and international trade is prevalent, the United Nations has implemented a Globally Harmonized System for Workplace Hazardous Materials. This new system has modified some of the regulations, changed the WHMIS Pictograms and significantly reformatted the MSDS (Now called SDS).',
    includes: 'Training material based on the Danatec model and a handy 64-page pocket handbook for each student to keep for future reference.',
    category: 'Chemical Safety',
    imageAlt: 'WHMIS hazardous materials training'
  },
  'kist-fall-protection': {
    title: 'KIST Fall Protection',
    duration: '7-8 hours',
    audience: 'Workers at Heights (over 3m/10ft)',
    format: 'In-class with practical components',
    passingGrade: '80% required (70% theory, 10% equipment inspection, 20% harness fitting)',
    description: 'In British Columbia training in fall protection is required for any worker working over 3m (10ft). This training provides an in-depth understanding of the safety requirements when working at heights.',
    overview: 'This training includes a theoretical test that makes up 70% of the total mark. In addition, there are two practical components; an equipment inspection component worth 10% and a harness inspection and fitting component that makes up 20% of the final mark.',
    includes: '45-page manual with WorkSafeBC Regulations, harness selection, inspection criteria, and information on suspension trauma. Practical components included.',
    category: 'Height Safety',
    imageAlt: 'Fall protection equipment training'
  },
  'kist-confined-space': {
    title: 'KIST Confined Space Entry & Standby',
    duration: '7 hours',
    audience: 'Entry Workers and Standby Personnel',
    format: 'In-class with gas detection training',
    passingGrade: '80% required for certification',
    description: 'In British Columbia specific instruction must be given to those who enter a confined space as well as those contributing to the work activity but not entering the space, such as standby workers and rescue personnel.',
    overview: 'This training provides an in-depth understanding of the safety requirements when working in and around confined spaces. Includes gas detection systems training.',
    includes: 'Comprehensive manual with WorkSafeBC regulations, gas detection equipment information, and practical training components.',
    category: 'Confined Spaces',
    imageAlt: 'Confined space entry training'
  },
  'kist-rigger-signalperson': {
    title: 'KIST Rigger/Signalperson (Level 1)',
    duration: '7-8 hours',
    audience: 'Riggers and Signal Personnel',
    format: 'In-class with practical exercises',
    passingGrade: '80% required for certification',
    description: 'Training for rigging and signaling operations, covering safe lifting practices and communication protocols for qualified workers.',
    overview: 'This training provides comprehensive instruction in safe rigging practices, load calculations, sling selection, and effective communication protocols for lifting operations.',
    includes: 'Rigging Handbook by Jerry Klinke, Crosby User Guide for Lifting, calculation worksheets and guides, and practical training components.',
    category: 'Lifting Operations',
    imageAlt: 'Rigging and signaling training'
  },
  'kist-loto': {
    title: 'KIST Hazardous Energy Control (LOTO)',
    duration: '6 hours',
    audience: 'Maintenance and Service Workers',
    format: 'In-class training',
    passingGrade: '80% required for certification',
    description: 'Lockout/Tagout procedures for controlling hazardous energy during equipment maintenance and servicing operations.',
    overview: 'This training provides comprehensive instruction in hazardous energy control procedures, lockout/tagout techniques, and energy isolation methods for safe maintenance operations.',
    includes: 'LOTO procedures manual, energy control checklists, training materials and guides, and practical application exercises.',
    category: 'Energy Control',
    imageAlt: 'Lockout tagout safety training'
  },
  'kist-arc-flash': {
    title: 'KIST Introduction to Arc Flash',
    duration: '4 hours',
    audience: 'Electrical Workers',
    format: 'In-class training',
    passingGrade: 'Certificate of Completion',
    description: 'Essential training for electrical safety, covering arc flash hazards, protective measures, and safety protocols for electrical workers.',
    overview: 'This training provides essential knowledge of arc flash hazards, electrical safety regulations, proper PPE requirements, and safe work practices for electrical workers.',
    includes: 'Arc flash safety manual, PPE selection guides, safety procedure checklists, and emergency response procedures.',
    category: 'Electrical Safety',
    imageAlt: 'Arc flash electrical safety training'
  },
  'kist-bear-safety': {
    title: 'KIST Working Safely in Bear Country',
    duration: '4 hours',
    audience: 'Outdoor Workers',
    format: 'In-class training',
    passingGrade: 'Certificate of Completion',
    description: 'Specialized training for workers in bear habitat areas, covering prevention strategies, awareness techniques, and emergency response procedures.',
    overview: 'This training provides specialized knowledge for working safely in bear habitat, including behavior understanding, prevention strategies, and emergency response procedures.',
    includes: 'Bear safety manual, prevention strategy guides, emergency response procedures, and awareness technique training.',
    category: 'Wildlife Safety',
    imageAlt: 'Bear safety awareness training'
  },
  'dangerous-goods': {
    title: 'Transportation of Dangerous Goods',
    duration: '6 hours',
    audience: 'Transport Workers and Drivers',
    format: 'In-class training',
    passingGrade: 'Certificate of Completion',
    description: 'Training on regulations and procedures for safely transporting dangerous goods, covering classification, documentation, and emergency procedures.',
    overview: 'This training provides comprehensive instruction in TDG regulations, dangerous goods classification, documentation requirements, and emergency response procedures.',
    includes: 'TDG regulations manual, classification guides, emergency response procedures, and documentation training materials.',
    category: 'Transportation Safety',
    imageAlt: 'Dangerous goods transportation training'
  },
  'kist-spotter': {
    title: 'KIST Equipment & Vehicle Spotter',
    duration: '4 hours',
    audience: 'Equipment Operators and Spotters',
    format: 'In-class training',
    passingGrade: 'Certificate of Completion',
    description: 'Training for equipment and vehicle spotting techniques to ensure safe operations around heavy machinery and vehicles.',
    overview: 'This training provides instruction in spotter roles, communication techniques, hazard recognition, and safe positioning principles for equipment operations.',
    includes: 'Spotting procedures manual, communication signal guides, safety checklists, and practical application training.',
    category: 'Equipment Safety',
    imageAlt: 'Equipment spotting safety training'
  },
  'kist-chainsaw': {
    title: 'KIST Chainsaw Safety',
    duration: '6 hours',
    audience: 'Chainsaw Operators',
    format: 'In-class training',
    passingGrade: 'Certificate of Completion',
    description: 'Comprehensive chainsaw safety training covering proper operation, maintenance, and safety procedures for chainsaw use.',
    overview: 'This training provides comprehensive instruction in chainsaw safety, proper operating techniques, maintenance procedures, and safe work practices.',
    includes: 'Chainsaw safety manual, maintenance guides, PPE selection information, and safety procedure training.',
    category: 'Tool Safety',
    imageAlt: 'Chainsaw safety operation training'
  },
  'operator-equipment': {
    title: 'Certified Operator Equipment Training',
    duration: 'Varies by Equipment',
    audience: 'Equipment Operators',
    format: 'In-class and practical training',
    passingGrade: 'IVES Certification (70% required)',
    description: 'IVES certification for 9 equipment types including forklifts, excavators, and more. Comprehensive training with both theoretical and practical components.',
    overview: 'This training provides IVES certification for various equipment types, combining theoretical knowledge with practical skills development for professional equipment operation.',
    includes: 'Equipment-specific manuals, IVES certification materials, practical training equipment, and official IVES certificate upon successful completion.',
    category: 'Equipment Certification',
    imageAlt: 'IVES equipment operator certification training'
  },
  'heavy-equipment': {
    title: 'Heavy Equipment Operation',
    duration: 'Varies by Equipment',
    audience: 'Heavy Equipment Operators',
    format: 'Practical and classroom training',
    passingGrade: 'Certification upon completion',
    description: 'Specialized training for heavy equipment operation with certification, covering various types of heavy machinery and advanced operating techniques.',
    overview: 'This training provides specialized instruction in heavy equipment operation, advanced safety procedures, complex maneuvering techniques, and professional certification.',
    includes: 'Heavy equipment manuals, advanced training materials, practical training equipment, and professional certification upon completion.',
    category: 'Heavy Equipment',
    imageAlt: 'Heavy equipment operation training'
  }
};

interface PageProps {
  params: Promise<{
    courseid: string;
  }>;
}

export default async function CoursePage({ params }: PageProps) {
  const { courseid } = await params;
  
  const course = courseData[courseid];
  
  if (!course) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This course may not be available or the link may be incorrect.</p>
          <Link href="/courses" className="text-yellow-500 hover:text-yellow-600 font-semibold">
            ← View All Available Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* Navigation */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <Link 
            href="/courses"
            className="inline-flex items-center space-x-2 text-yellow-500 hover:text-yellow-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to All Courses</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-6">
              <span className="bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-full text-sm font-medium">
                {course.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">{course.title}</h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#request-syllabus"
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
              >
                Request Course Syllabus
              </a>
              <a 
                href="tel:250-615-3727"
                className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
              >
                Call: 250-615-3727
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Course Image */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden">
              <div className="text-center text-gray-600 dark:text-gray-300">
                <Camera className="h-16 w-16 mx-auto mb-4 text-brand-yellow" />
                <p className="font-medium text-xl mb-2 text-gray-800 dark:text-gray-200">{course.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{course.imageAlt}</p>
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-500">Professional training session</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            
            {/* Quick Stats - Narrower containers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Clock className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Duration</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{course.duration}</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Users className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Audience</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{course.audience}</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <BookOpen className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Format</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{course.format}</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <Award className="h-6 w-6 text-brand-yellow mx-auto mb-2" />
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Certification</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{course.passingGrade.includes('80%') ? 'Certification' : 'Certificate'}</div>
              </div>
            </div>

            {/* Course Overview */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Course Overview</h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                  {course.overview}
                </p>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">What&apos;s Included</h2>
              <div className="bg-brand-yellow/5 dark:bg-gray-800 border border-brand-yellow/20 dark:border-brand-yellow/30 rounded-2xl p-8 max-w-4xl mx-auto">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-brand-yellow mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {course.includes}
                  </p>
                </div>
              </div>
            </div>

            {/* Certification Requirements - Only show if not just completion */}
            {course.passingGrade !== 'Certificate of Completion' && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Certification Requirements</h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center max-w-2xl mx-auto">
                  <Shield className="h-10 w-10 text-brand-yellow mx-auto mb-4" />
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {course.passingGrade}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Company Credibility */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Why Choose Karma Training?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500 mb-2">2017</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">Established</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Serving Northwestern BC</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500 mb-2">70+</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">Years Combined Experience</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Expert instruction team</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500 mb-2">2000+</div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">Students Trained</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Successful graduates</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <p className="text-yellow-500 font-medium text-xl italic mb-4">
                We believe the choices you make today will define your tomorrow
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Professional safety training for Northwestern British Columbia. Expert instruction and certification for workplace safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="request-syllabus" className="py-20 bg-yellow-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-black mb-6">Ready to Get Started?</h2>
            <p className="text-black/80 text-xl mb-8 max-w-2xl mx-auto">
              Get the complete course syllabus, pricing information, and next available class dates.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Course Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <a 
                  href="tel:250-615-3727"
                  className="flex items-center justify-center space-x-3 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call: 250-615-3727</span>
                </a>
                
                <a 
                  href={`mailto:info@karmatraining.ca?subject=Course Information Request - ${course.title}`}
                  className="flex items-center justify-center space-x-3 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email for Syllabus</span>
                </a>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-4">
                  We will provide a syllabus for each course upon request.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Northwestern BC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>info@karmatraining.ca</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Explore More Courses</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Build a complete safety skill set with our comprehensive training programs
            </p>
          </div>
          
          <div className="text-center">
            <Link 
              href="/courses"
              className="inline-flex items-center space-x-2 bg-brand-yellow hover:bg-brand-yellow-dark text-black px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <span>View All Courses</span>
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}