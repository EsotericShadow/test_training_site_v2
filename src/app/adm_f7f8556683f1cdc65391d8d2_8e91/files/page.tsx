
/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/adm_f7f8556683f1cdc65391d8d2_8e91/files/page.tsx
 * Description: Comprehensive File Management System for Karma Training Website CMS.
 * This component provides a full-featured file management interface allowing administrators
 * to upload, organize, edit, and manage media files and documents. Features include
 * drag-and-drop upload, advanced filtering and searching, bulk operations, file preview,
 * metadata editing, categorization, and responsive grid layout with detailed file information.
 *
 * Key Features:
 * - File upload with drag-and-drop support and preview
 * - Advanced filtering by category, featured status, and search terms
 * - Sorting by multiple criteria (date, name, size, category)
 * - Bulk selection and deletion operations
 * - In-place metadata editing (alt text, title, description, tags)
 * - File categorization and organization
 * - Image preview with fallback for non-image files
 * - Responsive grid layout with mobile-first design
 * - Real-time file statistics and category breakdown
 * - Authentication verification and session management
 * - Error handling and user feedback systems
 *
 * Dependencies:
 * - React (useState, useEffect, useCallback, useMemo hooks)
 * - Next.js (useRouter for navigation, Link for routing, Image for optimization)
 * - Lucide React (comprehensive icon set for UI elements)
 *
 * API Endpoints Used:
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/auth (authentication verification)
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/files (file listing and management)
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/upload (file upload with metadata)
 * - /api/adm_f7f8556683f1cdc65391d8d2_8e91/files/{id} (individual file operations)
 *
 * File Categories:
 * - general: Default category for miscellaneous files
 * - team-photos: Staff and team member photographs
 * - course-images: Training course related imagery
 * - testimonials: Client testimonial photos and media
 * - company: Corporate branding and company assets
 * - other: Uncategorized or special purpose files
 *
 * Created: 2025-06-14
 * Last Modified: 2025-08-02
 * Version: 1.0.6
 */

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

/**
 * @interface FileItem
 * @description Comprehensive file metadata structure containing all file information
 * and management properties used throughout the file management system.
 */
interface FileItem {
  id: number;                    // Unique file identifier
  filename: string;              // System-generated filename
  original_name: string;         // User's original filename
  file_size: number;            // File size in bytes
  mime_type: string;            // MIME type (e.g., 'image/jpeg', 'application/pdf')
  file_extension: string;       // File extension without dot
  blob_url: string;             // Public URL for file access
  width?: number;               // Image width in pixels (images only)
  height?: number;              // Image height in pixels (images only)
  alt_text?: string;            // Accessibility alt text
  title?: string;               // Display title
  description?: string;         // Detailed description
  tags?: string;                // Comma-separated tags for searching
  category: string;             // File category for organization
  folder_id?: number;           // Future folder organization support
  folder_name?: string;         // Future folder name display
  usage_count: number;          // Number of times file is referenced
  is_featured: boolean;         // Featured status for priority display
  uploaded_at: string;          // ISO timestamp of upload
  updated_at: string;           // ISO timestamp of last modification
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
 * @component FileManagement
 * @description Main file management component providing comprehensive file operations.
 * 
 * This component handles:
 * - Authentication verification and session management
 * - File upload with drag-and-drop support and metadata entry
 * - Advanced filtering and searching across multiple file properties
 * - Sorting by various criteria with ascending/descending options
 * - Bulk selection and operations for efficient file management
 * - In-place editing of file metadata and properties
 * - Responsive grid layout with image previews and file information
 * - Category-based organization with visual indicators
 * - Error handling and user feedback systems
 * - Real-time statistics and file categorization
 * 
 * @returns {JSX.Element} The complete file management interface
 */
export default function FileManagement() {
  // ============================================================================
  // HOOKS AND NAVIGATION
  // ============================================================================
  
  /**
   * @hook router - Next.js router for navigation and redirects
   */
  const router = useRouter();

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
   * @state files - Complete array of file items with metadata
   */
  const [files, setFiles] = useState<FileItem[]>([]);
  
  /**
   * @state message - User feedback messages for success/error notifications
   */
  const [message, setMessage] = useState('');

  /**
   * @state showEditForm - Controls visibility of file metadata editing modal
   */
  const [showEditForm, setShowEditForm] = useState(false);
  
  /**
   * @state editingFile - Currently selected file for editing operations
   */
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  
  /**
   * @state saving - Loading state for save operations (edit/upload)
   */
  const [saving, setSaving] = useState(false);

  /**
   * @state editFormData - Form data for file metadata editing
   */
  const [editFormData, setEditFormData] = useState({
    alt_text: '',
    title: '',
    description: '',
    tags: '',
    category: 'general',
    folder_id: '',
    is_featured: false
  });

  /**
   * @state showUploadForm - Controls visibility of file upload modal
   */
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  /**
   * @state uploading - Loading state for file upload operations
   */
  const [uploading, setUploading] = useState(false);
  
  /**
   * @state selectedFile - Currently selected file for upload
   */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  /**
   * @state uploadPreview - Preview URL for selected upload file (images only)
   */
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  /**
   * @state uploadFormData - Form data for new file upload with metadata
   */
  const [uploadFormData, setUploadFormData] = useState({
    alt_text: '',
    title: '',
    description: '',
    tags: '',
    category: 'general',
    is_featured: false
  });

  /**
   * @state filters - Current filter settings for file display
   */
  const [filters, setFilters] = useState({
    category: 'all',      // Category filter
    featured: false,      // Featured files only
    search: ''           // Text search across multiple fields
  });

  /**
   * @state sortBy - Current sorting field
   */
  const [sortBy, setSortBy] = useState('uploaded_at');
  
  /**
   * @state sortOrder - Current sorting direction (ascending/descending)
   */
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  /**
   * @state selectedFiles - Array of selected file IDs for bulk operations
   */
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  
  /**
   * @state showBulkActions - Controls visibility of bulk action controls
   */
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  /**
   * @state showFilters - Controls visibility of expanded filter panel
   */
  const [showFilters, setShowFilters] = useState(false);

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  /**
   * @function loadData
   * @description Loads all files from the API with error handling.
   * Fetches the complete file list with metadata and handles authentication errors.
   * Redirects to login if session is invalid.
   */
  const loadData = useCallback(async () => {
    try {
      const filesResponse = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files', {
        credentials: 'include' // Include authentication cookies
      });
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setFiles(filesData.files || []);
      } else if (filesResponse.status === 401) {
        // Session expired, redirect to login
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setMessage('Failed to load files');
    }
  }, [router]);

  /**
   * @function checkAuth
   * @description Verifies user authentication and loads initial data.
   * This function runs on component mount to ensure the user is authenticated
   * before displaying the file management interface.
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/auth', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        loadData(); // Load files after successful authentication
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
   * @effect Authentication Check
   * @description Runs authentication check on component mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ============================================================================
  // FILTERING AND SORTING LOGIC
  // ============================================================================

  /**
   * @computed filteredAndSortedFiles
   * @description Applies filters and sorting to the files array.
   * This memoized computation handles:
   * - Category filtering (all categories or specific category)
   * - Featured status filtering
   * - Text search across name, alt text, title, and tags
   * - Sorting by multiple criteria with proper type handling
   * - Performance optimization through memoization
   */
  const filteredAndSortedFiles = useMemo(() => {
    // Apply filters
    const filtered = files.filter(file => {
      // Category filter
      if (filters.category !== 'all' && file.category !== filters.category) {
        return false;
      }
      // Featured filter
      if (filters.featured && !file.is_featured) {
        return false;
      }
      // Text search across multiple fields
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

    // Apply sorting with proper type handling
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy as keyof FileItem] as string | number;
      let bValue: string | number = b[sortBy as keyof FileItem] as string | number;
      
      // Handle different data types for sorting
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
      
      // Apply sort order
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [files, filters, sortBy, sortOrder]);

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * @function handleSelectFile
   * @description Handles individual file selection for bulk operations.
   * Toggles file selection state and manages bulk actions visibility.
   * 
   * @param {number} fileId - ID of the file to toggle selection
   */
  const handleSelectFile = (fileId: number) => {
    setSelectedFiles(prev => {
      const newSelected = prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)  // Remove if already selected
        : [...prev, fileId];                // Add if not selected
      setShowBulkActions(newSelected.length > 0);
      return newSelected;
    });
  };

  /**
   * @function handleSelectAll
   * @description Handles select all/deselect all functionality.
   * Toggles between selecting all visible files and clearing selection.
   */
  const handleSelectAll = () => {
    if (selectedFiles.length === filteredAndSortedFiles.length) {
      // Deselect all
      setSelectedFiles([]);
      setShowBulkActions(false);
    } else {
      // Select all visible files
      const allIds = filteredAndSortedFiles.map(file => file.id);
      setSelectedFiles(allIds);
      setShowBulkActions(true);
    }
  };

  /**
   * @function handleBulkDelete
   * @description Handles bulk deletion of selected files.
   * Shows confirmation dialog, makes parallel delete requests,
   * and provides feedback on operation results.
   */
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    // Confirmation dialog with file count
    const confirmed = confirm(`Are you sure you want to delete ${selectedFiles.length} selected files? This action cannot be undone.`);
    if (!confirmed) return;

    setSaving(true);
    setMessage('');

    try {
      // Make parallel delete requests for better performance
      const deletePromises = selectedFiles.map(fileId => 
        fetch(`/api/adm_f7f8556683f1cdc65391d8d2_8e91/files/${fileId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.ok).length;
      
      // Provide feedback based on results
      if (successCount === selectedFiles.length) {
        setMessage(`✓ Successfully deleted ${successCount} files`);
      } else {
        setMessage(`Deleted ${successCount} of ${selectedFiles.length} files`);
      }
      
      // Reset selection and reload data
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

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * @function getCategoryStats
   * @description Calculates file count statistics by category.
   * Used for displaying category counts in filter dropdown.
   * 
   * @returns {Record<string, number>} Object mapping category names to file counts
   */
  const getCategoryStats = () => {
    const stats = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  // ============================================================================
  // UPLOAD FORM FUNCTIONS
  // ============================================================================

  /**
   * @function resetUploadForm
   * @description Resets the upload form to its initial state and closes the modal.
   * Clears all form data, selected file, and preview.
   */
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

  /**
   * @function handleFileSelect
   * @description Handles file selection from input field.
   * Processes the selected file, generates preview for images,
   * and auto-fills alt text from filename.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Generate preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    
    // Auto-generate alt text from filename if not already set
    if (!uploadFormData.alt_text) {
      setUploadFormData(prev => ({
        ...prev,
        alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
      }));
    }
  };

  /**
   * @function handleDragOver
   * @description Handles drag over events for drag-and-drop upload.
   * Prevents default behavior to enable drop functionality.
   * 
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * @function handleDrop
   * @description Handles file drop events for drag-and-drop upload.
   * Processes dropped files similar to file input selection.
   * 
   * @param {React.DragEvent} e - Drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file) return;
    setSelectedFile(file);
    
    // Generate preview for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
    
    // Auto-generate alt text from filename if not already set
    if (!uploadFormData.alt_text) {
      setUploadFormData(prev => ({
        ...prev,
        alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
      }));
    }
  };

  /**
   * @function handleUploadSubmit
   * @description Handles file upload form submission.
   * Creates FormData with file and metadata, uploads to server,
   * and provides user feedback on results.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setUploading(true);
    setMessage('');

    try {
      // Create FormData with file and metadata
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
        loadData(); // Refresh file list
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

  // ============================================================================
  // EDIT FORM FUNCTIONS
  // ============================================================================

  /**
   * @function resetEditForm
   * @description Resets the edit form to its initial state and closes the modal.
   */
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

  /**
   * @function handleEdit
   * @description Initializes the edit form with selected file's metadata.
   * Populates form fields with current file data and opens edit modal.
   * 
   * @param {FileItem} file - File to edit
   */
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

  /**
   * @function handleEditSubmit
   * @description Handles file metadata edit form submission.
   * Updates file metadata on server and provides user feedback.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
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
        loadData(); // Refresh file list
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

  // ============================================================================
  // DELETE FUNCTIONS
  // ============================================================================

  /**
   * @function handleDelete
   * @description Handles individual file deletion with confirmation.
   * Shows confirmation dialog and deletes file if confirmed.
   * 
   * @param {number} fileId - ID of file to delete
   * @param {string} fileName - Name of file for confirmation dialog
   */
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
        loadData(); // Refresh file list
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

  // ============================================================================
  // FORMATTING UTILITY FUNCTIONS
  // ============================================================================

  /**
   * @function formatFileSize
   * @description Formats file size in bytes to human-readable format.
   * Converts bytes to appropriate units (Bytes, KB, MB, GB).
   * 
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size string
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * @function formatDate
   * @description Formats ISO date string to user-friendly format.
   * 
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * @function getCategoryColor
   * @description Returns appropriate CSS classes for category badges.
   * Provides visual distinction between different file categories.
   * 
   * @param {string} category - File category
   * @returns {string} CSS classes for category styling
   */
  const getCategoryColor = (category: string) => {
    const colors = {
      'general': 'bg-gray-700 text-gray-300',
      'team-photos': 'bg-purple-900/30 text-purple-400',
      'course-images': 'bg-emerald-900/30 text-emerald-400',
      'testimonials': 'bg-orange-900/30 text-orange-400',
      'company': 'bg-blue-900/30 text-blue-400',
      'other': 'bg-slate-700 text-slate-300'
    };
    return colors[category as keyof typeof colors] || colors.general;
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-white mb-2">Loading Files</div>
          <div className="text-sm text-gray-400">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // Calculate category statistics for filter display
  const categoryStats = getCategoryStats();

  // ============================================================================
  // MAIN COMPONENT RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ========================================================================
          HEADER SECTION
          Contains navigation, branding, user info, and primary actions
      ======================================================================== */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            {/* Left side: Navigation and branding */}
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              {/* Back to Dashboard Link */}
              <Link 
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard"
                className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-600 transition-all duration-200 text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
              {/* Page Title and Icon */}
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white">File Management</h1>
                  <p className="text-sm text-gray-400">Manage your media files</p>
                </div>
              </div>
            </div>
            {/* Right side: User info and actions */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* User Information Display */}
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-400">{user.username}</span>
                  {/* Online Status Indicator */}
                  <div className="inline-flex items-center px-2 py-1 bg-green-900/20 border border-green-800 rounded-full text-sm text-green-400">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </div>
                </div>
              )}
              {/* Upload File Button */}
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Upload File</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ====================================================================
            SUCCESS/ERROR MESSAGES
            Displays user feedback for actions performed
        ==================================================================== */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border ${
            message.includes('✓') 
              ? 'bg-green-900/20 text-green-400 border-green-800' 
              : 'bg-red-900/20 text-red-400 border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-base">{message}</span>
            </div>
          </div>
        )}

        {/* ====================================================================
            FILTERS AND SEARCH PANEL
            Advanced filtering and search functionality
        ==================================================================== */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files by name, alt text, title, or tags..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filters Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 hover:bg-gray-600 hover:text-gray-100 transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span className="font-medium">Filters</span>
              </button>
            </div>

            {/* Expanded Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">All Categories</option>
                      {Object.entries(categoryStats).map(([category, count]) => (
                        <option key={category} value={category}>
                          {category} ({count})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort By Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="uploaded_at">Upload Date</option>
                      <option value="original_name">Name</option>
                      <option value="file_size">Size</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                  
                  {/* Sort Order Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Order</label>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                  </div>
                  
                  {/* Featured Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Featured</label>
                    <div className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id="featured-filter"
                        checked={filters.featured}
                        onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded border-gray-600 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="featured-filter" className="text-sm text-white">
                        Featured files only
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================
            BULK ACTIONS PANEL
            Displays when files are selected for bulk operations
        ==================================================================== */}
        {showBulkActions && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-sm font-medium text-blue-400">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-3">
                {/* Bulk Delete Button */}
                <button
                  onClick={handleBulkDelete}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected</span>
                </button>
                {/* Cancel Selection Button */}
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setShowBulkActions(false);
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            FILES GRID OR EMPTY STATE
            Main content area displaying files or empty state message
        ==================================================================== */}
        {filteredAndSortedFiles.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No files found</h3>
            <p className="text-gray-400 mb-4">
              {filters.search || filters.category !== 'all' || filters.featured 
                ? 'Try adjusting your filters or search terms.'
                : 'Upload your first file to get started.'
              }
            </p>
            {/* Show upload button only if no filters are active */}
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
          /* Files Grid */
          <>
            {/* Select All Controls */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
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
              
              {/* File Count Display */}
              <span className="text-sm text-gray-400">
                {filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Responsive Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredAndSortedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 ${
                    selectedFiles.includes(file.id) ? 'ring-2 ring-teal-500 border-teal-500' : ''
                  }`}
                >
                  {/* File Preview Section */}
                  <div className="relative aspect-square bg-gray-700">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => handleSelectFile(file.id)}
                      className="absolute top-2 left-2 z-10 p-1 bg-black/90 rounded-md hover:bg-black transition-colors"
                    >
                      {selectedFiles.includes(file.id) ? (
                        <CheckSquare className="h-4 w-4 text-teal-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    {/* Featured Star Indicator */}
                    {file.is_featured && (
                      <div className="absolute top-2 right-2 z-10">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      </div>
                    )}

                    {/* File Content Display */}
                    <div className="w-full h-full flex items-center justify-center">
                      {file.mime_type.startsWith('image/') ? (
                        /* Image Preview */
                        <Image
                          src={file.blob_url}
                          alt={file.alt_text || file.original_name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        /* Non-image File Icon */
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">
                            {file.file_extension.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Information Section */}
                  <div className="p-4">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                        {file.category}
                      </span>
                    </div>
                    
                    {/* File Title */}
                    <h3 className="font-semibold text-white text-sm mb-1 truncate">
                      {file.title || file.original_name}
                    </h3>
                    
                    {/* File Metadata */}
                    <div className="text-xs text-gray-400 space-y-1 mb-3">
                      <div>{formatFileSize(file.file_size)}</div>
                      <div>{formatDate(file.uploaded_at)}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      {/* View/Download Button */}
                      <a
                        href={file.blob_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </a>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(file)}
                        className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(file.id, file.original_name)}
                        className="flex-1 inline-flex items-center justify-center px-2 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ======================================================================
          UPLOAD FORM MODAL
          Modal form for uploading new files with metadata
      ====================================================================== */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Upload File</h2>
              <button
                onClick={resetUploadForm}
                className="p-2 text-gray-400 hover:bg-gray-600 hover:text-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              {/* File Selection Area */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select File
                </label>
                
                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-teal-500 transition-colors"
                >
                  {selectedFile ? (
                    /* File Selected State */
                    <div className="space-y-4">
                      {uploadPreview ? (
                        /* Image Preview */
                        <div className="flex justify-center">
                          <Image
                            src={uploadPreview}
                            alt="Upload preview"
                            width={200}
                            height={200}
                            className="max-w-full h-auto max-h-48 rounded-lg shadow-lg"
                          />
                        </div>
                      ) : (
                        /* Non-image File Icon */
                        <div className="flex justify-center">
                          <FileText className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      {/* Change File Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadPreview(null);
                        }}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Change File</span>
                      </button>
                    </div>
                  ) : (
                    /* File Selection State */
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-white font-medium mb-2">
                          Drag and drop a file here, or click to select
                        </p>
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                          accept="image/*,application/pdf,.doc,.docx,.txt"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors font-semibold"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Choose File</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-400">
                        Supported formats: Images, PDF, DOC, DOCX, TXT
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alt Text Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Alt Text *
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.alt_text}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Enter descriptive text for the file"
                    required
                  />
                </div>

                {/* Display Title Field */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Display Title
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Optional display title"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  >
                    <option value="general">General</option>
                    <option value="team-photos">Team Photos</option>
                    <option value="course-images">Course Images</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="company">Company</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 resize-none"
                    placeholder="Optional description"
                  />
                </div>

                {/* Tags Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.tags}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Comma-separated tags"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="upload-featured"
                      checked={uploadFormData.is_featured}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-gray-600 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="upload-featured" className="text-sm font-medium text-white">
                      Mark as featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
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
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          EDIT FORM MODAL
          Modal form for editing file metadata
      ====================================================================== */}
      {showEditForm && editingFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Edit File</h2>
              <button
                onClick={resetEditForm}
                className="p-2 text-gray-400 hover:bg-gray-600 hover:text-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* File Preview Section */}
              <div className="text-center">
                <div className="inline-block bg-gray-700 rounded-xl p-4">
                  {editingFile.mime_type.startsWith('image/') ? (
                    /* Image Preview */
                    <Image
                      src={editingFile.blob_url}
                      alt={editingFile.alt_text || editingFile.original_name}
                      width={200}
                      height={200}
                      className="max-w-full h-auto max-h-48 rounded-lg shadow-lg"
                    />
                  ) : (
                    /* Non-image File Icon */
                    <div className="flex flex-col items-center space-y-2 p-8">
                      <FileText className="h-12 w-12 text-gray-400" />
                      <span className="text-sm font-medium text-gray-400">
                        {editingFile.file_extension.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {editingFile.original_name} ({formatFileSize(editingFile.file_size)})
                </p>
              </div>

              {/* Edit Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alt Text Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={editFormData.alt_text}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Enter descriptive text for the file"
                  />
                </div>

                {/* Display Title Field */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Display Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Optional display title"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  >
                    <option value="general">General</option>
                    <option value="team-photos">Team Photos</option>
                    <option value="course-images">Course Images</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="company">Company</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 resize-none"
                    placeholder="Optional description"
                  />
                </div>

                {/* Tags Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    placeholder="Comma-separated tags"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-featured"
                      checked={editFormData.is_featured}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-gray-600 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="edit-featured" className="text-sm font-medium text-white">
                      Mark as featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
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
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
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


//   ___________       *Written and developed by Gabriel Lacroix*       __              __      ___.
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