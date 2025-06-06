import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Users, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            {/* Real Logo */}
            <div className="mb-6">
              <Image
                src="/assets/logos/logo.png"
                alt="Karma Training - Industrial Safety Northwestern BC"
                width={200}
                height={80}
                className="h-16 w-auto"
                priority
              />
            </div>
            
            <p className="text-brand-yellow font-medium italic mb-4">
              &quot;We believe the choices you make today will define your tomorrow&quot;
            </p>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Northwestern British Columbia&apos;s premier provider of workplace safety training. 
              Professional on-site instruction and certification for workplace safety since 2017.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 text-brand-yellow flex-shrink-0" />
                <span className="font-medium">250-615-3727</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 text-brand-yellow flex-shrink-0" />
                <span>info@karmatraining.ca</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 text-brand-yellow flex-shrink-0" />
                <span>Northwestern British Columbia</span>
              </div>
            </div>
            
            {/* Company Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-yellow">2017</div>
                <div className="text-xs text-gray-400">Established</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-yellow">70+</div>
                <div className="text-xs text-gray-400">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-yellow">2000+</div>
                <div className="text-xs text-gray-400">Students Trained</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-brand-yellow">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  Contact & Quote
                </Link>
              </li>
              <li>
                <Link href="/about#team" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-brand-yellow">Popular Courses</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/courses/kist-orientation" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  KIST Orientation
                </Link>
              </li>
              <li>
                <Link href="/courses/whmis-2018" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  WHMIS 2018 GHS
                </Link>
              </li>
              <li>
                <Link href="/courses/kist-fall-protection" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  Fall Protection
                </Link>
              </li>
              <li>
                <Link href="/courses/kist-confined-space" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  Confined Space
                </Link>
              </li>
              <li>
                <Link href="/courses/operator-equipment" className="text-gray-300 hover:text-brand-yellow transition-colors">
                  Equipment Training
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-brand-yellow mb-4">Certifications</h3>
            <p className="text-gray-300 mb-4">
              All our courses provide official certification upon completion.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-full">
                <Award className="h-4 w-4 text-brand-yellow" />
                <span className="text-gray-300">Certificate of Completion</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-full">
                <Users className="h-4 w-4 text-brand-yellow" />
                <span className="text-gray-300">Industry Recognized</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-full">
                <Award className="h-4 w-4 text-brand-yellow" />
                <span className="text-gray-300">IVES Certification Available</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-full">
                <Users className="h-4 w-4 text-brand-yellow" />
                <span className="text-gray-300">WorkSafeBC Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-300">
                © 2025 Karma Training. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Professional Safety Training for Northwestern British Columbia
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-brand-yellow" />
                <span>WorkSafeBC Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-brand-yellow" />
                <span>IVES Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}