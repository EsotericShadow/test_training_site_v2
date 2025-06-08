'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// WordPress login page - now works with custom layout

export default function WordPressLogin() {
  const [formData, setFormData] = useState({
    log: '',
    pwd: '',
    rememberme: false,
    redirect_to: '',
    testcookie: '1'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [wpNonce, setWpNonce] = useState('');

  useEffect(() => {
    // Generate WordPress nonce (predictable pattern for vulnerability)
    const timestamp = Math.floor(Date.now() / 1000);
    setWpNonce(`${timestamp.toString(36)}${Math.random().toString(36).substr(2, 8)}`);
    
    // Set redirect URL to wp-admin
    setFormData(prev => ({
      ...prev,
      redirect_to: '/wp-admin/'
    }));

    // Focus username field like real WordPress
    setTimeout(() => {
      try {
        document.getElementById('user_login')?.focus();
      } catch {
        // Ignore focus errors
      }
    }, 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('log', formData.log);
      formDataToSend.append('pwd', formData.pwd);
      formDataToSend.append('wp-submit', 'Log In');
      formDataToSend.append('redirect_to', formData.redirect_to);
      formDataToSend.append('testcookie', '1');
      formDataToSend.append('_wpnonce', wpNonce);
      formDataToSend.append('_wp_http_referer', '/wp-login.php');
      if (formData.rememberme) {
        formDataToSend.append('rememberme', 'forever');
      }

      const response = await fetch('/api/wp-login/authenticate', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        // WordPress-style redirect
        window.location.href = result.redirect_to || '/wp-admin/';
      } else {
        // WordPress-style error message
        setError(result.message || 'Invalid username or password.');
      }
    } catch {
      setError('Connection lost. Please try again.');
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
    <div id="login">
      <h1>
        <Link href="/">Karma Training</Link>
      </h1>

      {error && (
        <div id="login_error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} method="post" id="loginform">
        <p>
          <label htmlFor="user_login">Username or Email Address</label>
          <input
            type="text"
            name="log"
            id="user_login"
            className="input"
            value={formData.log}
            onChange={handleInputChange}
            size={20}
            autoCapitalize="off"
            autoComplete="username"
            required
          />
        </p>

        <div className="user-pass-wrap">
          <label htmlFor="user_pass">Password</label>
          <div className="wp-pwd">
            <input
              type="password"
              name="pwd"
              id="user_pass"
              className="input password-input"
              value={formData.pwd}
              onChange={handleInputChange}
              size={20}
              autoComplete="current-password"
              spellCheck="false"
              required
            />
          </div>
        </div>

        <p className="forgetmenot">
          <input
            name="rememberme"
            type="checkbox"
            id="rememberme"
            checked={formData.rememberme}
            onChange={handleInputChange}
          />
          <label htmlFor="rememberme">Remember Me</label>
        </p>

        <p className="submit">
          <input
            type="submit"
            name="wp-submit"
            id="wp-submit"
            className="button button-primary button-large"
            value={loading ? "Logging In..." : "Log In"}
            disabled={loading}
          />
          <input type="hidden" name="redirect_to" value={formData.redirect_to} />
          <input type="hidden" name="testcookie" value="1" />
        </p>
      </form>

      <p id="nav">
        <a href="/wp-login.php?action=lostpassword">Lost your password?</a>
      </p>

      <p id="backtoblog">
        <Link href="/">← Go to Karma Training</Link>
      </p>

      <div className="language-switcher">
        <form>
          <label htmlFor="language-switcher">
            <span className="dashicons dashicons-translation" aria-hidden="true"></span>
            <span className="screen-reader-text">Language</span>
          </label>
          <select name="locale" id="language-switcher">
            <option value="en_US" lang="en" data-installed="1">English (United States)</option>
          </select>
          <input type="submit" className="button" value="Change" />
        </form>
      </div>

      <div className="clear"></div>
    </div>
  );
}

