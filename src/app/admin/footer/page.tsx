'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

export default function FooterEditor() {
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
  const router = useRouter();

  const loadFooterData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/footer', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data: ResponseData = await response.json();
        
        setFooterContent({
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
        router.push('/admin');
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
      const response = await fetch('/api/admin/auth');
      if (!response.ok) {
        router.push('/admin');
        return;
      }
      loadFooterData();
    } catch {
      router.push('/admin');
    }
  }, [router, loadFooterData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/footer', {
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
        router.push('/admin');
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading footer content...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Footer Content</h1>
              <p className="text-sm text-gray-600">Manage footer information, links, and certifications</p>
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

      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Footer Content Management</h2>
          </div>
          
          <div className="p-6 space-y-8">
            {message && (
              <div className={`p-4 rounded-md ${message.includes('successfully') || message.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            {/* Company Information */}
            <div className="border-b pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={footerContent.company_name || ''}
                    onChange={(e) => setFooterContent({...footerContent, company_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Karma Training"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={footerContent.tagline || ''}
                    onChange={(e) => setFooterContent({...footerContent, tagline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Industrial Safety Northwestern BC"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Slogan
                  </label>
                  <input
                    type="text"
                    value={footerContent.slogan || ''}
                    onChange={(e) => setFooterContent({...footerContent, slogan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="We believe the choices you make today will define your tomorrow"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={footerContent.description || ''}
                    onChange={(e) => setFooterContent({...footerContent, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Karma Training is Northwestern British Columbia's premier provider of workplace safety training..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={footerContent.phone || ''}
                    onChange={(e) => setFooterContent({...footerContent, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="250-615-3727"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={footerContent.email || ''}
                    onChange={(e) => setFooterContent({...footerContent, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="info@karmatraining.ca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={footerContent.location || ''}
                    onChange={(e) => setFooterContent({...footerContent, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Northwestern British Columbia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={footerContent.logo_url || ''}
                    onChange={(e) => setFooterContent({...footerContent, logo_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/assets/logos/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={footerContent.copyright_text || ''}
                    onChange={(e) => setFooterContent({...footerContent, copyright_text: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="© 2025 Karma Training. All rights reserved."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bottom Tagline
                  </label>
                  <input
                    type="text"
                    value={footerContent.tagline_bottom || ''}
                    onChange={(e) => setFooterContent({...footerContent, tagline_bottom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Professional Safety Training for Northwestern BC"
                  />
                </div>
              </div>
            </div>

            {/* Footer Statistics */}
            <div className="border-b pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Footer Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {footerStats.map((stat, index) => (
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
                          placeholder="2017"
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
                          placeholder="Established"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-b pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {footerQuickLinks.map((link, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Link {index + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={link.title || ''}
                          onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="About Us"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <input
                          type="text"
                          value={link.url || ''}
                          onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="/about"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={link.is_active !== false}
                          onChange={(e) => updateQuickLink(index, 'is_active', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Active</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="border-b pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {footerCertifications.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Certification {index + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={cert.title || ''}
                          onChange={(e) => updateCertification(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Certificate of Completion"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon (Lucide icon name)
                        </label>
                        <input
                          type="text"
                          value={cert.icon || ''}
                          onChange={(e) => updateCertification(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Award"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={cert.is_active !== false}
                          onChange={(e) => updateCertification(index, 'is_active', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Active</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Badges */}
            <div className="pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bottom Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {footerBottomBadges.map((badge, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Badge {index + 1}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={badge.title || ''}
                          onChange={(e) => updateBottomBadge(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="WorkSafeBC Compliant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon (Lucide icon name)
                        </label>
                        <input
                          type="text"
                          value={badge.icon || ''}
                          onChange={(e) => updateBottomBadge(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Award"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={badge.is_active !== false}
                          onChange={(e) => updateBottomBadge(index, 'is_active', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Active</label>
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
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Footer Content'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

