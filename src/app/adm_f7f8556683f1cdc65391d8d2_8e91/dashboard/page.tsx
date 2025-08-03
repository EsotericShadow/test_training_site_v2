
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trash2, 
  Users, 
  Save,
  X,
  BookOpen,
  LogOut,
  Building2,
  Home,
  Folder,
} from 'lucide-react';
import { 
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import FileSelectionButton from '../../components/admin/FileSelectionButton';

interface User {
  id: number;
  username: string;
  name: string;
}

interface Stats {
  courses: number;
  teamMembers: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
}

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

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats>({
    courses: 0,
    teamMembers: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const loadStats = useCallback(async () => {
    try {
      const [coursesRes, teamRes] = await Promise.all([
        fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses'),
        fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members'),
      ]);

      const coursesData = await coursesRes.json();
      const teamData = await teamRes.json();

      setStats({
        courses: coursesData.courses?.length || 0,
        teamMembers: teamData.teamMembers?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

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
  }, [router, loadStats, loadCategories]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      // Fetch a fresh CSRF token right before logging out
      const csrfRes = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/csrf-token');
      if (!csrfRes.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const csrfData = await csrfRes.json();
      const token = csrfData.csrfToken;

      const logoutResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/logout', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
        },
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

  const handleCourseImageSelect = (url: string, file?: FileItem) => {
    setCourseFormData(prev => ({
      ...prev,
      image_url: url,
      image_alt: file?.alt_text || file?.title || prev.image_alt
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

  const handleTeamPhotoSelect = (url: string, file?: FileItem) => {
    setTeamFormData(prev => ({
      ...prev,
      photo_url: url,
      photo_alt: file?.alt_text || file?.title || prev.photo_url
    }));
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

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-white mb-2">Verifying Authentication</div>
          <div className="text-sm text-gray-400">Securing your session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-0">
      {/* Header */}
      <header className="border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl shadow-lg">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Karma Training CMS
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-base text-gray-400">{user?.username}</p>
                  <div className="inline-flex items-center px-2 py-1 bg-green-900/20 border border-green-800 rounded-full text-sm text-green-400">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-8 py-3 bg-red-900/60 border border-red-500 rounded-xl text-red-500 hover:bg-red-600/90 hover:text-red-900 transition-all duration-200 font-medium text-xl"
            >
              <LogOut className="w-8 h8 mr-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border ${
            message.includes('✓') || message.includes('successfully') 
              ? 'bg-green-900/20 border-green-800 text-green-200'
              : 'bg-red-900/20 border-red-800 text-red-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {message.includes('✓') || message.includes('successfully') ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-base font-medium">{message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setMessage('')}
                  className="inline-flex text-gray-400 hover:text-gray-300 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <div className="border border-gray-700 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-base font-semibold text-gray-400 truncate">
                    Total Courses
                  </dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-white">
                    {stats.courses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="border border-gray-700 rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-base font-semibold text-gray-400 truncate">
                    Team Members
                  </dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-white">
                    {stats.teamMembers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Company Information
              </h3>
            </div>
            <p className="text-base text-gray-400 mb-6">
              Manage company details, mission, and core values
            </p>
            <Link
              href="/adm_f7f8556683f1cdc65391d8d2_8e91/company-info"
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-base"
            >
              Edit Company Info
            </Link>
          </div>

          <div className="border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Hero Section
              </h3>
            </div>
            <p className="text-base text-gray-400 mb-6">
              Update homepage hero content and statistics
            </p>
            <Link
              href="/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-base"
            >
              Edit Hero Section
            </Link>
          </div>

          <div className="border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Folder className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Footer Content
              </h3>
            </div>
            <p className="text-base text-gray-400 mb-6">
              Manage footer information, links, and certifications
            </p>
            <Link
              href="/adm_f7f8556683f1cdc65391d8d2_8e91/footer"
              className="w-full bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-base"
            >
              Edit Footer Content
            </Link>
          </div>

          <div className="border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Courses
              </h3>
            </div>
            <p className="text-base text-gray-400 mb-6">
              Add, edit, and manage training courses
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowCourseModal(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-base"
              >
                Add New Course
              </button>
              <Link
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/courses"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-base"
              >
                Manage Courses
              </Link>
            </div>
          </div>

          <div className="border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Team Members
              </h3>
            </div>
            <p className="text-base text-gray-400 mb-6">
              Add and manage team member profiles
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowTeamModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-base"
              >
                Add Team Member
              </button>
              <Link
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/team-members"
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-base"
              >
                Manage Team
              </Link>
            </div>
          </div>

          <div className="border border-gray-700 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <Folder className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                File Management
              </h3>
            </div>
            <p className="text-base text-gray-400 mb-6">
              Upload and organize images and documents
            </p>
            <Link
              href="/adm_f7f8556683f1cdc65391d8d2_8e91/files"
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block text-center text-base"
            >
              Manage Files
            </Link>
          </div>
        </div>
      </main>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Add Course</h2>
                <button
                  onClick={resetCourseForm}
                  className="text-gray-400 hover:text-gray-300 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCourseSubmit} className="p-6 space-y-6 sm:space-y-8">
              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={(e) => handleCourseTitleChange(e.target.value)}
                  className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={courseFormData.slug}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  placeholder="auto-generated-from-title"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Auto-generated from title. Used in URLs.
                </p>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                    placeholder="e.g., 2 days, 16 hours"
                  />
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={courseFormData.category_id}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={courseFormData.audience}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, audience: e.target.value }))}
                  className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  placeholder="e.g., Beginners, Professionals, Managers"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Course Image
                </label>
                <FileSelectionButton
                  value={courseFormData.image_url}
                  onChange={handleCourseImageSelect}
                  category="course-images"
                  label="Select Course Image"
                  placeholder="No course image selected"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={courseFormData.image_alt}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                  className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Course Features
                </label>
                <div className="space-y-3">
                  {courseFormData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleCourseFeatureChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                        placeholder="Enter a course feature"
                      />
                      {courseFormData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCourseFeature(index)}
                          className="p-3 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCourseFeature}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-900/20 text-emerald-400 border border-emerald-800 rounded-xl hover:bg-emerald-900/30 transition-colors text-base"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popular"
                  checked={courseFormData.popular}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, popular: e.target.checked }))}
                  className="w-5 h-5 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor="popular" className="ml-2 text-base font-medium text-gray-300">
                  Mark as popular course
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetCourseForm}
                  className="px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-base"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Course</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
          <div className="rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Add Team Member</h2>
                <button
                  onClick={resetTeamForm}
                  className="text-gray-400 hover:text-gray-300 p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleTeamSubmit} className="p-6 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    value={teamFormData.role}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={teamFormData.bio}
                  onChange={(e) => setTeamFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                  placeholder="Brief biography or description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Team Member Photo
                  </label>
                  <FileSelectionButton
                    value={teamFormData.photo_url}
                    onChange={handleTeamPhotoSelect}
                    category="team-photos"
                    label="Select Team Photo"
                    placeholder="No photo selected"
                  />
                  <div className="mt-4">
                    <label className="block text-base font-medium text-gray-300 mb-2">
                      Or upload new photo:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleTeamFileUpload(file);
                      }}
                      className="text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-purple-900/20 file:text-purple-400 hover:file:bg-purple-900/30"
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="mt-2 text-base text-purple-400">
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Experience Years
                  </label>
                  <input
                    type="number"
                    value={teamFormData.experience_years}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-300 mb-2">
                  Specializations
                </label>
                <div className="space-y-3">
                  {teamFormData.specializations.map((specialization, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => handleTeamSpecializationChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                        placeholder="Enter a specialization"
                      />
                      {teamFormData.specializations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamSpecialization(index)}
                          className="p-3 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-900/20"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTeamSpecialization}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-900/20 text-purple-400 border border-purple-800 rounded-xl hover:bg-purple-900/30 transition-colors text-base"
                  >
                    <Users className="w-5 h-5" />
                    <span>Add Specialization</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={teamFormData.featured}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label htmlFor="featured" className="ml-2 text-base font-medium text-gray-300">
                    Featured team member
                  </label>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={teamFormData.display_order}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, display_order: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-3 sm:py-4 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetTeamForm}
                  className="px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-base"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Team Member</span>
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
