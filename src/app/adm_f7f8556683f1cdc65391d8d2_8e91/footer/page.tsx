'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Folder, Link as LinkIcon, Award, Shield } from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface FooterContent {
  id?: number;
  company_name?: string;
  tagline?: string;
  slogan?: string;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  logo_url?: string;
  logo_alt?: string;
  copyright_text?: string;
  tagline_bottom?: string;
}

interface FooterStat {
  id?: number;
  number_text?: string;
  label?: string;
  display_order?: number;
}

interface FooterQuickLink {
  id?: number;
  title?: string;
  url?: string;
  display_order?: number;
  is_active?: boolean;
}

interface FooterCertification {
  id?: number;
  title?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

interface FooterBottomBadge {
  id?: number;
  title?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

interface ResponseData {
  footerContent: FooterContent;
  footerStats: FooterStat[];
  footerQuickLinks: FooterQuickLink[];
  footerCertifications: FooterCertification[];
  footerBottomBadges: FooterBottomBadge[];
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function FooterEditor() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [footerContent, setFooterContent] = useState<FooterContent>({
    company_name: '',
    tagline: '',
    slogan: '',
    description: '',
    phone: '',
    email: '',
    location: '',
    logo_url: '',
    logo_alt: '',
    copyright_text: '',
    tagline_bottom: ''
  });
  const [footerStats, setFooterStats] = useState<FooterStat[]>([]);
  const [footerQuickLinks, setFooterQuickLinks] = useState<FooterQuickLink[]>([]);
  const [footerCertifications, setFooterCertifications] = useState<FooterCertification[]>([]);
  const [footerBottomBadges, setFooterBottomBadges] = useState<FooterBottomBadge[]>([]);

  const loadFooterData = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data: ResponseData = await response.json();
        
        setFooterContent({
          id: data.footerContent?.id ?? 0,
          company_name: data.footerContent?.company_name || '',
          tagline: data.footerContent?.tagline || '',
          slogan: data.footerContent?.slogan || '',
          description: data.footerContent?.description || '',
          phone: data.footerContent?.phone || '',
          email: data.footerContent?.email || '',
          location: data.footerContent?.location || '',
          logo_url: data.footerContent?.logo_url || '',
          logo_alt: data.footerContent?.logo_alt || '',
          copyright_text: data.footerContent?.copyright_text || '',
          tagline_bottom: data.footerContent?.tagline_bottom || ''
        });

        setFooterStats(data.footerStats?.map((stat: FooterStat): FooterStat => ({
          ...(stat.id && { id: stat.id }),
          number_text: stat.number_text || '',
          label: stat.label || '',
          display_order: stat.display_order || 0
        })) || []);

        setFooterQuickLinks(data.footerQuickLinks?.map((link: FooterQuickLink): FooterQuickLink => ({
          ...(link.id && { id: link.id }),
          title: link.title || '',
          url: link.url || '',
          display_order: link.display_order || 0,
          is_active: link.is_active !== false
        })) || []);

        setFooterCertifications(data.footerCertifications?.map((cert: FooterCertification): FooterCertification => ({
          ...(cert.id && { id: cert.id }),
          title: cert.title || '',
          icon: cert.icon || 'Award',
          display_order: cert.display_order || 0,
          is_active: cert.is_active !== false
        })) || []);

        setFooterBottomBadges(data.footerBottomBadges?.map((badge: FooterBottomBadge): FooterBottomBadge => ({
          ...(badge.id && { id: badge.id }),
          title: badge.title || '',
          icon: badge.icon || 'Award',
          display_order: badge.display_order || 0,
          is_active: badge.is_active !== false
        })) || []);

      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        setMessage('Failed to load footer data');
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
      setMessage('Failed to load footer data');
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
        loadFooterData();
      } else {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch {
      router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      return;
    }
  }, [router, loadFooterData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/footer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          footerContent,
          footerStats,
          footerQuickLinks,
          footerCertifications,
          footerBottomBadges
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message || 'Footer updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        setMessage('Failed to update footer');
      }
    } catch (error) {
      console.error('Error saving footer:', error);
      setMessage('Error saving footer');
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (index: number, field: keyof FooterStat, value: string | number) => {
    const newStats = [...footerStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setFooterStats(newStats);
  };

  const updateQuickLink = (index: number, field: keyof FooterQuickLink, value: string | number | boolean) => {
    const newLinks = [...footerQuickLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterQuickLinks(newLinks);
  };

  const updateCertification = (index: number, field: keyof FooterCertification, value: string | number | boolean) => {
    const newCerts = [...footerCertifications];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setFooterCertifications(newCerts);
  };

  const updateBottomBadge = (index: number, field: keyof FooterBottomBadge, value: string | number | boolean) => {
    const newBadges = [...footerBottomBadges];
    newBadges[index] = { ...newBadges[index], [field]: value };
    setFooterBottomBadges(newBadges);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-foreground mb-2">Loading Footer Content</div>
          <div className="text-base text-muted-foreground">Please wait...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <Link 
                href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard"
                className="inline-flex items-center space-x-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 text-base"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-xl shadow-lg">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Footer Content</h1>
                  <p className="text-base text-muted-foreground">Manage footer information</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-2">
                <span className="text-base text-muted-foreground">{user?.username}</span>
                <div className="inline-flex items-center px-2 py-1 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1 animate-pulse"></div>
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
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-6 h-6" />
              <span className="font-medium text-base">{message}</span>
            </div>
          </div>
        )}

        <div className="space-y-10">
          {/* Company Information */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <Folder className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Company Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={footerContent.company_name || ''}
                    onChange={(e) => setFooterContent({...footerContent, company_name: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="Karma Training"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={footerContent.tagline || ''}
                    onChange={(e) => setFooterContent({...footerContent, tagline: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="Industrial Safety Northwestern BC"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Company Slogan
                  </label>
                  <input
                    type="text"
                    value={footerContent.slogan || ''}
                    onChange={(e) => setFooterContent({...footerContent, slogan: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="We believe the choices you make today will define your tomorrow"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Description
                  </label>
                  <textarea
                    value={footerContent.description || ''}
                    onChange={(e) => setFooterContent({...footerContent, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="Karma Training is Northwestern British Columbia's premier provider of workplace safety training..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={footerContent.phone || ''}
                    onChange={(e) => setFooterContent({...footerContent, phone: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="250-615-3727"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={footerContent.email || ''}
                    onChange={(e) => setFooterContent({...footerContent, email: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="info@karmatraining.ca"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    value={footerContent.location || ''}
                    onChange={(e) => setFooterContent({...footerContent, location: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="Prince George, BC"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={footerContent.logo_url || ''}
                    onChange={(e) => setFooterContent({...footerContent, logo_url: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="/images/logo.png"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Logo Alt Text
                  </label>
                  <input
                    type="text"
                    value={footerContent.logo_alt || ''}
                    onChange={(e) => setFooterContent({...footerContent, logo_alt: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="Karma Training Logo"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={footerContent.copyright_text || ''}
                    onChange={(e) => setFooterContent({...footerContent, copyright_text: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="© 2024 Karma Training. All rights reserved."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-foreground">
                    Bottom Tagline
                  </label>
                  <input
                    type="text"
                    value={footerContent.tagline_bottom || ''}
                    onChange={(e) => setFooterContent({...footerContent, tagline_bottom: e.target.value})}
                    className="w-full px-4 py-4 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                    placeholder="Building safer workplaces, one training at a time"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Statistics */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Footer Statistics</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {footerStats.map((stat, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-background border border-input rounded-xl">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Number/Text
                    </label>
                    <input
                      type="text"
                      value={stat.number_text || ''}
                      onChange={(e) => updateStat(index, 'number_text', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="500+"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="Students Trained"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={stat.display_order || 0}
                      onChange={(e) => updateStat(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Quick Links</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {footerQuickLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-background border border-input rounded-xl">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Title
                    </label>
                    <input
                      type="text"
                      value={link.title || ''}
                      onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="About Us"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      URL
                    </label>
                    <input
                      type="text"
                      value={link.url || ''}
                      onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="/about"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={link.display_order || 0}
                      onChange={(e) => updateQuickLink(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Active
                    </label>
                    <div className="flex items-center h-14">
                      <input
                        type="checkbox"
                        checked={link.is_active !== false}
                        onChange={(e) => updateQuickLink(index, 'is_active', e.target.checked)}
                        className="w-5 h-5 text-slate-600 bg-background border-input rounded focus:ring-slate-500 focus:ring-2"
                      />
                      <span className="ml-2 text-base text-muted-foreground">Show link</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Certifications</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {footerCertifications.map((cert, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-background border border-input rounded-xl">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Title
                    </label>
                    <input
                      type="text"
                      value={cert.title || ''}
                      onChange={(e) => updateCertification(index, 'title', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="WorkSafeBC Approved"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={cert.icon || ''}
                      onChange={(e) => updateCertification(index, 'icon', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="Award"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={cert.display_order || 0}
                      onChange={(e) => updateCertification(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Active
                    </label>
                    <div className="flex items-center h-14">
                      <input
                        type="checkbox"
                        checked={cert.is_active !== false}
                        onChange={(e) => updateCertification(index, 'is_active', e.target.checked)}
                        className="w-5 h-5 text-slate-600 bg-background border-input rounded focus:ring-slate-500 focus:ring-2"
                      />
                      <span className="ml-2 text-base text-muted-foreground">Show certification</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Badges */}
          <div className="bg-card border border-border rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Bottom Badges</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {footerBottomBadges.map((badge, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-background border border-input rounded-xl">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Title
                    </label>
                    <input
                      type="text"
                      value={badge.title || ''}
                      onChange={(e) => updateBottomBadge(index, 'title', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="Certified Training Provider"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={badge.icon || ''}
                      onChange={(e) => updateBottomBadge(index, 'icon', e.target.value)}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="Award"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={badge.display_order || 0}
                      onChange={(e) => updateBottomBadge(index, 'display_order', parseInt(e.target.value))}
                      className="w-full px-4 py-4 bg-card border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-base"
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-foreground">
                      Active
                    </label>
                    <div className="flex items-center h-14">
                      <input
                        type="checkbox"
                        checked={badge.is_active !== false}
                        onChange={(e) => updateBottomBadge(index, 'is_active', e.target.checked)}
                        className="w-5 h-5 text-slate-600 bg-background border-input rounded focus:ring-slate-500 focus:ring-2"
                      />
                      <span className="ml-2 text-base text-muted-foreground">Show badge</span>
                    </div>
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
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none text-base"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Footer Content'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}