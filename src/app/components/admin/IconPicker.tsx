'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { ChevronDown, Grip } from 'lucide-react';

// Define the props for the IconPicker component
interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

// Create a list of all available Lucide icon names, excluding aliases and specific icons
const iconNames = Object.keys(Icons)
  .filter(key => /^[A-Z]/.test(key)) // Filter for component names (PascalCase)
  .filter(key => key !== 'Icon' && key !== 'createLucideIcon'); // Exclude base/creator functions

// The main IconPicker component
export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Get the currently selected icon component
  const SelectedIcon = useMemo(() => {
    if (value && Icons[value as keyof typeof Icons]) {
      return Icons[value as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    }
    return null;
  }, [value]);

  // Filter the list of icons based on the search term
  const filteredIcons = useMemo(
    () =>
      iconNames.filter((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pickerRef]);

  return (
    <div className="relative w-full" ref={pickerRef}>
      {/* The button that opens the dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <div className="flex items-center space-x-3">
          {SelectedIcon ? (
            <SelectedIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <Grip className="w-5 h-5 text-gray-400" />
          )}
          <span className="font-medium">{value || 'Select an icon'}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* The dropdown menu */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg">
          {/* The search input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          {/* The grid of icons */}
          <div className="grid grid-cols-8 gap-2 p-4 max-h-72 overflow-y-auto">
            {filteredIcons.map((name) => {
              const Icon = Icons[name as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              return (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors ${
                    value === name
                      ? 'bg-yellow-100 dark:bg-yellow-900/50 ring-2 ring-yellow-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={name}
                >
                  <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}