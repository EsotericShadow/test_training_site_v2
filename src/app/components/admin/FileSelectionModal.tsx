// File Selection Modal Component
// This component provides a reusable file selection interface that matches your dashboard styling

'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Upload, Search, Grid, List, Image as ImageIcon, Star } from 'lucide-react';
import Image from 'next/image';

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

interface FileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: FileItem) => void;
  category?: string;
  title?: string;
  allowUpload?: boolean;
}

export default function FileSelectionModal({
  isOpen,
  onClose,
  onSelect,
  category = '',
  title = 'Select Image',
  allowUpload = true
}: FileSelectionModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Upload form state
  const [uploadFormData, setUploadFormData] = useState({
    alt_text: '',
    title: '',
    description: '',
    tags: '',
    category: category || 'general',
    is_featured: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const categories = [
    'general',
    'team-photos',
    'course-images', 
    'testimonials',
    'company',
    'hero-images',
    'certifications',
    'other'
  ];

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/files', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        let filteredFiles = data.files || [];
        
        // Filter by category if specified
        if (selectedCategory) {
          filteredFiles = filteredFiles.filter((file: FileItem) => 
            file.category === selectedCategory
          );
        }
        
        setFiles(filteredFiles);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
        const data = await response.json();
        setMessage('✓ File uploaded successfully');
        
        // Reset upload form
        setSelectedFile(null);
        setUploadPreview(null);
        setUploadFormData({
          alt_text: '',
          title: '',
          description: '',
          tags: '',
          category: category || 'general',
          is_featured: false
        });
        setShowUploadForm(false);
        
        // Reload files and auto-select the new file
        await loadFiles();
        
        // Find and select the newly uploaded file
        const newFile = {
          id: data.fileId,
          filename: data.filename,
          original_name: selectedFile.name,
          blob_url: data.fileUrl,
          alt_text: uploadFormData.alt_text,
          title: uploadFormData.title,
          description: uploadFormData.description,
          category: uploadFormData.category,
          is_featured: uploadFormData.is_featured,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          uploaded_at: new Date().toISOString()
        };
        
        onSelect(newFile);
        onClose();
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Controls */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            
            {/* View Mode */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Upload Button */}
            {allowUpload && (
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Upload Form */}
          {showUploadForm && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload New File</h3>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  message.includes('✓') 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                }`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                    required
                  />
                  
                  {uploadPreview && (
                    <div className="mt-3">
                      <Image 
                        src={uploadPreview} 
                        alt="Preview" 
                        width={128}
                        height={128}
                        className="object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
                
                {/* Metadata Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alt Text *
                    </label>
                    <input
                      type="text"
                      value={uploadFormData.alt_text}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={uploadFormData.title}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={uploadFormData.category}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={uploadFormData.tags}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Comma-separated tags"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={uploadFormData.is_featured}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mark as featured
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center space-x-2"
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

          {/* Files Grid/List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedCategory 
                    ? 'Try adjusting your search or category filter'
                    : 'Upload your first file to get started'
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                : 'space-y-3'
              }>
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onSelect(file)}
                    className={`cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 hover:shadow-lg ${
                      viewMode === 'grid' ? 'p-3' : 'p-4 flex items-center space-x-4'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                          {file.mime_type.startsWith('image/') ? (
                            <Image
                              src={file.blob_url}
                              alt={file.alt_text || file.original_name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {file.is_featured && (
                            <div className="absolute top-2 right-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.title || file.original_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.file_size)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {file.mime_type.startsWith('image/') ? (
                            <Image
                              src={file.blob_url}
                              alt={file.alt_text || file.original_name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.title || file.original_name}
                            </p>
                            {file.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {file.alt_text}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.file_size)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {file.category.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

