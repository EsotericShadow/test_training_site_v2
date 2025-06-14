// File Selection Button Component
// This component provides a reusable button that opens the file selection modal

'use client';

import { useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import FileSelectionModal from './FileSelectionModal';

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

interface FileSelectionButtonProps {
  value?: string; // Current image URL
  onChange: (url: string, file?: FileItem) => void;
  category?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  buttonClassName?: string;
  previewClassName?: string;
}

export default function FileSelectionButton({
  value = '',
  onChange,
  category = '',
  placeholder = 'No image selected',
  label = 'Image',
  required = false,
  className = '',
  buttonClassName = '',
  previewClassName = ''
}: FileSelectionButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleFileSelect = (file: FileItem) => {
    onChange(file.blob_url, file);
    setShowModal(false);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="space-y-3">
        {/* Current Image Preview */}
        {value && (
          <div className={`relative inline-block ${previewClassName}`}>
            <Image
              src={value}
              alt="Selected image"
              width={128}
              height={128}
              className="object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        {/* Selection Button */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${buttonClassName}`}
        >
          {value ? (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Change Image
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Select Image
            </>
          )}
        </button>
        
        {/* URL Input (hidden but functional for form compatibility) */}
        <input
          type="hidden"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        
        {!value && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {placeholder}
          </p>
        )}
      </div>

      {/* File Selection Modal */}
      <FileSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleFileSelect}
        category={category}
        title={`Select ${label}`}
        allowUpload={true}
      />
    </div>
  );
}

