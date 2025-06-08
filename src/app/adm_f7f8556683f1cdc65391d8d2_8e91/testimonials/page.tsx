'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  ArrowLeft,
  Save,
  X,
  Upload,
  Quote,
  Building,
} from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Testimonial {
  id: number;
  client_name: string;
  client_role: string;
  company: string;
  industry?: string;
  content: string;
  rating: number;
  client_photo_url?: string;
  featured: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function TestimonialManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    client_role: '',
    company: '',
    industry: '',
    content: '',
    rating: '5',
    client_photo_url: '',
    featured: false,
  });

  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/testimonials', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      setMessage('Failed to load testimonials');
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
      }
    } catch {
      router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
    } finally {
      setLoading(false);
    }
  }, [router, loadData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_role: '',
      company: '',
      industry: '',
      content: '',
      rating: '5',
      client_photo_url: '',
      featured: false,
    });
    setEditingTestimonial(null);
    setShowAddForm(false);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      client_name: testimonial.client_name || '',
      client_role: testimonial.client_role || '',
      company: testimonial.company || '',
      industry: testimonial.industry || '',
      content: testimonial.content || '',
      rating: testimonial.rating.toString() || '5',
      client_photo_url: testimonial.client_photo_url || '',
      featured: testimonial.featured || false,
    });
    setEditingTestimonial(testimonial);
    setShowAddForm(true);
  };

  const handleImageUpload = async (file: File) => {
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
        setFormData((prev) => ({ ...prev, client_photo_url: data.fileUrl }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const testimonialData = {
        ...formData,
        rating: parseInt(formData.rating) || 5,
      };

      const url = editingTestimonial
        ? `/api/adm_f7f8556683f1cdc65391d8d2_8e91/testimonials/${editingTestimonial.id}`
        : '/api/adm_f7f8556683f1cdc65391d8d2_8e91/testimonials';
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(testimonialData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || (editingTestimonial
          ? '✓ Testimonial updated successfully'
          : '✓ Testimonial created successfully'));
        resetForm();
        loadData();
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

  const handleDelete = async (testimonialId: number, clientName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${clientName}"'s testimonial? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/adm_f7f8556683f1cdc65391d8d2_8e91/testimonials/${testimonialId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || '✓ Testimonial deleted successfully');
        loadData();
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setMessage('Failed to delete testimonial');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-2">Loading Testimonials</div>
          <div className="text-sm text-gray-600">Please wait...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard"
                className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                  <p className="text-sm text-gray-600">Manage client testimonials and reviews</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
                <div className="inline-flex items-center px-2 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs text-orange-600">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1 animate-pulse"></div>
                  Online
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Testimonial</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('successfully') || message.includes('✓')
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Client Role *
                  </label>
                  <input
                    type="text"
                    value={formData.client_role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, client_role: e.target.value }))
                    }
                    placeholder="e.g., Safety Manager"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, company: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, industry: e.target.value }))
                    }
                    placeholder="e.g., Construction"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Rating *
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rating: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
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
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="w-4 h-4 text-orange-600 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-900">
                    Featured Testimonial
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">
                  Testimonial Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Share the client's experience and feedback..."
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-900">
                  Client Photo
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-600 hover:bg-orange-100 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                  </label>
                  {formData.client_photo_url && (
                    <div className="flex items-center space-x-2">
                      <Image
                        src={formData.client_photo_url}
                        alt="Preview"
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                      <span className="text-sm text-gray-600">Photo uploaded</span>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.client_photo_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, client_photo_url: e.target.value }))
                  }
                  placeholder="Or enter photo URL directly"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>
                        {editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Testimonials List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Testimonials ({testimonials.length})
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            {testimonials.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6">
                  <MessageSquare className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No testimonials found</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first testimonial</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Add your first testimonial
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testimonials.map((testimonial) => (
                    <tr key={testimonial.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {testimonial.client_photo_url ? (
                              <Image
                                src={testimonial.client_photo_url}
                                alt={testimonial.client_name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover border-2 border-orange-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center border-2 border-orange-200">
                                <MessageSquare className="h-5 w-5 text-orange-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {testimonial.client_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {testimonial.client_role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{testimonial.company}</div>
                            {testimonial.industry && (
                              <div className="text-sm text-gray-600">{testimonial.industry}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {testimonial.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {testimonial.featured ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {testimonial.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(testimonial)}
                            className="text-orange-600 hover:text-orange-800 transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial.id, testimonial.client_name)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-xs text-gray-600 space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <span className="mr-1">💬</span>
                Testimonials
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="mr-1">🛡️</span>
                Secure Portal
              </span>
            </div>
            <p className="text-xs">
              Karma Training • Testimonial Management System
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

