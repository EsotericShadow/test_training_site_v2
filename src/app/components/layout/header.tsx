/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/components/layout/header.tsx
 * Description: Responsive navigation header with auto-hide functionality, dropdown menus,
 *              and mobile-friendly navigation. Features contact information bar and
 *              categorized course navigation with smooth animations and accessibility.
 * Dependencies: React 19, Next.js 15, custom LayoutIcon component, Logo component
 * Created: 2025-06-06
 * Last Modified: 2025-08-03
 * Version: 1.0.13
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import LayoutIcon from './LayoutIcons'
import Logo from '../ui/Logo'

interface Course {
  name: string
  slug: string
}

interface CourseCategories {
  [key: string]: Course[]
}

interface HeaderProps {
  courseCategories: CourseCategories;
}

/**
 * Main header navigation component with responsive design and auto-hide functionality
 * 
 * WHY: Provides intuitive navigation experience with organized course categories,
 *      contact information accessibility, and smooth scroll-based header behavior
 * 
 * HOW: Uses React hooks for state management, scroll event listeners for auto-hide,
 *      and responsive design patterns for mobile and desktop navigation
 * 
 * WHAT: Renders a fixed header with contact bar, logo, navigation menu, and dropdown
 *       for course categories with mobile hamburger menu fallback
 * 
 * @param {HeaderProps} props - Component props
 * @param {CourseCategories} props.courseCategories - Organized course data for navigation
 * @returns {JSX.Element} Complete responsive header navigation
 */
export default function Header({ courseCategories }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  /**
   * Auto-hide header functionality based on scroll direction
   * 
   * WHY: Improves user experience by maximizing content visibility while
   *      maintaining navigation accessibility when scrolling up
   * 
   * HOW: Tracks scroll position and direction to show/hide header with
   *      transform animations for smooth transitions
   * 
   * WHAT: Shows header when scrolling up or near top, hides when scrolling down
   */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 10)
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  /**
   * Click outside handler to close dropdown menus and mobile navigation
   * 
   * WHY: Improves user experience by automatically closing menus when clicking
   *      outside, preventing menu state conflicts and maintaining clean UI
   * 
   * HOW: Listens for mousedown events and checks if click target is outside
   *      the header component boundary using ref comparison
   * 
   * WHAT: Closes both mobile menu and course dropdown when clicking outside header
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
        setIsCoursesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Navigation handler to close all menus when navigating to a new page
   * 
   * WHY: Ensures clean state transition when users navigate, preventing
   *      open menus from persisting after page changes
   * 
   * HOW: Resets all menu state variables to false when called on navigation links
   * 
   * WHAT: Closes mobile menu and course dropdown menus
   */
  const handleNavigation = () => {
    setIsMenuOpen(false)
    setIsCoursesOpen(false)
  }

  return (
    <header 
      ref={headerRef}
      className={`bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-gray-800 text-white text-sm">
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center py-2">
          <div className="flex items-center space-x-4">
            <a href="tel:250-615-3727" className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
              <LayoutIcon name="phone" className="h-4 w-4" />
              <span>250-615-3727</span>
            </a>
            <a href="mailto:info@karmatraining.ca" className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
              <LayoutIcon name="mail" className="h-4 w-4" />
              <span className="hidden sm:inline">info@karmatraining.ca</span>
            </a>
          </div>
          <p className="hidden md:block text-yellow-400 font-medium">
            Your Partner in Workplace Safety
          </p>
        </div>
      </div>

      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <Logo />
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-yellow-500 font-medium transition-colors">Home</Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-yellow-500 font-medium transition-colors">About</Link>
            <div className="relative">
              <button
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-200 hover:text-yellow-500 font-medium transition-colors"
                aria-haspopup="true"
                aria-expanded={isCoursesOpen}
              >
                <span>Courses</span>
                <LayoutIcon name="chevron-down" className={`h-5 w-5 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCoursesOpen && (
                <div ref={dropdownRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto py-2">
                    <Link href="/courses" onClick={handleNavigation} className="block px-5 py-3 bg-gray-50 dark:bg-gray-700 font-semibold hover:bg-yellow-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md mx-2 my-1">View All Courses</Link>
                    {Object.entries(courseCategories).map(([category, courses]) => (
                      <div key={category} className="mt-2">
                        <h3 className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-yellow-600 dark:text-yellow-400 font-semibold mb-1">{category}</h3>
                        <ul>
                          {courses.map(course => (
                            <li key={course.slug}>
                              <Link href={`/courses/${course.slug}`} onClick={handleNavigation} className="block px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors rounded-md mx-2 my-1">{course.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/contact" className="text-gray-700 dark:text-gray-200 hover:text-yellow-500 font-medium transition-colors">Contact</Link>
          </div>
          <div className="hidden lg:block">
            <Link href="/contact" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
              Request a Quote
            </Link>
          </div>
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <LayoutIcon name="x" className="h-6 w-6" /> : <LayoutIcon name="menu" className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 absolute top-full left-0 w-full shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link href="/" onClick={handleNavigation} className="block text-lg font-medium hover:text-yellow-500">Home</Link>
            <Link href="/about" onClick={handleNavigation} className="block text-lg font-medium hover:text-yellow-500">About</Link>
            <div>
              <button
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                className="w-full flex justify-between items-center text-lg font-medium hover:text-yellow-500 py-2"
                aria-haspopup="true"
                aria-expanded={isCoursesOpen}
              >
                <span>Courses</span>
                <LayoutIcon name="chevron-down" className={`h-5 w-5 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCoursesOpen && (
                <div className="mt-2 pl-4 space-y-2 max-h-96 overflow-y-auto">
                  <Link href="/courses" onClick={handleNavigation} className="block px-4 py-2 font-semibold hover:text-yellow-500">View All Courses</Link>
                  {Object.entries(courseCategories).map(([category, courses]) => (
                    <div key={category} className="mt-3">
                      <h3 className="text-yellow-500 font-semibold mb-1">{category}</h3>
                      <ul className="pl-2 space-y-1">
                        {courses.map(course => (
                          <li key={course.slug}>
                            <Link href={`/courses/${course.slug}`} onClick={handleNavigation} className="block py-2 hover:text-yellow-500">{course.name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/contact" onClick={handleNavigation} className="block text-lg font-medium hover:text-yellow-500">Contact</Link>
            <div className="pt-4">
              <Link href="/contact" onClick={handleNavigation} className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
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