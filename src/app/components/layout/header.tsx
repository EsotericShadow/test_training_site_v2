'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, Phone, Mail } from 'lucide-react'
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

export default function Header({ courseCategories }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsHeaderVisible(currentScrollY < lastScrollY || currentScrollY < 10)
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

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
              <Phone className="h-4 w-4" />
              <span>250-615-3727</span>
            </a>
            <a href="mailto:info@karmatraining.ca" className="flex items-center space-x-2 hover:text-yellow-400 transition-colors">
              <Mail className="h-4 w-4" />
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
                <ChevronDown className={`h-5 w-5 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
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
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                <ChevronDown className={`h-5 w-5 transition-transform ${isCoursesOpen ? 'rotate-180' : ''}`} />
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