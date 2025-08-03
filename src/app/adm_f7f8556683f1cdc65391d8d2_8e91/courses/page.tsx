/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: page.tsx (courses/page.tsx)
 * Description: Comprehensive Course Management System for Karma Training Website CMS.
 * This component provides a full-featured course management interface allowing administrators
 * to create, edit, delete, and organize training courses. Features include dynamic form
 * handling, image selection integration, category management, feature lists, and responsive
 * course display with detailed metadata and visual indicators.
 *
 * Key Features:
 * - Course creation and editing with comprehensive metadata fields
 * - Dynamic feature list management with add/remove functionality
 * - Image selection integration with FileSelectionButton component
 * - Category-based course organization and filtering
 * - URL slug generation and validation
 * - Popular/featured course marking system
 * - Responsive course grid with visual status indicators
 * - Real-time form validation and error handling
 * - CSRF protection for secure form submissions
 * - Authentication verification and session management
 * - Smooth scrolling and user experience enhancements
 *
 * Dependencies:
 * - React (useState, useEffect, useCallback, useRef hooks)
 * - Next.js (useRouter for navigation, Link for routing, Image for optimization)
 * - Lucide React (comprehensive icon set for UI elements)
 * - Heroicons (additional icon set for specific UI elements)
 * - FileSelectionButton (custom component for image selection)
 *
 * API Endpoints Used:
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/auth (authentication verification)
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/courses (course CRUD operations)
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/categories (category management)
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token (CSRF protection)
 *
 * Course Properties:
 * - Basic Info: title, slug, description, duration, audience
 * - Content: what_youll_learn (markdown supported), features array
 * - Organization: category_id, popular status
 * - Media: image_url, image_alt for accessibility
 * - SEO: URL slug for search engine optimization
 *
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Clock, 
  Users, 
  Tag,
  ArrowLeft,
  Save,
  X,
  BookOpen,
} from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import FileSelectionButton from '../../components/admin/FileSelectionButton';

/**
 * @interface Course
 * @description Comprehensive course data structure containing all course information
 * and metadata used throughout the course management system.
 */
interface Course {
  id: number;                    // Unique course identifier
  slug: string;                  // URL-friendly identifier for SEO
  title: string;                 // Course display title
  description: string;           // Course overview/description
  what_youll_learn: string;      // Learning outcomes (supports Markdown)
  duration: string;              // Course duration (e.g., "2 days", "16 hours")
  audience: string;              // Target audience description
  category_id?: number;          // Associated category ID
  category_name?: string;        // Category display name (populated by API)
  popular: boolean;              // Featured/popular status flag
  image_url?: string;            // Course image URL
  image_alt?: string;            // Image accessibility text
  features?: string[];           // Array of course features/benefits
}

/**
 * @interface Category
 * @description Course category structure for organization and filtering
 */
interface Category {
  id: number;                    // Unique category identifier
  name: string;                  // Category display name
  description?: string;          // Optional category description
  display_order: number;         // Sort order for display
}

/**
 * @interface User
 * @description Authenticated user information for session management
 */
interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * @interface FileItem
 * @description File metadata structure for image selection integration
 */
interface FileItem {
  id: number;
  filename: string;
  original_name: string;
  blob_url: string;
  alt_text?: string;
  title?: string;
  description?: string;
  category: string;
  is_featured: boolean;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

/**
 * @component CourseManagement
 * @description Main course management component providing comprehensive course operations.
 * 
 * This component handles:
 * - Authentication verification and session management
 * - Course creation with comprehensive metadata and validation
 * - Course editing with pre-populated form data
 * - Course deletion with confirmation dialogs
 * - Dynamic feature list management (add/remove items)
 * - Image selection integration with file management system
 * - Category-based organization and filtering
 * - URL slug generation and validation
 * - Popular/featured course status management
 * - Responsive course display with visual indicators
 * - Error handling and user feedback systems
 * - CSRF protection for secure operations
 * - Smooth scrolling and enhanced user experience
 * 
 * @returns {JSX.Element} The complete course management interface
 */
export default function CourseManagement() {
  // ============================================================================
  // HOOKS AND NAVIGATION
  // ============================================================================
  
  /**
   * @hook router - Next.js router for navigation and redirects
   */
  const router = useRouter();
  
  /**
   * @ref mainRef - Reference to main content area for smooth scrolling
   */
  const mainRef = useRef<HTMLElement>(null);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * @state user - Currently authenticated admin user information
   */
  const [user, setUser] = useState<User | null>(null);
  
  /**
   * @state loading - Loading state for initial authentication and data loading
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * @state courses - Complete array of course items with metadata
   */
  const [courses, setCourses] = useState<Course[]>([]);
  
  /**
   * @state categories - Available course categories for organization
   */
  const [categories, setCategories] = useState<Category[]>([]);
  
  /**
   * @state showAddForm - Controls visibility of course creation/editing form
   */
  const [showAddForm, setShowAddForm] = useState(false);
  
  /**
   * @state editingCourse - Currently selected course for editing (null for new course)
   */
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  /**
   * @state saving - Loading state for form submission operations
   */
  const [saving, setSaving] = useState(false);
  
  /**
   * @state message - User feedback messages for success/error notifications
   */
  const [message, setMessage] = useState('');
  
  /**
   * @state csrfToken - CSRF token for secure form submissions
   */
  const [csrfToken, setCsrfToken] = useState('');

  /**
   * @state formData - Course form data with all editable fields
   */
  const [formData, setFormData] = useState({
    slug: '',                    // URL slug
    title: '',                   // Course title
    description: '',             // Course description
    what_youll_learn: '',        // Learning outcomes
    duration: '',                // Course duration
    audience: '',                // Target audience
    category_id: '',             // Selected category ID
    popular: false,              // Popular/featured status
    image_url: '',               // Course image URL
    image_alt: '',               // Image alt text
    features: ['']               // Dynamic features array
  });

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  /**
   * @function loadData
   * @description Loads courses and categories from the API with error handling.
   * Makes parallel requests for optimal performance and handles authentication errors.
   * Redirects to login if session is invalid.
   */
  const loadData = useCallback(async () => {
    try {
      // Load courses with authentication check
      const coursesResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses', {
        credentials: 'include' // Include authentication cookies
      });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      } else if (coursesResponse.status === 401) {
        // Session expired, redirect to login
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }

      // Load categories for form dropdown
      const categoriesResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/categories', {
        credentials: 'include'
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Failed to load data');
    }
  }, [router]);

  /**
   * @function checkAuth
   * @description Verifies user authentication and loads initial data.
   * This function runs on component mount to ensure the user is authenticated
   * before displaying the course management interface.
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/auth', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        loadData(); // Load courses and categories after successful authentication
      } else {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch {
      router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      return;
    } finally {
      setLoading(false);
    }
  }, [router, loadData]);

  /**
   * @effect Authentication and CSRF Token Setup
   * @description Runs authentication check and fetches CSRF token on component mount
   */
  useEffect(() => {
    checkAuth();
    
    // Fetch CSRF token for secure form submissions
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    fetchCsrfToken();
  }, [checkAuth]);

  // ============================================================================
  // FORM MANAGEMENT FUNCTIONS
  // ============================================================================

  /**
   * @function resetForm
   * @description Resets the course form to its initial state and closes the form.
   * Clears all form data, editing state, and hides the form modal.
   */
  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      description: '',
      what_youll_learn: '',
      duration: '',
      audience: '',
      category_id: '',
      popular: false,
      image_url: '',
      image_alt: '',
      features: ['']
    });
    setEditingCourse(null);
    setShowAddForm(false);
  };

  /**
   * @function handleEdit
   * @description Initializes the form for editing an existing course.
   * Populates form fields with current course data, sets editing state,
   * and scrolls to form for better user experience.
   * 
   * @param {Course} course - Course to edit
   */
  const handleEdit = (course: Course) => {
    setFormData({
      slug: course.slug || '',
      title: course.title || '',
      description: course.description || '',
      what_youll_learn: course.what_youll_learn || '',
      duration: course.duration || '',
      audience: course.audience || '',
      category_id: course.category_id?.toString() || '',
      popular: course.popular || false,
      image_url: course.image_url || '',
      image_alt: course.image_alt || '',
      features: course.features && course.features.length > 0 ? course.features : ['']
    });
    setEditingCourse(course);
    setShowAddForm(true);
    
    // Scroll to the top of the main content for better UX
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ============================================================================
  // DYNAMIC FEATURE LIST MANAGEMENT
  // ============================================================================

  /**
   * @function handleAddFeature
   * @description Adds a new empty feature field to the features array.
   * Allows users to add multiple course features dynamically.
   */
  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  /**
   * @function handleRemoveFeature
   * @description Removes a specific feature field from the features array.
   * 
   * @param {number} index - Index of the feature to remove
   */
  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  /**
   * @function handleFeatureChange
   * @description Updates a specific feature at the given index.
   * 
   * @param {number} index - Index of the feature to update
   * @param {string} value - New feature value
   */
  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  // ============================================================================
  // URL SLUG GENERATION
  // ============================================================================

  /**
   * @function generateSlug
   * @description Generates a URL-friendly slug from a course title.
   * Converts to lowercase, removes special characters, and replaces spaces with hyphens.
   * 
   * @param {string} title - The course title to convert
   * @returns {string} URL-friendly slug
   */
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Remove duplicate hyphens
      .trim();                      // Remove leading/trailing whitespace
  };

  /**
   * @function handleTitleChange
   * @description Handles course title changes and auto-generates slug for new courses.
   * For existing courses, preserves the original slug to maintain URL consistency.
   * 
   * @param {string} title - The new course title
   */
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Only auto-generate slug for new courses, preserve existing slugs for edits
      slug: editingCourse ? prev.slug : generateSlug(title)
    }));
  };

  // ============================================================================
  // IMAGE SELECTION INTEGRATION
  // ============================================================================

  /**
   * @function handleCourseImageSelect
   * @description Handles course image selection from the file manager.
   * Updates both the image URL and alt text from the selected file metadata.
   * 
   * @param {string} url - Selected image URL
   * @param {FileItem | undefined} file - Optional file metadata for alt text
   */
  const handleCourseImageSelect = (url: string, file: FileItem | undefined) => {
    setFormData(prev => ({
      ...prev,
      image_url: url,
      image_alt: file?.alt_text || file?.title || prev.image_alt
    }));
  };

  // ============================================================================
  // FORM SUBMISSION HANDLING
  // ============================================================================

  /**
   * @function handleSubmit
   * @description Handles course creation/update form submission.
   * Validates data, makes API request with CSRF protection, and provides user feedback.
   * Supports both creating new courses and updating existing ones.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Prepare course data with proper type conversion and validation
      const courseData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        features: formData.features.filter(f => typeof f === 'string' && f.trim() !== '') // Remove empty features
      };

      // Determine API endpoint and method based on editing state
      const url = editingCourse 
        ? `/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/${editingCourse.id}`
        : '/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken, // CSRF protection
        },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        setMessage(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
        resetForm();
        loadData(); // Refresh course list
      } else if (response.status === 401) {
        // Session expired, redirect to login
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      setMessage('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // DELETE FUNCTIONALITY
  // ============================================================================

  /**
   * @function handleDelete
   * @description Handles course deletion with confirmation dialog.
   * Shows confirmation dialog and deletes course if confirmed.
   * 
   * @param {number} courseId - ID of course to delete
   * @param {string} courseTitle - Title of course for confirmation dialog
   */
  const handleDelete = async (courseId: number, courseTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage('Course deleted successfully!');
        loadData(); // Refresh course list
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setMessage('Failed to delete course');
    }
  };

  // ============================================================================
  // LOADING STATE COMPONENT
  // ============================================================================

  /**
   * @component LoadingScreen
   * @description Displays a loading screen while authentication is being verified
   * and initial data is being loaded.
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-white mb-2">Loading Courses</div>
          <div className="text-sm text-gray-400">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ========================================================================
          HEADER SECTION
          Contains navigation, branding, user info, and primary actions
      ======================================================================== */}
      <header className="border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            {/* Left side: Navigation and branding */}
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              {/* Back to Dashboard Link */}
              <Link 
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard"
                className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-600 transition-all duration-200 text-base"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              {/* Page Title and Icon */}
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Course Management</h1>
                  <p className="text-sm text-gray-400">Manage training courses</p>
                </div>
              </div>
            </div>
            {/* Right side: User info and actions */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* User Information Display */}
              <div className="flex items-center space-x-2">
                <span className="text-base text-gray-400">{user?.username}</span>
                {/* Online Status Indicator */}
                <div className="inline-flex items-center px-2 py-1 bg-green-900/20 border border-green-800 rounded-full text-sm text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Online
                </div>
              </div>
              {/* Add Course Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Add Course</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main ref={mainRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ====================================================================
            SUCCESS/ERROR MESSAGES
            Displays user feedback for actions performed
        ==================================================================== */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border ${
            message.includes('successfully') 
              ? 'bg-green-900/20 text-green-400 border-green-800' 
              : 'bg-red-900/20 text-red-400 border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-6 h-6" />
              <span className="font-medium text-base">{message}</span>
            </div>
          </div>
        )}

        {/* ====================================================================
            ADD/EDIT COURSE FORM
            Comprehensive form for creating and editing courses
        ==================================================================== */}
        {showAddForm && (
          <div className="border border-gray-700 rounded-2xl shadow-xl mb-10">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-700 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h2>
                </div>
                {/* Close Form Button */}
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Course Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Course Title Field */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                {/* URL Slug Field */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                    placeholder="course-url-slug"
                    required
                  />
                  <p className="text-sm text-gray-400">Used in the course URL</p>
                </div>
                
                {/* Duration Field */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 6-8 hours, 2 days"
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                    required
                  />
                </div>
                
                {/* Target Audience Field */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Target Audience *
                  </label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                    placeholder="e.g., BC Workers, All Workers"
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                    required
                  />
                </div>
                
                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Popular/Featured Checkbox */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={formData.popular}
                    onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                    className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-600 rounded"
                  />
                  <label htmlFor="popular" className="text-base font-medium text-white">
                    Mark as Popular/Featured
                  </label>
                </div>
              </div>
              
              {/* Course Description Field */}
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Overview/Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                  placeholder="Enter course overview/description"
                  required
                />
              </div>
              
              {/* Learning Outcomes Field */}
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  What You&apos;ll Learn *
                </label>
                <textarea
                  value={formData.what_youll_learn}
                  onChange={(e) => setFormData(prev => ({ ...prev, what_youll_learn: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                  placeholder="Enter what students will learn in this course. Use Markdown for formatting."
                  required
                />
              </div>
              
              {/* Image Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Course Image Selection */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Course Image
                  </label>
                  <FileSelectionButton
                    value={formData.image_url}
                    onChange={handleCourseImageSelect}
                    category="course-images"
                    label="Select Course Image"
                    placeholder="No course image selected"
                  />
                </div>
                
                {/* Image Alt Text Field */}
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.image_alt}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                  />
                </div>
              </div>
              
              {/* Dynamic Course Features Section */}
              <div className="space-y-4">
                <label className="text-base font-semibold text-white">
                  Course Features
                </label>
                <div className="space-y-4">
                  {/* Dynamic Feature Input Fields */}
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Enter a course feature"
                        className="flex-1 px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-base"
                      />
                      {/* Remove Feature Button (only show if more than one feature) */}
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {/* Add Feature Button */}
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-900/20 text-emerald-400 border border-emerald-800 rounded-xl hover:bg-emerald-900/30 transition-colors text-base"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>
              
              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-700">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 bg-gray-700 border border-gray-600 text-white rounded-xl hover:bg-gray-600 transition-colors text-base"
                >
                  Cancel
                </button>
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>{editingCourse ? 'Update Course' : 'Create Course'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ====================================================================
            COURSES LIST SECTION
            Displays all courses with management actions
        ==================================================================== */}
        <div className="border border-gray-700 rounded-2xl shadow-xl">
          {/* List Header */}
          <div className="px-6 py-4 border-b border-gray-700 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">All Courses</h2>
                {/* Course Count Badge */}
                <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-sm font-medium rounded-full">
                  {courses.length} courses
                </span>
              </div>
            </div>
          </div>
          
          {/* Courses Content */}
          <div className="p-6">
            {courses.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
                <p className="text-base text-gray-400 mb-6">Get started by creating your first course</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl mx-auto text-base"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add First Course</span>
                </button>
              </div>
            ) : (
              /* Courses Grid */
              <div className="grid grid-cols-1 gap-8">
                {courses.map((course) => (
                  <div key={course.id} className="border border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Course Title with Popular Indicator */}
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg text-white group-hover:text-emerald-400 transition-colors">
                            {course.title}
                          </h3>
                          {course.popular && (
                            <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        {/* Course Description */}
                        <p className="text-base text-gray-400 mb-3 line-clamp-3">
                          {course.description}
                        </p>
                        
                        {/* Course Metadata Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {/* Duration Badge */}
                          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-900/20 text-blue-400 text-sm rounded-full">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration}</span>
                          </div>
                          {/* Audience Badge */}
                          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-900/20 text-purple-400 text-sm rounded-full">
                            <Users className="h-4 w-4" />
                            <span>{course.audience}</span>
                          </div>
                          {/* Category Badge */}
                          {course.category_name && (
                            <div className="inline-flex items-center space-x-1 px-3 py-1 bg-green-900/20 text-green-400 text-sm rounded-full">
                              <Tag className="h-4 w-4" />
                              <span>{course.category_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Course Image */}
                    {course.image_url && (
                      <div className="mb-4">
                        <Image
                          src={course.image_url}
                          alt={course.image_alt || course.title}
                          width={400}
                          height={128}
                          sizes="100vw"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    {/* Course Footer with Actions */}
                    <div className="flex justify-between items-center">
                      {/* URL Slug Display */}
                      <span className="text-sm text-gray-400">
                        /{course.slug}
                      </span>
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
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
//                           \/                                       \/     \/                 