'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trash2, 
  Star, 
  Users, 
  Save,
  X,
  BookOpen,
  LogOut,
  Building2,
  MessageCircle,
  Home,
  Folder,
  Upload,
  Quote,
} from 'lucide-react';
import { 
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  username: string;
  name: string;
}

interface Stats {
  courses: number;
  teamMembers: number;
  testimonials: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats>({
    courses: 0,
    teamMembers: 0,
    testimonials: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form data states
  const [courseFormData, setCourseFormData] = useState({
    slug: '',
    title: '',
    description: '',
    duration: '',
    audience: '',
    category_id: '',
    popular: false,
    image_url: '',
    image_alt: '',
    features: ['']
  });

  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: '',
    bio: '',
    photo_url: '',
    experience_years: '',
    specializations: [''],
    featured: false,
    display_order: '0',
  });

  const [testimonialFormData, setTestimonialFormData] = useState({
    client_name: '',
    client_role: '',
    company: '',
    industry: '',
    content: '',
    rating: '5',
    client_photo_url: '',
    featured: false,
  });

  const loadStats = useCallback(async () => {
    try {
      const [coursesRes, teamRes, testimonialsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/team-members'),
        fetch('/api/testimonials'),
      ]);

      const [courses, team, testimonials] = await Promise.all([
        coursesRes.json(),
        teamRes.json(),
        testimonialsRes.json(),
      ]);

      setStats({
        courses: Array.isArray(courses) ? courses.length : 0,
        teamMembers: Array.isArray(team) ? team.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [setStats]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/categories', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/auth');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAuthenticated(true);
        loadStats();
        loadCategories();
      } else {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      }
    } catch {
      router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
    } finally {
      setLoading(false);
    }
  }, [router, setUser, setAuthenticated, loadStats, loadCategories, setLoading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      const csrfResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token');
      const csrfData = await csrfResponse.json();
      
      if (!csrfResponse.ok) {
        console.error('Failed to get CSRF token:', csrfData.error);
        return;
      }
      
      const logoutResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken: csrfData.csrfToken
        }),
      });
      
      if (logoutResponse.ok) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      } else {
        const errorData = await logoutResponse.json();
        console.error('Logout failed:', errorData.error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Course form handlers
  const resetCourseForm = () => {
    setCourseFormData({
      slug: '',
      title: '',
      description: '',
      duration: '',
      audience: '',
      category_id: '',
      popular: false,
      image_url: '',
      image_alt: '',
      features: ['']
    });
    setShowCourseModal(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCourseTitleChange = (title: string) => {
    setCourseFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleAddCourseFeature = () => {
    setCourseFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleRemoveCourseFeature = (index: number) => {
    setCourseFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleCourseFeatureChange = (index: number, value: string) => {
    setCourseFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const courseData = {
        ...courseFormData,
        category_id: courseFormData.category_id ? parseInt(courseFormData.category_id) : null,
        features: courseFormData.features.filter(f => f.trim() !== '')
      };

      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        setMessage('Course created successfully!');
        resetCourseForm();
        loadStats();
      } else if (response.status === 401) {
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

  // Team member form handlers
  const resetTeamForm = () => {
    setTeamFormData({
      name: '',
      role: '',
      bio: '',
      photo_url: '',
      experience_years: '',
      specializations: [''],
      featured: false,
      display_order: '0',
    });
    setShowTeamModal(false);
  };

  const handleAddTeamSpecialization = () => {
    setTeamFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, '']
    }));
  };

  const handleRemoveTeamSpecialization = (index: number) => {
    setTeamFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const handleTeamSpecializationChange = (index: number, value: string) => {
    setTeamFormData(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) => i === index ? value : spec)
    }));
  };

  const handleTeamFileUpload = async (file: File) => {
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', 'team-members');

      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTeamFormData(prev => ({ ...prev, photo_url: data.fileUrl }));
        setMessage('✓ Photo uploaded successfully');
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const teamMemberData = {
        ...teamFormData,
        experience_years: teamFormData.experience_years ? parseInt(teamFormData.experience_years) : null,
        specializations: teamFormData.specializations.filter(s => s.trim() !== ''),
        display_order: parseInt(teamFormData.display_order) || 0,
      };

      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(teamMemberData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || '✓ Team member created successfully');
        resetTeamForm();
        loadStats();
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to save team member');
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      setMessage('Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  // Testimonial form handlers
  const resetTestimonialForm = () => {
    setTestimonialFormData({
      client_name: '',
      client_role: '',
      company: '',
      industry: '',
      content: '',
      rating: '5',
      client_photo_url: '',
      featured: false,
    });
    setShowTestimonialModal(false);
  };

  const handleTestimonialImageUpload = async (file: File) => {
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', 'testimonials');

      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonialFormData(prev => ({ ...prev, client_photo_url: data.fileUrl }));
        setMessage('✓ Photo uploaded successfully');
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const testimonialData = {
        ...testimonialFormData,
        rating: parseInt(testimonialFormData.rating) || 5,
      };

      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(testimonialData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || '✓ Testimonial created successfully');
        resetTestimonialForm();
        loadStats();
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to save testimonial');
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setMessage('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verifying Authentication</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Securing your session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl shadow-lg">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Karma Training CMS
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.username}</p>
                  <div className="inline-flex items-center px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-xs text-green-600 dark:text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('successfully') || message.includes('✓')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Courses Stats - Green Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 truncate">
                    Total Courses
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.courses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Team Members Stats - Purple Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 truncate">
                    Team Members
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.teamMembers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Testimonials Stats - Orange Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 truncate">
                    Testimonials
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.testimonials}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Company Information - Yellow/Amber Theme (Primary Brand) */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Company Information
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Manage company details, mission, and core values
            </p>
            <Link
              href="/adm_f7f8556683f1cdc65391d8d2_8e91/company-info"
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center"
            >
              Edit Company Info
            </Link>
          </div>

          {/* Hero Section - Blue Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Hero Section
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Update homepage hero content and statistics
            </p>
            <Link
              href="/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center"
            >
              Edit Hero Section
            </Link>
          </div>

          {/* Footer Content - Slate/Gray Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Folder className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Footer Content
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Manage footer information, links, and certifications
            </p>
            <Link
              href="/adm_f7f8556683f1cdc65391d8d2_8e91/footer"
              className="w-full bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center"
            >
              Edit Footer Content
            </Link>
          </div>

          {/* Courses - Green Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Courses
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add, edit, and manage training courses
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowCourseModal(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm"
              >
                Add New Course
              </button>
              <Link
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/courses"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-sm"
              >
                Manage Courses
              </Link>
            </div>
          </div>

          {/* Team Members - Purple Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Team Members
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add and manage team member profiles
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowTeamModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm"
              >
                Add Team Member
              </button>
              <Link
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/team-members"
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-sm"
              >
                Manage Team
              </Link>
            </div>
          </div>

          {/* Testimonials - Orange/Red Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Star className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Testimonials
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Manage client testimonials and reviews
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowTestimonialModal(true)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm"
              >
                Add Testimonial
              </button>
              <Link
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/testimonials"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-sm"
              >
                Manage Testimonials
              </Link>
            </div>
          </div>

          {/* File Management - Teal/Cyan Theme */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Folder className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                File Management
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Upload and manage images and files
            </p>
            <button
              onClick={() => alert('File Management feature coming soon!')}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Manage Files
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <span className="mr-1">🔒</span>
                Secure Admin Portal
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="mr-1">🛡️</span>
                Enterprise Security
              </span>
            </div>
            <p className="text-xs">
              Karma Training • Management Portal
            </p>
          </div>
        </div>
      </main>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Course</h2>
                </div>
                <button
                  onClick={resetCourseForm}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Course Title *</label>
                  <input
                    type="text"
                    value={courseFormData.title}
                    onChange={(e) => handleCourseTitleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">URL Slug *</label>
                  <input
                    type="text"
                    value={courseFormData.slug}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="course-url-slug"
                    required
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Used in the course URL</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Duration *</label>
                  <input
                    type="text"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 6-8 hours, 2 days"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Target Audience *</label>
                  <input
                    type="text"
                    value={courseFormData.audience}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, audience: e.target.value }))}
                    placeholder="e.g., BC Workers, All Workers"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Category</label>
                  <select
                    value={courseFormData.category_id}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={courseFormData.popular}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, popular: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <label htmlFor="popular" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Mark as Popular Course
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Description *</label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Enter course description"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Image URL</label>
                  <input
                    type="url"
                    value={courseFormData.image_url}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Image Alt Text</label>
                  <input
                    type="text"
                    value={courseFormData.image_alt}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                    placeholder="Describe the image"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Course Features</label>
                  <button
                    type="button"
                    onClick={handleAddCourseFeature}
                    className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    Add Feature
                  </button>
                </div>
                {courseFormData.features.map((feature, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleCourseFeatureChange(index, e.target.value)}
                      placeholder="Enter course feature"
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    />
                    {courseFormData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCourseFeature(index)}
                        className="px-3 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetCourseForm}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Create Course</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Team Member</h2>
                </div>
                <button
                  onClick={resetTeamForm}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleTeamSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Name *</label>
                  <input
                    type="text"
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Role *</label>
                  <input
                    type="text"
                    value={teamFormData.role}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Instructor, Manager"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Experience Years</label>
                  <input
                    type="number"
                    value={teamFormData.experience_years}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Display Order</label>
                  <input
                    type="number"
                    value={teamFormData.display_order}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, display_order: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Bio</label>
                <textarea
                  value={teamFormData.bio}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Enter team member bio"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Photo</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleTeamFileUpload(file);
                    }}
                    className="hidden"
                    id="team-photo-upload"
                  />
                  <label
                    htmlFor="team-photo-upload"
                    className="cursor-pointer bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-xl font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                  </label>
                  {teamFormData.photo_url && (
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Photo uploaded</span>
                  )}
                </div>
                {teamFormData.photo_url && (
                  <input
                    type="url"
                    value={teamFormData.photo_url}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Photo URL"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Specializations</label>
                  <button
                    type="button"
                    onClick={handleAddTeamSpecialization}
                    className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    Add Specialization
                  </button>
                </div>
                {teamFormData.specializations.map((spec, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => handleTeamSpecializationChange(index, e.target.value)}
                      placeholder="Enter specialization"
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    />
                    {teamFormData.specializations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamSpecialization(index)}
                        className="px-3 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="team-featured"
                  checked={teamFormData.featured}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="team-featured" className="text-sm font-semibold text-gray-900 dark:text-white">
                  Featured Team Member
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetTeamForm}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Add Team Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Testimonial</h2>
                </div>
                <button
                  onClick={resetTestimonialForm}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Client Name *</label>
                  <input
                    type="text"
                    value={testimonialFormData.client_name}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Client Role *</label>
                  <input
                    type="text"
                    value={testimonialFormData.client_role}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, client_role: e.target.value }))}
                    placeholder="e.g., Safety Manager"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Company *</label>
                  <input
                    type="text"
                    value={testimonialFormData.company}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Industry</label>
                  <input
                    type="text"
                    value={testimonialFormData.industry}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Construction"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">Rating *</label>
                  <select
                    value={testimonialFormData.rating}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} Star{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="testimonial-featured"
                    checked={testimonialFormData.featured}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <label htmlFor="testimonial-featured" className="text-sm font-semibold text-gray-900 dark:text-white">
                    Featured Testimonial
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Testimonial Content *</label>
                <textarea
                  value={testimonialFormData.content}
                  onChange={(e) => setTestimonialFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Enter the testimonial content"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Client Photo</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleTestimonialImageUpload(file);
                    }}
                    className="hidden"
                    id="testimonial-photo-upload"
                  />
                  <label
                    htmlFor="testimonial-photo-upload"
                    className="cursor-pointer bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-xl font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                  </label>
                  {testimonialFormData.client_photo_url && (
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Photo uploaded</span>
                  )}
                </div>
                {testimonialFormData.client_photo_url && (
                  <input
                    type="url"
                    value={testimonialFormData.client_photo_url}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, client_photo_url: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="Photo URL"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetTestimonialForm}
                  className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Add Testimonial</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

