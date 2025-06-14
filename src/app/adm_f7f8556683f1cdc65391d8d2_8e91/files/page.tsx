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
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

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

  // Edit form states (following courses pattern)
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

  // Upload form states (Phase 4A)
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

  // Organization states (Phase 3B)
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

  // Organization functions (Phase 3B)
  const filteredAndSortedFiles = useMemo(() => {
    const filtered = files.filter(file => {
      // Category filter
      if (filters.category !== 'all' && file.category !== filters.category) {
        return false;
      }
      
      // Featured filter
      if (filters.featured && !file.is_featured) {
        return false;
      }
      
      // Search filter
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

    // Sort files
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof FileItem] as string | number;
      let bValue: string | number = b[sortBy as keyof FileItem] as string | number;
      
      // Handle different data types
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

  // Upload form handlers (Phase 4A)
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
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    
    // Auto-populate alt text with filename
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
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    
    // Auto-populate alt text with filename
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
        loadData(); // Refresh the file list
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

  // Edit form handlers (following courses pattern)
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
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">File Management</h1>
                  <p className="text-sm text-muted-foreground">Upload and manage images and files</p>
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
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Upload File</span>
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
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Upload Form (Phase 4A) */}
        {showUploadForm && (
          <div className="bg-card border border-border rounded-2xl shadow-xl mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Upload New File</h2>
                <button
                  onClick={resetUploadForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              {/* File Selection Area */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select File *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-teal-500 transition-colors"
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      {uploadPreview ? (
                        <div className="flex justify-center">
                          <Image
                            src={uploadPreview}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="max-w-48 max-h-48 object-cover rounded-lg border border-border"
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadPreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center">
                          <Upload className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum file size: 15MB
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        accept="image/*"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alt Text (SEO) *
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.alt_text}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Descriptive alt text for accessibility"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="SEO-friendly title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    placeholder="Detailed description of the file content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.tags}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="upload_is_featured"
                      checked={uploadFormData.is_featured}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 bg-background border-border rounded focus:ring-teal-500"
                    />
                    <label htmlFor="upload_is_featured" className="text-sm font-medium text-foreground">
                      Mark as featured file
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="px-6 py-3 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-400 font-medium">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setShowBulkActions(false);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Delete Selected'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form (following courses pattern) */}
        {showEditForm && editingFile && (
          <div className="bg-card border border-border rounded-2xl shadow-xl mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Edit File Metadata</h2>
                <button
                  onClick={resetEditForm}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alt Text (SEO) *
                  </label>
                  <input
                    type="text"
                    value={editFormData.alt_text}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Descriptive alt text for accessibility"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="SEO-friendly title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    placeholder="Detailed description of the file content"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={editFormData.is_featured}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 bg-background border-border rounded focus:ring-teal-500"
                    />
                    <label htmlFor="is_featured" className="text-sm font-medium text-foreground">
                      Mark as featured file
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={resetEditForm}
                  className="px-6 py-3 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-card border border-border rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-bold text-foreground">
                  Files ({filteredAndSortedFiles.length} of {files.length})
                </h2>
                <div className="flex items-center space-x-2">
                  {Object.entries(categoryStats).map(([category, count]) => (
                    <span key={category} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(category)}`}>
                      {category.replace('-', ' ')}: {count}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Search files..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="general">General</option>
                    <option value="team-photos">Team Photos</option>
                    <option value="course-images">Course Images</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="company">Company</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="uploaded_at">Upload Date</option>
                      <option value="original_name">Name</option>
                      <option value="file_size">Size</option>
                      <option value="category">Category</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-border rounded-lg bg-background hover:bg-muted transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Options</label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 text-teal-600 bg-background border-border rounded focus:ring-teal-500"
                      />
                      <span className="text-sm">Featured only</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Files Table */}
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center space-x-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground"
                    >
                      {selectedFiles.length === filteredAndSortedFiles.length && filteredAndSortedFiles.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      <span>File</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredAndSortedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleSelectFile(file.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {selectedFiles.includes(file.id) ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center overflow-hidden">
                          {file.mime_type.startsWith('image/') ? (
                            <Image 
                              src={file.blob_url} 
                              alt={file.alt_text || file.original_name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover rounded-lg"
                              unoptimized={true}
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {file.original_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {file.filename}
                          </div>
                          {file.alt_text && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Alt: {file.alt_text.substring(0, 30)}{file.alt_text.length > 30 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-foreground">
                          {formatFileSize(file.file_size)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {file.mime_type}
                        </div>
                        {file.width && file.height && (
                          <div className="text-xs text-muted-foreground">
                            {file.width} × {file.height}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(file.category)}`}>
                        {file.category.replace('-', ' ')}
                      </span>
                      {file.is_featured && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(file.uploaded_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(file)}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="Edit file metadata"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <a
                          href={file.blob_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                          title="View file"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={file.blob_url}
                          download={file.original_name}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id, file.original_name)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAndSortedFiles.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-4 opacity-50">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground font-medium">
                  {filters.search || filters.category !== 'all' || filters.featured 
                    ? 'No files match your filters' 
                    : 'No files found'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {filters.search || filters.category !== 'all' || filters.featured 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Upload your first file to get started.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <span className="mr-1">📁</span>
                File Management
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="mr-1">🛡️</span>
                Secure Portal
              </span>
            </div>
            <p className="text-xs">
              Karma Training • File Management System
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

