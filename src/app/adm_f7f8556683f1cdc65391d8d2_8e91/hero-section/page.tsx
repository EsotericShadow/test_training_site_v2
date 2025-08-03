/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section/page.tsx
 * Description: This component provides an editor for managing the hero section content on the homepage.
 * Dependencies: React, Next.js, Lucide-React, Heroicons, FileSelectionButton
 * Created: 2025-06-08
 * Last Modified: 2025-08-02
 * Version: 1.0.5
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Home, BarChart3, Star } from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import FileSelectionButton from '../../components/admin/FileSelectionButton';

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

interface HeroSection {
  id?: number | undefined;
  slogan?: string | undefined;
  main_heading?: string | undefined;
  highlight_text?: string | undefined;
  subtitle?: string | undefined;
  background_image_url?: string | undefined;
  background_image_alt?: string | undefined;
  primary_button_text?: string | undefined;
  primary_button_link?: string | undefined;
  secondary_button_text?: string | undefined;
  secondary_button_link?: string | undefined;
}

interface HeroStat {
  id?: number | undefined;
  number_text?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  display_order?: number | undefined;
}

interface HeroFeature {
  id?: number | undefined;
  title?: string | undefined;
  description?: string | undefined;
  display_order?: number | undefined;
}

interface ResponseData {
  heroSection: HeroSection;
  heroStats: HeroStat[];
  heroFeatures: HeroFeature[];
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function HeroSectionEditor() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [heroSection, setHeroSection] = useState<HeroSection>({
    slogan: '',
    main_heading: '',
    highlight_text: '',
    subtitle: '',
    background_image_url: '',
    background_image_alt: '',
    primary_button_text: '',
    primary_button_link: '',
    secondary_button_text: '',
    secondary_button_link: ''
  });
  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);
  const [heroFeatures, setHeroFeatures] = useState<HeroFeature[]>([]);

  const loadHeroData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data: ResponseData = await response.json();
        
        setHeroSection({
          slogan: data.heroSection?.slogan || '',
          main_heading: data.heroSection?.main_heading || '',
          highlight_text: data.heroSection?.highlight_text || '',
          subtitle: data.heroSection?.subtitle || '',
          background_image_url: data.heroSection?.background_image_url || '',
          background_image_alt: data.heroSection?.background_image_alt || '',
          primary_button_text: data.heroSection?.primary_button_text || '',
          primary_button_link: data.heroSection?.primary_button_link || '',
          secondary_button_text: data.heroSection?.secondary_button_text || '',
          secondary_button_link: data.heroSection?.secondary_button_link || ''
        });

        setHeroStats(data.heroStats?.map((stat: HeroStat): HeroStat => ({
          id: stat.id ?? undefined,
          number_text: stat.number_text ?? '',
          label: stat.label ?? '',
          description: stat.description ?? '',
          display_order: stat.display_order ?? 0
        })) || []);

        setHeroFeatures(data.heroFeatures?.map((feature: HeroFeature): HeroFeature => ({
          id: feature.id ?? undefined,
          title: feature.title ?? '',
          description: feature.description ?? '',
          display_order: feature.display_order ?? 0
        })) || []);
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        setMessage('Failed to load hero section data');
      }
    } catch (error) {
      console.error('Error loading hero data:', error);
      setMessage('Failed to load hero section data');
    } finally {
      setLoading(false);
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
        loadHeroData();
      } else {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch {
      router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      return;
    }
  }, [router, loadHeroData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleBackgroundImageSelect = (url: string, file?: FileItem) => {
    setHeroSection(prev => ({
      ...prev,
      background_image_url: url,
      background_image_alt: file?.alt_text || file?.title || prev.background_image_alt
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          heroSection,
          heroStats,
          heroFeatures
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || 'Hero section updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        setMessage('Failed to update hero section');
      }
    } catch (error) {
      console.error('Error saving hero section:', error);
      setMessage('Error saving hero section');
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (index: number, field: keyof HeroStat, value: string | number) => {
    const newStats = [...heroStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setHeroStats(newStats);
  };

  const updateFeature = (index: number, field: keyof HeroFeature, value: string | number) => {
    const newFeatures = [...heroFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setHeroFeatures(newFeatures);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-white mb-2">Loading Hero Section</div>
          <div className="text-base text-gray-400">Please wait...</div>
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
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Hero Section</h1>
                  <p className="text-base text-gray-400">Manage homepage hero content and statistics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-2">
                <span className="text-base text-gray-400">{user?.username}</span>
                <div className="inline-flex items-center px-2 py-1 bg-blue-900/20 border border-blue-800 rounded-full text-sm text-blue-400">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                  Online
                </div>
              </div>
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

        <div className="space-y-10">
          {/* Hero Content */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Hero Content</h2>
              </div>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Company Slogan
                </label>
                <input
                  type="text"
                  value={heroSection.slogan || ''}
                  onChange={(e) => setHeroSection({...heroSection, slogan: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                  placeholder="We believe the choices you make today will define your tomorrow"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={heroSection.main_heading || ''}
                  onChange={(e) => setHeroSection({...heroSection, main_heading: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                  placeholder="Northwestern BC's Premier Workplace Safety Training"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Highlight Text <span className="text-sm text-gray-400">(will be colored yellow)</span>
                </label>
                <input
                  type="text"
                  value={heroSection.highlight_text || ''}
                  onChange={(e) => setHeroSection({...heroSection, highlight_text: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                  placeholder="Expert Safety Training"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Subtitle
                </label>
                <textarea
                  value={heroSection.subtitle || ''}
                  onChange={(e) => setHeroSection({...heroSection, subtitle: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                  placeholder="Comprehensive safety courses designed for mining, forestry, construction, and industrial workers..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSection.primary_button_text || ''}
                    onChange={(e) => setHeroSection({...heroSection, primary_button_text: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                    placeholder="View Our 14 Courses"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroSection.primary_button_link || ''}
                    onChange={(e) => setHeroSection({...heroSection, primary_button_link: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                    placeholder="/courses"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSection.secondary_button_text || ''}
                    onChange={(e) => setHeroSection({...heroSection, secondary_button_text: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                    placeholder="Contact Us"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroSection.secondary_button_link || ''}
                    onChange={(e) => setHeroSection({...heroSection, secondary_button_link: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                    placeholder="/contact"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-base font-semibold text-white">
                  Background Image
                </label>
                
                <FileSelectionButton
                  value={heroSection.background_image_url || ''}
                  onChange={handleBackgroundImageSelect}
                  category="hero-backgrounds"
                  label="Select Background Image"
                  placeholder="No background image selected"
                />

                <div className="space-y-3">
                  <label className="text-base font-medium text-gray-400">
                    Background Image Alt Text (for accessibility)
                  </label>
                  <input
                    type="text"
                    value={heroSection.background_image_alt || ''}
                    onChange={(e) => setHeroSection({...heroSection, background_image_alt: e.target.value})}
                    placeholder="e.g., Safety training in industrial workplace"
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                  />
                </div>

                {heroSection.background_image_url && (
                  <div className="mt-4 p-4 bg-gray-700 border border-gray-600 rounded-xl">
                    <div className="text-base font-medium text-white mb-2">Current Background:</div>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={heroSection.background_image_url}
                        alt={heroSection.background_image_alt || 'Hero background preview'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-700 pt-4">
                  <div className="text-base text-gray-400 mb-2">
                    Or enter background image URL directly:
                  </div>
                  <input
                    type="url"
                    value={heroSection.background_image_url || ''}
                    onChange={(e) => setHeroSection({...heroSection, background_image_url: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                    placeholder="/images/hero-bg.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Statistics */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Hero Statistics</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {heroStats.map((stat, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-700 border border-gray-600 rounded-xl">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Number/Text
                    </label>
                    <input
                      type="text"
                      value={stat.number_text || ''}
                      onChange={(e) => updateStat(index, 'number_text', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="500+"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="Students Trained"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Description
                    </label>
                    <input
                      type="text"
                      value={stat.description || ''}
                      onChange={(e) => updateStat(index, 'description', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="Across Northwestern BC"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={stat.display_order || 0}
                      onChange={(e) => updateStat(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Features */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Hero Features</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {heroFeatures.map((feature, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-700 border border-gray-600 rounded-xl">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Title
                    </label>
                    <input
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="Expert Instructors"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Description
                    </label>
                    <input
                      type="text"
                      value={feature.description || ''}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="Certified professionals with real-world experience"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={feature.display_order || 0}
                      onChange={(e) => updateFeature(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base"
                      placeholder="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-8 border-t border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:scale-100 disabled:cursor-not-allowed text-base"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Hero Section</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <span className="mr-1">🏠</span>
                Hero Section
              </span>
              <span>•</span>
              <span className="flex items-center">
                <span className="mr-1">🛡️</span>
                Secure Portal
              </span>
            </div>
            <p className="text-sm">
              Karma Training • Hero Section Management System
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