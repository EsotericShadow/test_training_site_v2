'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/adm_f7f8556683f1cdc65391d8d2_8e91/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/adm_f7f8556683f1cdc65391d8d2_8e91/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full mb-6 shadow-lg">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Secure Access
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Karma Training Management Portal
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              System Online • TLS 1.3 Encrypted
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-foreground">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <span className="flex items-center">
                  <span className="mr-1">🔒</span>
                  End-to-End Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <span className="mr-1">🛡️</span>
                  Zero Trust Security
                </span>
              </div>
              <p className="text-xs">
                Protected by enterprise-grade security protocols
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Karma Training • Secure Management Portal
        </p>
      </div>
    </div>
  );
}

