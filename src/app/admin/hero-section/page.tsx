'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeroSection {
  id?: number | undefined;
  slogan?: string | undefined;
  main_heading?: string | undefined;
  highlight_text?: string | undefined;
  subtitle?: string | undefined;
  background_image?: string | undefined;
  primary_button_text?: string | undefined;
  primary_button_link?: string | undefined;
  secondary_button_text?: string | undefined;
  secondary_button_link?: string | undefined;
}

interface HeroStat {
  id?: number | undefined;
  number_text?: string | undefined;  // Fixed: was 'number', now 'number_text'
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

export default function HeroSectionEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [heroSection, setHeroSection] = useState<HeroSection>({
    slogan: '',
    main_heading: '',
    highlight_text: '',
    subtitle: '',
    background_image: '',
    primary_button_text: '',
    primary_button_link: '',
    secondary_button_text: '',
    secondary_button_link: ''
  });
  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);
  const [heroFeatures, setHeroFeatures] = useState<HeroFeature[]>([]);
  const router = useRouter();

  const loadHeroData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/hero-section', {
        credentials: 'include' // Include cookies in the request
      });
      
      if (response.ok) {
        const data: ResponseData = await response.json();
        
        setHeroSection({
          slogan: data.heroSection?.slogan || '',
          main_heading: data.heroSection?.main_heading || '',
          highlight_text: data.heroSection?.highlight_text || '',
          subtitle: data.heroSection?.subtitle || '',
          background_image: data.heroSection?.background_image || '',
          primary_button_text: data.heroSection?.primary_button_text || '',
          primary_button_link: data.heroSection?.primary_button_link || '',
          secondary_button_text: data.heroSection?.secondary_button_text || '',
          secondary_button_link: data.heroSection?.secondary_button_link || ''
        });

        setHeroStats(data.heroStats?.map((stat: HeroStat): HeroStat => ({
          id: stat.id ?? undefined,
          number_text: stat.number_text ?? '',  // Fixed: was 'number', now 'number_text'
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
        router.push('/admin');
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
      const response = await fetch('/api/admin/auth');
      if (!response.ok) {
        router.push('/admin');
        return;
      }
      loadHeroData();
    } catch {
      router.push('/admin');
    }
  }, [router, loadHeroData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/hero-section', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
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
        router.push('/admin');
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading hero section...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Hero Section</h1>
              <p className="text-sm text-gray-600">Manage homepage hero content and statistics</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Hero Section Content</h2>
          </div>
          <div className="p-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-md ${message.includes('successfully') || message.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Slogan
                </label>
                <input
                  type="text"
                  value={heroSection.slogan || ''}
                  onChange={(e) => setHeroSection({...heroSection, slogan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="We believe the choices you make today will define your tomorrow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={heroSection.main_heading || ''}
                  onChange={(e) => setHeroSection({...heroSection, main_heading: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Northwestern BC's Premier Workplace Safety Training"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlight Text (will be colored yellow)
                </label>
                <input
                  type="text"
                  value={heroSection.highlight_text || ''}
                  onChange={(e) => setHeroSection({...heroSection, highlight_text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Expert Safety Training"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <textarea
                  value={heroSection.subtitle || ''}
                  onChange={(e) => setHeroSection({...heroSection, subtitle: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comprehensive safety courses designed for mining, forestry, construction, and industrial workers..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSection.primary_button_text || ''}
                    onChange={(e) => setHeroSection({...heroSection, primary_button_text: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="View Our 14 Courses"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroSection.primary_button_link || ''}
                    onChange={(e) => setHeroSection({...heroSection, primary_button_link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/courses"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSection.secondary_button_text || ''}
                    onChange={(e) => setHeroSection({...heroSection, secondary_button_text: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact Us"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroSection.secondary_button_link || ''}
                    onChange={(e) => setHeroSection({...heroSection, secondary_button_link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/contact"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={heroSection.background_image || ''}
                  onChange={(e) => setHeroSection({...heroSection, background_image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/hero-background.jpg"
                />
              </div>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {heroStats.map((stat, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Statistic {index + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number
                        </label>
                        <input
                          type="text"
                          value={stat.number_text || ''}
                          onChange={(e) => updateStat(index, 'number_text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="14+"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={stat.label || ''}
                          onChange={(e) => updateStat(index, 'label', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Safety Courses"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={stat.description || ''}
                          onChange={(e) => updateStat(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Comprehensive training programs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {heroFeatures.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Feature {index + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={feature.title || ''}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="WorkSafeBC Compliant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={feature.description || ''}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="All courses meet provincial safety standards"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium"
              >
                {saving ? 'Saving...' : 'Save Hero Section'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

