'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, BookOpen, MessageCircle } from 'lucide-react';

interface User {
  id: number;
  username: string;
  name: string;
}

interface Stats {
  courses: number;
  teamMembers: number;
  testimonials: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<Stats>({
    courses: 0,
    teamMembers: 0,
    testimonials: 0,
  });
  const router = useRouter();

  const loadStats = useCallback(async () => {
    try {
      const [coursesRes, teamRes, testimonialsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/team-members'),
        fetch('/api/testimonials'),
      ]);

      const [courses, team, testimonials] = await Promise.all([
        coursesRes.json(),
        teamRes.json(),
        testimonialsRes.json(),
      ]);

      setStats({
        courses: Array.isArray(courses) ? courses.length : 0,
        teamMembers: Array.isArray(team) ? team.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [setStats]);

  const checkAuth = useCallback(async () => {
    try {
      // Fixed: Call the correct auth route
      const response = await fetch('/api/admin/auth');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAuthenticated(true);
        loadStats();
      } else {
        // Fixed: Redirect to /admin instead of /admin/login
        router.push('/admin');
      }
    } catch {
      // Fixed: Redirect to /admin instead of /admin/login
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [router, setUser, setAuthenticated, loadStats, setLoading]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      // Fixed: Call the correct logout route
      await fetch('/api/admin/logout', { method: 'POST' });
      // Fixed: Redirect to /admin instead of /admin/login
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Verifying authentication...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">
                Karma Training CMS
              </h1>
              <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.courses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Team Members
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.teamMembers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Testimonials
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.testimonials}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Company Information
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage company details, mission, and core values
              </p>
              <Link
                href="/admin/company-info"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
              >
                Edit Company Info
              </Link>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Hero Section
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Update homepage hero content and statistics
              </p>
              <Link
                href="/admin/hero-section"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
              >
                Edit Hero Section
              </Link>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Courses
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add, edit, and manage training courses
              </p>
              <div className="space-y-2">
                <Link
                  href="/admin/courses/add"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
                >
                  Add New Course
                </Link>
                <Link
                  href="/admin/courses"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
                >
                  Manage Courses
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Team Members
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add and manage team member profiles
              </p>
              <div className="space-y-2">
                <Link
                  href="/admin/team-members/add"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
                >
                  Add Team Member
                </Link>
                <Link
                  href="/admin/team-members"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
                >
                  Manage Team
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Testimonials
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage client testimonials and reviews
              </p>
              <div className="space-y-2">
                <Link
                  href="/admin/testimonials/add"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
                >
                  Add Testimonial
                </Link>
                <Link
                  href="/admin/testimonials"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-block text-center"
                >
                  Manage Testimonials
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-lg rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                File Management
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload and manage images and files
              </p>
              <button
                onClick={() => alert('File Management feature coming soon!')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Manage Files
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

