/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/page.tsx
 * Description: This component provides a comprehensive interface for managing team members,
 *              including creating, editing, and deleting profiles.
 * Dependencies: React, Next.js, Lucide-React, Heroicons, FileSelectionButton
 * Created: 2025-06-08
 * Last Modified: 2025-08-03
 * Version: 1.0.8
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
  Briefcase,
  ArrowLeft,
  Save,
  X,
  Users,
  Upload,
  Award,
} from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import FileSelectionButton from '../../components/admin/FileSelectionButton';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  photo_url?: string;
  photo_alt?: string;
  experience_years?: number;
  specializations?: string[];
  featured: boolean;
  display_order: number;
}

interface User {
  id: number;
  username: string;
  email: string;
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

export default function TeamMemberManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null); // Ref for scrolling to form

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    photo_url: '',
    photo_alt: '',
    experience_years: '',
    specializations: [''],
    featured: false,
    display_order: '0',
  });

  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setMessage('Failed to load team members');
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
      name: '',
      role: '',
      bio: '',
      photo_url: '',
      photo_alt: '',
      experience_years: '',
      specializations: [''],
      featured: false,
      display_order: '0',
    });
    setEditingTeamMember(null);
    setShowAddForm(false);
  };

  const handleEdit = (teamMember: TeamMember) => {
    let specializations: string[] = [''];
    if (teamMember.specializations) {
      specializations = typeof teamMember.specializations === 'string'
        ? JSON.parse(teamMember.specializations)
        : teamMember.specializations;
      if (specializations.length === 0) {
        specializations = [''];
      }
    }

    setFormData({
      name: teamMember.name || '',
      role: teamMember.role || '',
      bio: teamMember.bio || '',
      photo_url: teamMember.photo_url || '',
      photo_alt: teamMember.photo_alt || '',
      experience_years: teamMember.experience_years?.toString() || '',
      specializations,
      featured: teamMember.featured || false,
      display_order: teamMember.display_order.toString() || '0',
    });
    setEditingTeamMember(teamMember);
    setShowAddForm(true);
    // Scroll to form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddSpecialization = () => {
    setFormData((prev) => ({
      ...prev,
      specializations: [...prev.specializations, ''],
    }));
  };

  const handleRemoveSpecialization = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const handleSpecializationChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) =>
        i === index ? value : spec
      ),
    }));
  };

  const handlePhotoSelect = (url: string, file: FileItem | undefined) => {
    setFormData(prev => ({
      ...prev,
      photo_url: url,
      photo_alt: file?.alt_text || file?.title || prev.photo_alt
    }));
  };

  const handleFileUpload = async (file: File) => {
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
        setFormData((prev) => ({ ...prev, photo_url: data.fileUrl }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const teamMemberData = {
        ...formData,
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : null,
        specializations: formData.specializations.filter((s) => s.trim() !== ''),
        display_order: parseInt(formData.display_order) || 0,
      };

      const url = editingTeamMember
        ? `/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/${editingTeamMember.id}`
        : '/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members';
      const method = editingTeamMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(teamMemberData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || (editingTeamMember
          ? '✓ Team member updated successfully'
          : '✓ Team member created successfully'));
        resetForm();
        loadData();
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

  const handleDelete = async (teamMemberId: number, teamMemberName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${teamMemberName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/adm_f7f8556683f1cdc65391d8d2_8e91/team-members/${teamMemberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || '✓ Team member deleted successfully');
        loadData();
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      setMessage('Failed to delete team member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-white mb-2">Loading Team Members</div>
          <div className="text-sm text-gray-400">Please wait...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <Link 
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard"
                className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-600 transition-all duration-200 text-base"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Team Members</h1>
                  <p className="text-base text-gray-400">Manage team profiles</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-2">
                <span className="text-base text-gray-400">{user?.username}</span>
                <div className="inline-flex items-center px-2 py-1 bg-purple-900/20 border border-purple-800 rounded-full text-sm text-purple-400">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1 animate-pulse"></div>
                  Online
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border ${
            message.includes('successfully') || message.includes('✓')
              ? 'bg-green-900/20 text-green-400 border-green-800' 
              : 'bg-red-900/20 text-red-400 border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-6 h-6" />
              <span className="font-medium text-base">{message}</span>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div ref={formRef} className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl mb-10">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/20 to-violet-900/20 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {editingTeamMember ? 'Edit Team Member' : 'Add New Team Member'}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white p-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Role *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder="e.g., Instructor, Manager"
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Experience Years
                  </label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experience_years: e.target.value,
                      }))
                    }
                    min="0"
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        display_order: e.target.value,
                      }))
                    }
                    min="0"
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-600 rounded"
                  />
                  <label htmlFor="featured" className="text-base font-semibold text-white flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Mark as Featured</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={6}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                />
              </div>
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Team Member Photo
                </label>
                <FileSelectionButton
                  value={formData.photo_url}
                  onChange={handlePhotoSelect}
                  category="team-photos"
                  label="Select Team Photo"
                  placeholder="No photo selected"
                />
                {formData.photo_alt && (
                  <div className="mt-4">
                    <label className="text-base font-semibold text-white">
                      Photo Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.photo_alt}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, photo_alt: e.target.value }))
                      }
                      placeholder="Describe the photo for accessibility"
                      className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Or Upload New Photo (Legacy)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white hover:bg-gray-600 cursor-pointer transition-all duration-200 text-base"
                  >
                    <Upload className="h-5 w-5" />
                    <span>{uploading ? 'Uploading...' : 'Choose Photo'}</span>
                  </label>
                  {formData.photo_url && (
                    <Image
                      src={formData.photo_url}
                      alt="Team member photo"
                      width={48}
                      height={48}
                      className="object-cover rounded-xl border border-gray-600"
                    />
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-base font-semibold text-white">
                  Specializations
                </label>
                <div className="space-y-4">
                  {formData.specializations.map((specialization, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => handleSpecializationChange(index, e.target.value)}
                        placeholder="e.g., Fall Protection, WHMIS"
                        className="flex-1 px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-base"
                      />
                      {formData.specializations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(index)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSpecialization}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-900/20 text-purple-400 border border-purple-800 rounded-xl hover:bg-purple-900/30 transition-colors text-base"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Specialization</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 border border-gray-600 rounded-xl text-white hover:bg-gray-600 transition-all duration-200 text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>{editingTeamMember ? 'Update' : 'Create'} Team Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Team Members List */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
          <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/20 to-violet-900/20 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Current Team Members</h2>
              <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-sm font-medium rounded-full">
                {teamMembers.length} members
              </span>
            </div>
          </div>
          <div className="p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-900/20 to-violet-900/20 rounded-full mb-6">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No team members found</h3>
                <p className="text-base text-gray-400 mb-6">Get started by adding your first team member</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-base"
                >
                  Add your first team member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {teamMembers.map((member) => (
                  <div key={member.id} className="border border-gray-700 rounded-xl p-6 bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {member.photo_url ? (
                          <Image
                            src={member.photo_url}
                            alt={member.photo_alt || `${member.name} - ${member.role}`}
                            width={48}
                            height={48}
                            className="rounded-full object-cover border-2 border-purple-800"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-900/20 to-violet-900/20 rounded-full flex items-center justify-center border-2 border-purple-800">
                            <Briefcase className="h-6 w-6 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg text-white flex items-center space-x-2">
                            <span>{member.name}</span>
                            {member.featured && (
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            )}
                          </h3>
                          <p className="text-base text-gray-400">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-3 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id, member.name)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-base text-gray-400 mb-4 line-clamp-4">{member.bio}</p>
                    )}
                    {member.specializations && member.specializations.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-white mb-2 flex items-center space-x-1">
                          <Award className="h-4 w-4" />
                          <span>Specializations:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(member.specializations) ? member.specializations : []).map((spec: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-lg text-sm border border-purple-800"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-400 pt-4 border-t border-gray-600">
                      <span>Order: {member.display_order}</span>
                      {member.experience_years && (
                        <span>{member.experience_years} years exp.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <span className="mr-1">👥</span>
                Team Members
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="mr-1">🛡️</span>
                Secure Portal
              </span>
            </div>
            <p className="text-sm">
              Karma Training • Team Member Management System
            </p>
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
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 