'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, Phone, Mail } from 'lucide-react'
import Logo from '../ui/Logo'

const courseCategories = {
  'KIST Safety Training': [
    { name: 'KIST Orientation to Workplace Safety', slug: 'kist-orientation' },
    { name: 'KIST Bullying & Harassment', slug: 'kist-bullying-harassment' },
    { name: 'KIST Fall Protection', slug: 'kist-fall-protection' },
    { name: 'KIST Confined Space Entry & Standby', slug: 'kist-confined-space' },
    { name: 'KIST Rigger/Signalperson (Level 1)', slug: 'kist-rigger-signalperson' },
    { name: 'KIST Hazardous Energy Control (LOTO)', slug: 'kist-loto' },
    { name: 'KIST Introduction to Arc Flash', slug: 'kist-arc-flash' },
    { name: 'KIST Working Safely in Bear Country', slug: 'kist-bear-safety' },
    { name: 'KIST Equipment & Vehicle Spotter', slug: 'kist-spotter' },
    { name: 'KIST Chainsaw Safety', slug: 'kist-chainsaw' },
  ],
  'Operator Certification': [
    { name: 'Certified Operator Equipment Training', slug: 'operator-equipment' },
    { name: 'Heavy Equipment Operation', slug: 'heavy-equipment' },
  ],
  'Specialized Training': [
    { name: 'WHMIS 2018 GHS', slug: 'whmis-2018' },
    { name: 'Transportation of Dangerous Goods', slug: 'dangerous-goods' },
  ]
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show header when at the top of the page
      if (currentScrollY < 10) {
        setIsHeaderVisible(true)
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsHeaderVisible(false)
        setIsCoursesOpen(false) // Close dropdown when hiding
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [lastScrollY])

  // Close mobile menu when header becomes hidden
  useEffect(() => {
    if (!isHeaderVisible) {
      setIsMenuOpen(false)
    }
  }, [isHeaderVisible])

  return (
    <header 
      className={`bg-white dark:bg-black shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Top contact bar */}
      <div className="bg-black dark:bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-brand-yellow" />
              <span>250-615-3727</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-brand-yellow" />
              <span>info@karmatraining.ca</span>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-brand-yellow font-medium">Premier Safety Training for Northwestern BC</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - Made much bigger and removed text */}
          <Logo size="lg" showText={false} />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors">
              About
            </Link>
            
            {/* Courses Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors"
              >
                <span>Courses</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isCoursesOpen && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-black rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50">
                  <div className="py-2">
                    <Link
                      href="/courses"
                      className="block px-4 py-3 text-gray-900 dark:text-white hover:bg-brand-yellow hover:text-black font-semibold border-b border-gray-200 dark:border-gray-800 transition-colors"
                    >
                      View All Courses
                    </Link>
                    
                    {Object.entries(courseCategories).map(([category, courses]) => (
                      <div key={category} className="px-4 py-2">
                        <h4 className="text-brand-yellow font-semibold text-sm mb-2">{category}</h4>
                        {courses.map((course) => (
                          <Link
                            key={course.slug}
                            href={`/courses/${course.slug}`}
                            className="block px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 text-sm transition-colors rounded"
                          >
                            {course.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors">
              Contact
            </Link>
            
            <Link 
              href="/contact" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-4 pt-4">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors">
                About
              </Link>
              <Link href="/courses" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors">
                Courses
              </Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium transition-colors">
                Contact
              </Link>
              <Link 
                href="/contact" 
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold transition-colors duration-200 text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

