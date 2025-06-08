'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Home, BarChart3, Star } from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

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
    background_image: '',
    primary_button_text: '',
    primary_button_link: '',
    secondary_button_text: '',
    secondary_button_link: ''
  });
  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);
  const [heroFeatures, setHeroFeatures] = useState<HeroFeature[]>([]);

  const loadHeroData = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section', {
        credentials: 'include'
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

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/hero-section', {
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-foreground mb-2">Loading Hero Section</div>
          <div className="text-sm text-muted-foreground">Please wait...</div>
        </div>
      </div>
    );
  }

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
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Hero Section</h1>
                  <p className="text-sm text-muted-foreground">Manage homepage hero content and statistics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
                <div className="inline-flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs text-blue-600 dark:text-blue-400">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                  Online
                </div>
              </div>
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

        <div className="space-y-8">
          {/* Hero Content */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Hero Content</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Company Slogan
                </label>
                <input
                  type="text"
                  value={heroSection.slogan || ''}
                  onChange={(e) => setHeroSection({...heroSection, slogan: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="We believe the choices you make today will define your tomorrow"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={heroSection.main_heading || ''}
                  onChange={(e) => setHeroSection({...heroSection, main_heading: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Northwestern BC's Premier Workplace Safety Training"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Highlight Text <span className="text-xs text-muted-foreground">(will be colored yellow)</span>
                </label>
                <input
                  type="text"
                  value={heroSection.highlight_text || ''}
                  onChange={(e) => setHeroSection({...heroSection, highlight_text: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Expert Safety Training"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Subtitle
                </label>
                <textarea
                  value={heroSection.subtitle || ''}
                  onChange={(e) => setHeroSection({...heroSection, subtitle: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Comprehensive safety courses designed for mining, forestry, construction, and industrial workers..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSection.primary_button_text || ''}
                    onChange={(e) => setHeroSection({...heroSection, primary_button_text: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="View Our 14 Courses"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroSection.primary_button_link || ''}
                    onChange={(e) => setHeroSection({...heroSection, primary_button_link: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="/courses"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSection.secondary_button_text || ''}
                    onChange={(e) => setHeroSection({...heroSection, secondary_button_text: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Contact Us"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={heroSection.secondary_button_link || ''}
                    onChange={(e) => setHeroSection({...heroSection, secondary_button_link: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="/contact"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={heroSection.background_image || ''}
                  onChange={(e) => setHeroSection({...heroSection, background_image: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="/images/hero-bg.jpg"
                />
              </div>
            </div>
          </div>

          {/* Hero Statistics */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Hero Statistics</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {heroStats.map((stat, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-background border border-input rounded-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Number/Text
                    </label>
                    <input
                      type="text"
                      value={stat.number_text || ''}
                      onChange={(e) => updateStat(index, 'number_text', e.target.value)}
                      className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="500+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Students Trained"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Description
                    </label>
                    <input
                      type="text"
                      value={stat.description || ''}
                      onChange={(e) => updateStat(index, 'description', e.target.value)}
                      className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Across Northwestern BC"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={stat.display_order || 0}
                      onChange={(e) => updateStat(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Features */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Hero Features</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {heroFeatures.map((feature, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background border border-input rounded-xl">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Title
                    </label>
                    <input
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Expert Instructors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Description
                    </label>
                    <input
                      type="text"
                      value={feature.description || ''}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Certified professionals with real-world experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={feature.display_order || 0}
                      onChange={(e) => updateFeature(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Hero Section'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

