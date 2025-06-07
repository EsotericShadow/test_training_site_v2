'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

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

export default function CompanyInfoEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyValues, setCompanyValues] = useState<CompanyValue[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const response = await fetch('/api/admin/company-info', {
        credentials: 'include' // Include cookies for authentication
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
        window.location.href = '/admin';
        return;
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      setMessage({ type: 'error', text: 'Failed to load company information' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
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
        window.location.href = '/admin';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading company information...</p>
        </div>
      </div>
    );
  }

  if (!companyInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load company information</p>
          <Link href="/admin/dashboard" className="text-yellow-500 hover:text-yellow-600">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center space-x-2 text-yellow-500 hover:text-yellow-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Company Information
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your company details, mission, and core values
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Company Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyInfo.company_name}
                  onChange={(e) => updateCompanyInfo('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Established Year
                </label>
                <input
                  type="number"
                  value={companyInfo.established_year}
                  onChange={(e) => updateCompanyInfo('established_year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Slogan
              </label>
              <input
                type="text"
                value={companyInfo.slogan}
                onChange={(e) => updateCompanyInfo('slogan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Your company slogan..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                value={companyInfo.description}
                onChange={(e) => updateCompanyInfo('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Describe your company..."
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mission Statement
              </label>
              <textarea
                value={companyInfo.mission}
                onChange={(e) => updateCompanyInfo('mission', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Your company mission..."
                required
              />
            </div>
          </div>

          {/* Company Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Company Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Experience (Years)
                </label>
                <input
                  type="number"
                  value={companyInfo.total_experience}
                  onChange={(e) => updateCompanyInfo('total_experience', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Students Trained
                </label>
                <input
                  type="number"
                  value={companyInfo.students_trained_count}
                  onChange={(e) => updateCompanyInfo('students_trained_count', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Courses
                </label>
                <input
                  type="number"
                  value={companyInfo.total_courses}
                  onChange={(e) => updateCompanyInfo('total_courses', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Company Values */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Core Values
            </h2>
            
            <div className="space-y-4">
              {companyValues.map((value, index) => (
                <div key={value.id || index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={value.title || ''}
                      onChange={(e) => updateCompanyValue(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <select
                      value={value.icon || 'target'}
                      onChange={(e) => updateCompanyValue(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="target">Target</option>
                      <option value="users">Users</option>
                      <option value="leaf">Leaf</option>
                      <option value="award">Award</option>
                      <option value="shield">Shield</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={value.description || ''}
                      onChange={(e) => updateCompanyValue(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Why Choose Us
            </h2>
            
            <div className="space-y-4">
              {whyChooseUs.map((item, index) => (
                <div key={item.id || index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Point {index + 1}
                  </label>
                  <input
                    type="text"
                    value={item.point}
                    onChange={(e) => updateWhyChooseUsItem(index, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter a key point about why clients should choose you..."
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
              className="inline-flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

