'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  duration: string;
  audience: string;
  category_id?: number;
  category_name?: string;
  popular: boolean;
  image_url?: string;
  image_alt?: string;
  features?: string[];
}

interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function CourseManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
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

  const loadData = useCallback(async () => {
    try {
      const coursesResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses', {
        credentials: 'include'
      });
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      } else if (coursesResponse.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }

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

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/auth', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        loadData();
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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const resetForm = () => {
    setFormData({
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
    setEditingCourse(null);
    setShowAddForm(false);
  };

  const handleEdit = (course: Course) => {
    setFormData({
      slug: course.slug || '',
      title: course.title || '',
      description: course.description || '',
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
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingCourse ? prev.slug : generateSlug(title)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const courseData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        features: formData.features.filter(f => f.trim() !== '')
      };

      const url = editingCourse 
        ? `/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses/${editingCourse.id}`
        : '/api/adm_f7f8556683f1cdc65391d8d2_8e91/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        setMessage(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
        resetForm();
        loadData();
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
        loadData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-foreground mb-2">Loading Courses</div>
          <div className="text-sm text-muted-foreground">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard"
                className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Course Management</h1>
                  <p className="text-sm text-muted-foreground">Manage training courses and content</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
                <div className="inline-flex items-center px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-xs text-green-600 dark:text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Online
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Add Course</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('successfully') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-card border border-border rounded-2xl shadow-xl mb-8">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-background transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter course title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="course-url-slug"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Used in the course URL</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 6-8 hours, 2 days"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Target Audience *
                  </label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                    placeholder="e.g., BC Workers, All Workers"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
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
                    checked={formData.popular}
                    onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-input rounded"
                  />
                  <label htmlFor="popular" className="text-sm font-medium text-foreground">
                    Mark as Popular/Featured
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Enter course description"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.image_alt}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_alt: e.target.value }))}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-semibold text-foreground">
                  Course Features
                </label>
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Enter a course feature"
                        className="flex-1 px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-emerald-600 hover:text-emerald-800 text-sm flex items-center space-x-2 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-input rounded-xl text-foreground hover:bg-muted transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingCourse ? 'Update Course' : 'Create Course'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses Table */}
        <div className="bg-card border border-border rounded-2xl shadow-xl">
          <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-foreground">All Courses ({courses.length})</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-semibold text-foreground flex items-center space-x-2">
                            <span>{course.title}</span>
                            {course.popular && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">/{course.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground space-y-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{course.audience}</span>
                          </div>
                        </div>
                        {course.category_name && (
                          <div className="flex items-center space-x-1">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">{course.category_name}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {course.popular && (
                          <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                            Featured
                          </span>
                        )}
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          Active
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="Edit course"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {courses.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4 opacity-50">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground font-medium">No courses found</p>
                <p className="text-sm text-muted-foreground">Create your first course to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <span className="mr-1">📚</span>
                Course Management
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="mr-1">🛡️</span>
                Secure Portal
              </span>
            </div>
            <p className="text-xs">
              Karma Training • Course Management System
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

