'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Phone, Mail, ChevronRight } from 'lucide-react'
import Logo from '../ui/Logo'

// Define types for better TypeScript support
interface Course {
  name: string
  slug: string
}

interface CourseCategories {
  [key: string]: Course[]
}

interface ApiCourse {
  title: string
  slug: string
  category?: {
    name: string
  }
}

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCoursesOpen, setIsCoursesOpen] = useState(false)
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [courseCategories, setCourseCategories] = useState<CourseCategories>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileDropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const coursesButtonRef = useRef<HTMLButtonElement>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/courses?all=true', { credentials: 'include' })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const { courses }: { courses: ApiCourse[] } = await response.json()

        // Group courses by category
        const groupedCourses = courses.reduce((acc: CourseCategories, course: ApiCourse) => {
          const categoryName = course.category?.name?.trim() || 'Uncategorized'
          if (!acc[categoryName]) {
            acc[categoryName] = []
          }
          acc[categoryName].push({
            name: course.title,
            slug: course.slug
          })
          return acc
        }, {} as CourseCategories)

        // Sort categories and courses for consistent display
        const sortedCategories = Object.keys(groupedCourses)
          .sort((a, b) => a.localeCompare(b))
          .reduce((acc: CourseCategories, key: string) => {
            acc[key] = (groupedCourses[key] ?? []).sort((a: Course, b: Course) => a.name.localeCompare(b.name))
            return acc
          }, {} as CourseCategories)

        setCourseCategories(sortedCategories)
        setError(null)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Handle scroll behavior for mobile menu (dropdown 1)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < 10) {
        setIsHeaderVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
        setIsCoursesOpen(false)
        setIsMobileCoursesOpen(false)
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true)
      }

      // Close mobile menu when scrolling to bottom
      if (isMenuOpen && mobileMenuRef.current) {
        const menuElement = mobileMenuRef.current
        const menuRect = menuElement.getBoundingClientRect()
        const menuBottom = menuRect.bottom
        const windowHeight = window.innerHeight
        
        // If user scrolled past the bottom of the mobile menu
        if (menuBottom <= windowHeight && currentScrollY > lastScrollY) {
          setIsMenuOpen(false)
          setIsMobileCoursesOpen(false)
          setActiveCategory(null)
        }
      }
      
      setLastScrollY(currentScrollY)
    }

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
  }, [lastScrollY, isMenuOpen])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        coursesButtonRef.current && !coursesButtonRef.current.contains(target) &&
        mobileDropdownRef.current && !mobileDropdownRef.current.contains(target)
      ) {
        setIsCoursesOpen(false)
        setIsMobileCoursesOpen(false)
        setActiveCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Close mobile menu and dropdowns when header becomes hidden
  useEffect(() => {
    if (!isHeaderVisible) {
      setIsMenuOpen(false)
      setIsMobileCoursesOpen(false)
      setIsCoursesOpen(false)
      setActiveCategory(null)
    }
  }, [isHeaderVisible])

  // Close mobile menu and dropdown after navigation
  const handleCourseNavigation = (href: string) => {
    setIsMenuOpen(false)
    setIsMobileCoursesOpen(false)
    setIsCoursesOpen(false)
    setActiveCategory(null)
    router.push(href)
  }

  // Handle desktop dropdown interactions with improved hover behavior
  const handleDesktopCoursesEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
    }
    setIsCoursesOpen(true)
  }

  const handleDesktopCoursesLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsCoursesOpen(false)
      setActiveCategory(null)
    }, 200)
  }

  const handleDesktopCoursesClick = () => {
    setIsCoursesOpen(!isCoursesOpen)
    if (isCoursesOpen) {
      setActiveCategory(null)
    }
  }

  // Handle mobile dropdown toggle
  const handleMobileCoursesToggle = () => {
    setIsMobileCoursesOpen(!isMobileCoursesOpen)
    if (!isMobileCoursesOpen) {
      setActiveCategory(null)
    }
  }

  // Handle category interactions
  const handleCategoryHover = (category: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
    }
    setActiveCategory(category)
  }

  const handleCategoryClick = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category)
  }

  // Handle mobile menu close
  const handleMobileMenuClose = () => {
    setIsMenuOpen(false)
    setIsMobileCoursesOpen(false)
    setActiveCategory(null)
  }

  return (
    <header 
      className={`bg-white dark:bg-black shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Top contact bar */}
      <div className="bg-black dark:bg-gray-900 text-white py-2.5">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-base gap-2 sm:gap-0">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-brand-yellow" />
              <span>250-615-3727</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 truncate max-w-[200px] sm:max-w-[300px]">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-brand-yellow" />
              <span className="truncate">info@karmatraining.ca</span>
            </div>
          </div>
          <div className="hidden lg:block text-brand-yellow font-medium">
            Premier Safety Training for Northwestern BC
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Logo size="lg" showText={false} />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors">
              About
            </Link>
            
            {/* Desktop Courses Dropdown (dropdown 2) */}
            <div 
              className="relative"
              onMouseEnter={handleDesktopCoursesEnter}
              onMouseLeave={handleDesktopCoursesLeave}
            >
              <button
                ref={coursesButtonRef}
                onClick={handleDesktopCoursesClick}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50 rounded-md px-3 py-2"
                aria-expanded={isCoursesOpen}
                aria-haspopup="true"
              >
                <span>Courses</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isCoursesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCoursesOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 mt-0 bg-white dark:bg-black rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
                  style={{ 
                    width: 'max(400px, 25vw)',
                    maxWidth: 'min(600px, 90vw)',
                    maxHeight: '80vh'
                  }}
                  onMouseEnter={() => {
                    if (leaveTimeoutRef.current) {
                      clearTimeout(leaveTimeoutRef.current)
                    }
                  }}
                  onMouseLeave={handleDesktopCoursesLeave}
                >
                  {isLoading ? (
                    <div className="px-6 py-4 text-gray-600 dark:text-gray-400 text-base">Loading courses...</div>
                  ) : error ? (
                    <div className="px-6 py-4 text-red-600 dark:text-red-400 text-base">{error}</div>
                  ) : Object.keys(courseCategories).length === 0 ? (
                    <div className="px-6 py-4 text-gray-600 dark:text-gray-400 text-base">No courses available</div>
                  ) : (
                    <div className="flex flex-col" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                      <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex flex-col">
                        <Link
                          href="/courses"
                          onClick={() => handleCourseNavigation('/courses')}
                          className="block px-6 py-4 text-gray-900 dark:text-white hover:bg-brand-yellow hover:text-black font-semibold text-base border-b border-gray-200 dark:border-gray-800 transition-colors"
                        >
                          View All Courses
                        </Link>
                        {Object.entries(courseCategories).map(([category, courses]) => (
                          <div 
                            key={category} 
                            className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                            onMouseEnter={() => handleCategoryHover(category)}
                          >
                            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
                              <h4 className="text-brand-yellow font-semibold text-base">{category}</h4>
                            </div>
                            <div className="px-6 py-2">
                              {courses.map((course) => (
                                <Link
                                  key={course.slug}
                                  href={`/courses/${course.slug}`}
                                  onClick={() => handleCourseNavigation(`/courses/${course.slug}`)}
                                  className="block px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 text-base transition-colors rounded-md"
                                >
                                  {course.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors">
              Contact
            </Link>
            
            <Link 
              href="/contact" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-lg font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            >
              Get Started
            </Link>
          </div>

          {/* Tablet Navigation (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors">
              About
            </Link>
            
            {/* Tablet Courses Dropdown (dropdown 2) */}
            <div className="relative">
              <button
                ref={coursesButtonRef}
                onClick={handleDesktopCoursesClick}
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50 rounded-md px-3 py-2"
                aria-expanded={isCoursesOpen}
                aria-haspopup="true"
              >
                <span>Courses</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isCoursesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCoursesOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 mt-0 w-80 bg-white dark:bg-black rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden"
                  onMouseEnter={() => {
                    if (leaveTimeoutRef.current) {
                      clearTimeout(leaveTimeoutRef.current)
                    }
                  }}
                  onMouseLeave={handleDesktopCoursesLeave}
                >
                  {isLoading ? (
                    <div className="px-6 py-4 text-gray-600 dark:text-gray-400 text-base">Loading courses...</div>
                  ) : error ? (
                    <div className="px-6 py-4 text-red-600 dark:text-red-400 text-base">{error}</div>
                  ) : Object.keys(courseCategories).length === 0 ? (
                    <div className="px-6 py-4 text-gray-600 dark:text-gray-400 text-base">No courses available</div>
                  ) : (
                    <div className="flex flex-col" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                      <Link
                        href="/courses"
                        onClick={() => handleCourseNavigation('/courses')}
                        className="block px-6 py-4 text-gray-900 dark:text-white hover:bg-brand-yellow hover:text-black font-semibold text-base border-b border-gray-200 dark:border-gray-800 transition-colors"
                      >
                        View All Courses
                      </Link>
                      
                      {Object.entries(courseCategories).map(([category, courses]) => (
                        <div key={category} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
                            <h4 className="text-brand-yellow font-semibold text-base">{category}</h4>
                          </div>
                          <div className="px-6 py-2" style={{ maxHeight: 'none', overflow: 'visible' }}>
                            {courses.map((course) => (
                              <Link
                                key={course.slug}
                                href={`/courses/${course.slug}`}
                                onClick={() => handleCourseNavigation(`/courses/${course.slug}`)}
                                className="block px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 text-base transition-colors rounded-md"
                              >
                                {course.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow font-medium text-base transition-colors">
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50 rounded-md p-2"
              aria-expanded={isMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" onClick={handleMobileMenuClose} /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu (dropdown 1) */}
        {isMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden mt-2 pb-8 border-t border-gray-200 dark:border-gray-800" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
            <div className="pt-4 space-y-2">
              <Link 
                href="/" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-brand-yellow hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors rounded-md"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-brand-yellow hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors rounded-md"
              >
                About
              </Link>
              
              {/* Mobile Courses Dropdown (dropdown 2) */}
              <div className="relative">
                <button
                  onClick={handleMobileCoursesToggle}
                  className="flex items-center justify-between w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-brand-yellow hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50"
                  aria-expanded={isMobileCoursesOpen}
                  aria-haspopup="true"
                >
                  <span>Courses</span>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isMobileCoursesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileCoursesOpen && (
                  <div 
                    ref={mobileDropdownRef}
                    className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
                    style={{ overflowY: 'auto', maxHeight: '50vh' }}
                  >
                    {isLoading ? (
                      <div className="px-6 py-4 text-gray-600 dark:text-gray-400">Loading courses...</div>
                    ) : error ? (
                      <div className="px-6 py-4 text-red-600 dark:text-red-400">{error}</div>
                    ) : Object.keys(courseCategories).length === 0 ? (
                      <div className="px-6 py-4 text-gray-600 dark:text-gray-400">No courses available</div>
                    ) : (
                      <div>
                        <Link
                          href="/courses"
                          onClick={() => handleCourseNavigation('/courses')}
                          className="block px-6 py-4 text-gray-900 dark:text-white hover:bg-brand-yellow hover:text-black font-semibold border-b border-gray-200 dark:border-gray-800 transition-colors"
                        >
                          View All Courses
                        </Link>
                        
                        {Object.entries(courseCategories).map(([category, courses]) => (
                          <div key={category} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                            <button
                              onClick={() => handleCategoryClick(category)}
                              className="flex items-center justify-between w-full px-6 py-3 text-left bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50"
                              aria-expanded={activeCategory === category}
                            >
                              <h4 className="text-brand-yellow font-semibold text-sm">{category}</h4>
                              <ChevronRight className={`h-4 w-4 text-brand-yellow transition-transform duration-200 ${activeCategory === category ? 'rotate-90' : ''}`} />
                            </button>
                            
                            {activeCategory === category && (
                              <div className="bg-white dark:bg-black" style={{ maxHeight: 'none', overflow: 'visible' }}>
                                {courses.map((course) => (
                                  <Link
                                    key={course.slug}
                                    href={`/courses/${course.slug}`}
                                    onClick={() => handleCourseNavigation(`/courses/${course.slug}`)}
                                    className="block px-8 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 text-sm transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                  >
                                    {course.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link 
                href="/contact" 
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-brand-yellow hover:bg-gray-50 dark:hover:bg-gray-900 font-medium transition-colors rounded-md"
              >
                Contact
              </Link>
              
              <div className="pt-2">
                <Link 
                  href="/contact" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

