'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Edit,
  Trash2, 
  ArrowLeft,
  Folder,
  FileText,
  Download,
  Eye,
  Save,
  X,
  Search,
  Filter,
  Star,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  Upload,
  User,
} from 'lucide-react';
import Image from 'next/image';

interface FileItem {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_extension: string;
  blob_url: string;
  width?: number;
  height?: number;
  alt_text?: string;
  title?: string;
  description?: string;
  tags?: string;
  category: string;
  folder_id?: number;
  folder_name?: string;
  usage_count: number;
  is_featured: boolean;
  uploaded_at: string;
  updated_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function FileManagement() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [message, setMessage] = useState('');

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [editFormData, setEditFormData] = useState({
    alt_text: '',
    title: '',
    description: '',
    tags: '',
    category: 'general',
    folder_id: '',
    is_featured: false
  });

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const [uploadFormData, setUploadFormData] = useState({
    alt_text: '',
    title: '',
    description: '',
    tags: '',
    category: 'general',
    is_featured: false
  });

  const [filters, setFilters] = useState({
    category: 'all',
    featured: false,
    search: ''
  });

  const [sortBy, setSortBy] = useState('uploaded_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const filesResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files', {
        credentials: 'include'
      });
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setFiles(filesData.files || []);
      } else if (filesResponse.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setMessage('Failed to load files');
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

  const filteredAndSortedFiles = useMemo(() => {
    const filtered = files.filter(file => {
      if (filters.category !== 'all' && file.category !== filters.category) {
        return false;
      }
      if (filters.featured && !file.is_featured) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          file.original_name.toLowerCase().includes(searchLower) ||
          file.alt_text?.toLowerCase().includes(searchLower) ||
          file.title?.toLowerCase().includes(searchLower) ||
          file.tags?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof FileItem] as string | number;
      let bValue: string | number = b[sortBy as keyof FileItem] as string | number;
      
      if (sortBy === 'file_size') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortBy === 'uploaded_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [files, filters, sortBy, sortOrder]);

  const handleSelectFile = (fileId: number) => {
    setSelectedFiles(prev => {
      const newSelected = prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId];
      setShowBulkActions(newSelected.length > 0);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredAndSortedFiles.length) {
      setSelectedFiles([]);
      setShowBulkActions(false);
    } else {
      const allIds = filteredAndSortedFiles.map(file => file.id);
      setSelectedFiles(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedFiles.length} selected files? This action cannot be undone.`);
    if (!confirmed) return;

    setSaving(true);
    setMessage('');

    try {
      const deletePromises = selectedFiles.map(fileId => 
        fetch(`/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/${fileId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.ok).length;
      
      if (successCount === selectedFiles.length) {
        setMessage(`✓ Successfully deleted ${successCount} files`);
      } else {
        setMessage(`Deleted ${successCount} of ${selectedFiles.length} files`);
      }
      
      setSelectedFiles([]);
      setShowBulkActions(false);
      loadData();
    } catch (error) {
      console.error('Error bulk deleting files:', error);
      setMessage('Failed to delete files');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryStats = () => {
    const stats = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const resetUploadForm = () => {
    setUploadFormData({
      alt_text: '',
      title: '',
      description: '',
      tags: '',
      category: 'general',
      is_featured: false
    });
    setSelectedFile(null);
    setUploadPreview(null);
    setShowUploadForm(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    
    if (!uploadFormData.alt_text) {
      setUploadFormData(prev => ({
        ...prev,
        alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file) return;
    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    
    if (!uploadFormData.alt_text) {
      setUploadFormData(prev => ({
        ...prev,
        alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
      }));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('alt_text', uploadFormData.alt_text);
      formData.append('title', uploadFormData.title);
      formData.append('description', uploadFormData.description);
      formData.append('tags', uploadFormData.tags);
      formData.append('category', uploadFormData.category);
      formData.append('is_featured', uploadFormData.is_featured.toString());

      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        await response.json();
        setMessage('✓ File uploaded successfully');
        resetUploadForm();
        loadData();
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      alt_text: '',
      title: '',
      description: '',
      tags: '',
      category: 'general',
      folder_id: '',
      is_featured: false
    });
    setEditingFile(null);
    setShowEditForm(false);
  };

  const handleEdit = (file: FileItem) => {
    setEditFormData({
      alt_text: file.alt_text || '',
      title: file.title || '',
      description: file.description || '',
      tags: file.tags || '',
      category: file.category,
      folder_id: file.folder_id?.toString() || '',
      is_featured: file.is_featured
    });
    setEditingFile(file);
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;
    
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/${editingFile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...editFormData,
          folder_id: editFormData.folder_id ? parseInt(editFormData.folder_id) : null
        }),
      });

      if (response.ok) {
        setMessage('✓ File updated successfully');
        resetEditForm();
        loadData();
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to update file');
      }
    } catch (error) {
      console.error('Error updating file:', error);
      setMessage('Failed to update file');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fileId: number, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage('File deleted successfully!');
        loadData();
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'general': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
      'team-photos': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
      'course-images': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
      'testimonials': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
      'company': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      'other': 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-foreground mb-2">Loading Files</div>
          <div className="text-sm text-muted-foreground">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <Link 
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard"
                className="text-sm inline-flex items-center space-x-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">File Management</h1>
                  <p className="text-sm text-muted-foreground">Manage your media files</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">{user.username}</span>
                  <div className="inline-flex items-center px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-sm text-green-600 dark:text-green-400">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowUploadForm(true)}
                className="text-sm bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border ${
            message.includes('✓') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-base">{message}</span>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-2xl shadow-lg mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search files by name, alt text, title, or tags..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 bg-background border border-input rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span className="font-medium">Filters</span>
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">All Categories</option>
                      {Object.entries(categoryStats).map(([category, count]) => (
                        <option key={category} value={category}>
                          {category} ({count})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="uploaded_at">Upload Date</option>
                      <option value="original_name">Name</option>
                      <option value="file_size">Size</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-background border border-input rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Featured</label>
                    <div className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id="featured-filter"
                        checked={filters.featured}
                        onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded border-input text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="featured-filter" className="text-sm text-foreground">
                        Featured files only
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkDelete}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setShowBulkActions(false);
                  }}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Files Grid */}
        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No files found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.category !== 'all' || filters.featured 
                ? 'Try adjusting your filters or search terms.'
                : 'Upload your first file to get started.'
              }
            </p>
            {!filters.search && filters.category === 'all' && !filters.featured && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>Upload File</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {selectedFiles.length === filteredAndSortedFiles.length ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
                <span>
                  {selectedFiles.length === filteredAndSortedFiles.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
              
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredAndSortedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-teal-500 border-teal-500' : ''
                  }`}
                >
                  {/* File Preview */}
                  <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => handleSelectFile(file.id)}
                      className="absolute top-2 left-2 z-10 p-1 bg-white/90 dark:bg-black/90 rounded-md hover:bg-white dark:hover:bg-black transition-colors"
                    >
                      {selectedFiles.includes(file.id) ? (
                        <CheckSquare className="h-4 w-4 text-teal-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>

                    {/* Featured Star */}
                    {file.is_featured && (
                      <div className="absolute top-2 right-2 z-10">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      </div>
                    )}

                    {/* File Content */}
                    <div className="w-full h-full flex items-center justify-center">
                      {file.mime_type.startsWith('image/') ? (
                        <Image
                          src={file.blob_url}
                          alt={file.alt_text || file.original_name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="h-12 w-12 text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">
                            {file.file_extension.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                        {file.category}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-foreground text-sm mb-1 truncate">
                      {file.title || file.original_name}
                    </h3>
                    
                    <div className="text-xs text-muted-foreground space-y-1 mb-3">
                      <div>{formatFileSize(file.file_size)}</div>
                      <div>{formatDate(file.uploaded_at)}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(file)}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      
                      <a
                        href={file.blob_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                      </a>
                      
                      <a
                        href={file.blob_url}
                        download={file.original_name}
                        className="flex items-center justify-center p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                      </a>
                      
                      <button
                        onClick={() => handleDelete(file.id, file.original_name)}
                        className="flex items-center justify-center p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-foreground">Upload File</h2>
              <button
                onClick={resetUploadForm}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-teal-500 transition-colors"
              >
                {uploadPreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <Image
                        src={uploadPreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="max-w-full h-auto max-h-48 rounded-lg shadow-lg"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                    </p>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">
                        Drop files here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports images, documents, and other file types
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="*/*"
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alt Text / Title
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.alt_text}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Enter descriptive text for the file"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Display Title
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Optional display title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  >
                    <option value="general">General</option>
                    <option value="team-photos">Team Photos</option>
                    <option value="course-images">Course Images</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="company">Company</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 resize-none"
                    placeholder="Optional description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.tags}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Comma-separated tags"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="upload-featured"
                      checked={uploadFormData.is_featured}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-input text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="upload-featured" className="text-sm font-medium text-foreground">
                      Mark as featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Upload File</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && editingFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-foreground">Edit File</h2>
              <button
                onClick={resetEditForm}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* File Preview */}
              <div className="text-center">
                <div className="inline-block bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                  {editingFile.mime_type.startsWith('image/') ? (
                    <Image
                      src={editingFile.blob_url}
                      alt={editingFile.alt_text || editingFile.original_name}
                      width={200}
                      height={200}
                      className="max-w-full h-auto max-h-48 rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-2 p-8">
                      <FileText className="h-12 w-12 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {editingFile.file_extension.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {editingFile.original_name} ({formatFileSize(editingFile.file_size)})
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={editFormData.alt_text}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Enter descriptive text for the file"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Display Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Optional display title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  >
                    <option value="general">General</option>
                    <option value="team-photos">Team Photos</option>
                    <option value="course-images">Course Images</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="company">Company</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 resize-none"
                    placeholder="Optional description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Comma-separated tags"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-featured"
                      checked={editFormData.is_featured}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-input text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="edit-featured" className="text-sm font-medium text-foreground">
                      Mark as featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetEditForm}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

