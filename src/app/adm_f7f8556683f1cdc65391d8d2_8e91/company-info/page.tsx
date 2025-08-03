/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: page.tsx
 * Description: To be filled in with the script's purpose
 * Dependencies: To be filled in with key dependencies or modules
 * Created: August 2, 2025
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */
'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building2, Users } from 'lucide-react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
const IconPicker = dynamic(() => import('../../components/admin/IconPicker'), { ssr: false });

interface CompanyInfo {
  id?: number | undefined;
  company_name: string;
  slogan: string;
  description: string;
  mission: string;
  total_experience: number;
  students_trained_count: number;
  established_year: number;
  total_courses: number;
}

interface CompanyValue {
  id?: number | undefined;
  title?: string | undefined;
  description?: string | undefined;
  icon?: string | undefined;
  display_order?: number | undefined;
}

interface WhyChooseUsItem {
  id?: number | undefined;
  point: string;
  display_order?: number | undefined;
}

interface ResponseData {
  companyInfo: CompanyInfo;
  companyValues: CompanyValue[];
  whyChooseUs: WhyChooseUsItem[];
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function CompanyInfoEditor() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCompanyData = useCallback(async () => {
    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info', {
        credentials: 'include'
      });
      if (response.ok) {
        const data: ResponseData = await response.json();
        setCompanyInfo(data.companyInfo);
        
        const values: CompanyValue[] = (data.companyValues || []).map((value: CompanyValue) => ({
          id: value.id,
          title: value.title,
          description: value.description,
          icon: value.icon,
          display_order: value.display_order
        }));
        setCompanyValues(values);
        
        const whyItems: WhyChooseUsItem[] = (data.whyChooseUs || []).map((item: WhyChooseUsItem) => ({
          id: item.id,
          point: item.point || '',
          display_order: item.display_order
        }));
        setWhyChooseUs(whyItems);
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      setMessage({ type: 'error', text: 'Failed to load company information' });
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
        loadCompanyData();
      } else {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      }
    } catch {
      router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
      return;
    }
  }, [router, loadCompanyData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          companyInfo,
          companyValues,
          whyChooseUs
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: result.message || 'Company information updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else if (response.status === 401) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91');
        return;
      } else {
        throw new Error('Failed to update company information');
      }
    } catch (error) {
      console.error('Error updating company info:', error);
      setMessage({ type: 'error', text: 'Failed to update company information' });
    } finally {
      setSaving(false);
    }
  };

  const updateCompanyInfo = (field: keyof CompanyInfo, value: string | number) => {
    if (companyInfo) {
      setCompanyInfo({ ...companyInfo, [field]: value });
    }
  };

  const updateCompanyValue = (index: number, field: keyof CompanyValue, value: string | number) => {
    const updated = [...companyValues];
    updated[index] = { ...updated[index], [field]: value };
    setCompanyValues(updated);
  };

  const updateWhyChooseUsItem = (index: number, value: string) => {
    const updated = [...whyChooseUs];
    updated[index] = { ...updated[index], point: value };
    setWhyChooseUs(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <div className="text-lg font-semibold text-white mb-2">Loading Company Information</div>
          <div className="text-base text-gray-400">Please wait...</div>
        </div>
      </div>
    );
  }

  if (!companyInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full mb-6 shadow-lg">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <div className="text-lg font-semibold text-white mb-4">Failed to load company information</div>
          <Link 
            href="/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard" 
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
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
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl shadow-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Company Information</h1>
                  <p className="text-base text-gray-400">Manage company details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-2">
                <span className="text-base text-gray-400">{user?.username}</span>
                <div className="inline-flex items-center px-2 py-1 bg-yellow-900/20 border border-yellow-800 rounded-full text-sm text-yellow-400">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1 animate-pulse"></div>
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
            message.type === 'success' 
              ? 'bg-green-900/20 text-green-400 border-green-800' 
              : 'bg-red-900/20 text-red-400 border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-6 h-6" />
              <span className="font-medium text-base">{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Company Information */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Basic Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyInfo.company_name}
                    onChange={(e) => updateCompanyInfo('company_name', e.target.value)}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Established Year *
                  </label>
                  <input
                    type="number"
                    value={companyInfo.established_year}
                    onChange={(e) => updateCompanyInfo('established_year', parseInt(e.target.value))}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                    placeholder="2020"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Company Slogan
                </label>
                <input
                  type="text"
                  value={companyInfo.slogan}
                  onChange={(e) => updateCompanyInfo('slogan', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                  placeholder="Your company slogan..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Company Description *
                </label>
                <textarea
                  value={companyInfo.description}
                  onChange={(e) => updateCompanyInfo('description', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                  placeholder="Describe your company..."
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-base font-semibold text-white">
                  Mission Statement *
                </label>
                <textarea
                  value={companyInfo.mission}
                  onChange={(e) => updateCompanyInfo('mission', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                  placeholder="Your company mission..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Company Statistics */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Company Statistics</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Total Experience (Years) *
                  </label>
                  <input
                    type="number"
                    value={companyInfo.total_experience}
                    onChange={(e) => updateCompanyInfo('total_experience', parseInt(e.target.value))}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                    placeholder="10"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Students Trained *
                  </label>
                  <input
                    type="number"
                    value={companyInfo.students_trained_count}
                    onChange={(e) => updateCompanyInfo('students_trained_count', parseInt(e.target.value))}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                    placeholder="500"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Total Courses *
                  </label>
                  <input
                    type="number"
                    value={companyInfo.total_courses}
                    onChange={(e) => updateCompanyInfo('total_courses', parseInt(e.target.value))}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                    placeholder="25"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Values */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Company Values</h2>
              </div>
            </div>
            <div className="p-6 space-y-8">
              {companyValues.map((value, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-gray-700 border border-gray-600 rounded-xl">
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Value Title
                    </label>
                    <input
                      type="text"
                      value={value.title || ''}
                      onChange={(e) => updateCompanyValue(index, 'title', e.target.value)}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                      placeholder="e.g., Safety First"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-white">
                      Icon (Optional)
                    </label>
                    <IconPicker
                      value={value.icon || ''}
                      onChange={(icon) => updateCompanyValue(index, 'icon', icon)}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-base font-semibold text-white">
                      Description
                    </label>
                    <textarea
                      value={value.description || ''}
                      onChange={(e) => updateCompanyValue(index, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                      placeholder="Describe this company value..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Why Choose Us</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="space-y-3">
                  <label className="text-base font-semibold text-white">
                    Point {index + 1}
                  </label>
                  <input
                    type="text"
                    value={item.point}
                    onChange={(e) => updateWhyChooseUsItem(index, e.target.value)}
                    className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base"
                    placeholder="Enter a reason why customers should choose you..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg disabled:transform-none text-base"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
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