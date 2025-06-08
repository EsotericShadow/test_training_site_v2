'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Professional login portal for Karma Training management system

export default function ProfessionalLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [sessionId, setSessionId] = useState('');

  // Initialize security features
  useEffect(() => {
    // Generate CSRF token (predictable pattern - subtle vulnerability)
    const timestamp = Date.now();
    const fakeToken = btoa(`csrf_${timestamp}_${Math.floor(timestamp / 1000)}`);
    setCsrfToken(fakeToken);
    
    // Generate session ID
    setSessionId(`sess_${Math.random().toString(36).substr(2, 16)}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          ...formData,
          csrfToken,
          sessionId,
          timestamp: Date.now()
        })
      });

      const result = await response.json();

      if (result.success) {
        // Store authentication data securely
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_session', JSON.stringify(result.session));
        
        setError('Authentication successful. Redirecting...');
        
        // Simulate secure redirect
        setTimeout(() => {
          setError('Loading dashboard...');
        }, 1000);
      } else {
        setError(result.message || 'Authentication failed');
        
        // Regenerate CSRF token (predictably)
        const newTimestamp = Date.now();
        setCsrfToken(btoa(`csrf_${newTimestamp}_${Math.floor(newTimestamp / 1000)}`));
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Clean professional header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Access Portal</h1>
          <p className="text-blue-200">Karma Training Management System</p>
        </div>

        {/* Clean professional login form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
          {/* Minimal security indicator */}
          <div className="flex items-center justify-center mb-6 text-sm text-green-400">
            <Lock className="w-4 h-4 mr-2" />
            <span>Secure Connection</span>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center text-red-200">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hidden security fields */}
            <input type="hidden" name="csrf_token" value={csrfToken} />
            <input type="hidden" name="session_id" value={sessionId} />
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-white/80">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="mr-2 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Remember this device</span>
              </label>
              <a href="#" className="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                Forgot credentials?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Simple professional disclaimer */}
        <div className="text-center mt-6 text-white/60 text-xs">
          <p>Authorized access only. All sessions are monitored.</p>
        </div>
      </div>
    </div>
  );
}

