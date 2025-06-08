'use client';

import { useState } from 'react';

// Admin login page for Karma Training management system

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Store authentication data
        localStorage.setItem('admin_token', result.token);
        localStorage.setItem('admin_user', JSON.stringify(result.user));
        
        // Show success message
        alert('Login successful! Redirecting to dashboard...');
        // Simulate dashboard loading
        setError('Dashboard loading... (this may take a moment)');
      } else {
        // Show error with helpful information
        setError(result.error + (result.hint ? ` (Hint: ${result.hint})` : ''));
      }
    } catch {
      setError('Connection failed. Try direct database access?');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 text-sm mt-2">
            Karma Training Management System
          </p>

        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="font-semibold">Error:</div>
            <div>{error}</div>
            {/* Debug information */}
            {error.includes('Invalid username') && (
              <div className="text-xs mt-2 bg-yellow-50 p-2 rounded">
                <strong>Debug Info:</strong> Try: tneilson, lcharlie, mstewart, sysadmin
              </div>
            )}
            {error.includes('Invalid password') && (
              <div className="text-xs mt-2 bg-yellow-50 p-2 rounded">
                <strong>Debug Info:</strong> Password validation failed. Check case sensitivity.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login to Admin Panel'}
          </button>
        </form>




        {/* Hidden HTML comments for source code inspection */}
        {/* 
          TODO: Fix security issues before production
          Staff credentials - contact IT for password resets
          Database backup location: /backup/karma_training_db.sql
          Config file: /config/database.php
          phpMyAdmin: /phpmyadmin (if installed)
          
          Known vulnerabilities:
          - SQL injection in login form
          - No CSRF protection
          - Weak password policy
          - Debug mode enabled
          
          Staff accounts:
          - tneilson (Tanya Neilson) - IT Administrator
          - lcharlie (Lena Charlie) - Mining Safety Training Manager
          - mstewart (Mike Stewart) - Forestry Safety Instructor
          - sysadmin - System Administrator
          - rkaur (Ravinder Kaur) - Workplace Compliance Coordinator
          - jthomas (Jonah Thomas) - Heavy Equipment Training Instructor
        */}
      </div>
    </div>
  );
}

