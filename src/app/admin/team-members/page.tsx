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
  Briefcase,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  photo_url?: string;
  experience_years?: number;
  specializations?: string[] | string;
  featured: boolean;
  display_order: number;
}

interface User {
  id: number;
  username: string;
  email: string;
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

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    photo_url: '',
    experience_years: '',
    specializations: [''],
    featured: false,
    display_order: '0',
  });

  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/team-members');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setMessage('Failed to load team members');
    }
  }, [setTeamMembers, setMessage]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        loadData();
      } else {
        router.push('/admin/login');
      }
    } catch {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router, setUser, loadData, setLoading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      bio: '',
      photo_url: '',
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
      try {
        specializations =
          typeof teamMember.specializations === 'string'
            ? JSON.parse(teamMember.specializations)
            : teamMember.specializations;
        specializations = Array.isArray(specializations) && specializations.length > 0 ? specializations : [''];
      } catch (error) {
        console.error('Error parsing specializations:', error);
        specializations = [''];
      }
    }

    setFormData({
      name: teamMember.name || '',
      role: teamMember.role || '',
      bio: teamMember.bio || '',
      photo_url: teamMember.photo_url || '',
      experience_years: teamMember.experience_years?.toString() || '',
      specializations,
      featured: teamMember.featured || false,
      display_order: teamMember.display_order.toString() || '0',
    });
    setEditingTeamMember(teamMember);
    setShowAddForm(true);
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

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', 'team-members');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1]}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, photo_url: data.fileUrl }));
        setMessage('✓ Photo uploaded successfully');
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
        ? `/api/admin/team-members/${editingTeamMember.id}`
        : '/api/admin/team-members';
      const method = editingTeamMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1]}`,
        },
        body: JSON.stringify(teamMemberData),
      });

      if (response.ok) {
        setMessage(
          editingTeamMember
            ? '✓ Team member updated successfully'
            : '✓ Team member created successfully'
        );
        resetForm();
        loadData();
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
      const response = await fetch(`/api/admin/team-members/${teamMemberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1]}`,
        },
      });

      if (response.ok) {
        setMessage('✓ Team member deleted successfully');
        loadData();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Team Member Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingTeamMember ? 'Edit Team Member' : 'Add New Team Member'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder="e.g., Instructor, Manager"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Mark as Featured
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={uploading}
                />
                {formData.photo_url && (
                  <div className="mt-2">
                    <Image
                      src={formData.photo_url}
                      alt="Team member photo"
                      width={96}
                      height={96}
                      className="object-cover rounded"
                    />
                  </div>
                )}
                {uploading && (
                  <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="space-y-2">
                  {formData.specializations.map((specialization, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) =>
                          handleSpecializationChange(index, e.target.value)
                        }
                        placeholder="Enter a specialization"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.specializations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSpecialization}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Specialization</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {saving
                      ? 'Saving...'
                      : editingTeamMember
                      ? 'Update Team Member'
                      : 'Create Team Member'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Team Members ({teamMembers.length})
            </h2>
          </div>
          {teamMembers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Briefcase className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No team members yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first team member.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add First Team Member
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {teamMembers.map((teamMember) => (
                <div key={teamMember.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {teamMember.photo_url && (
                        <Image
                          src={teamMember.photo_url}
                          alt={teamMember.name}
                          width={64}
                          height={64}
                          className="object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {teamMember.name}
                          </h3>
                          {teamMember.featured && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{teamMember.role}</p>
                        {teamMember.bio && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {teamMember.bio}
                          </p>
                        )}
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mt-2">
                          {teamMember.experience_years && (
                            <span>{teamMember.experience_years} years experience</span>
                          )}
                          {teamMember.specializations &&
                            Array.isArray(teamMember.specializations) &&
                            teamMember.specializations.length > 0 && (
                              <span>
                                {teamMember.specializations.length} specializations
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(teamMember)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                        title="Edit team member"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(teamMember.id, teamMember.name)
                        }
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                        title="Delete team member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}