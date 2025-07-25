'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import FormIcon from './FormIcons';

interface SecureContactFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  trainingType: string;
}

interface FormErrors {
  [key: string]: string;
}

interface SecurityState {
  csrfToken: string;
  honeypotField: string;
  honeypotValue: string;
  sessionId: string;
}

export default function SecureContactForm({
  onSuccess,
  onError,
  className = ''
}: SecureContactFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    trainingType: ''
  });

  // Security state
  const [security, setSecurity] = useState<SecurityState>({
    csrfToken: '',
    honeypotField: '',
    honeypotValue: '',
    sessionId: ''
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Calculate security score based on various factors
  const calculateSecurityScore = useCallback(() => {
    let score = 0;

    // Check for HTTPS or development
    if (window.location.protocol === 'https:' || process.env.NODE_ENV === 'development') score += 20;

    // Check for modern browser features
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') score += 20;
    if (typeof window.fetch === 'function') score += 10;
    if (document.referrer.includes(window.location.hostname) || !document.referrer) score += 10;

    // Check form completion time
    const timeSpent = Date.now() - startTimeRef.current;
    if (timeSpent > 3000) score += 20; // At least 3 seconds
    if (timeSpent < 60000) score += 20; // Less than 1 minute

    setSecurityScore(score);
  }, []);

  // Initialize security tokens and measures
  const initializeSecurity = useCallback(async () => {
    try {
      // Use a GET request as defined in the new endpoint
      const response = await fetch('/api/contact/security-init', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const securityData = await response.json();
        if (securityData.success) {
          setSecurity({
            csrfToken: securityData.csrfToken,
            sessionId: securityData.sessionId,
            honeypotField: 'website', // Keep honeypot logic, but simplified
            honeypotValue: '',
          });
          calculateSecurityScore();
        } else {
          throw new Error(securityData.error || 'Failed to get security tokens.');
        }
      } else {
        throw new Error('Failed to initialize security context from server.');
      }
    } catch (error) {
      console.error('Failed to initialize security:', error);
      if (onError) {
        onError('Security initialization failed. Please refresh the page.');
      }
    }
  }, [onError, calculateSecurityScore]);

  // Initialize security measures
  useEffect(() => {
    initializeSecurity();

    // Cleanup function
    return () => {
      setSecurity({
        csrfToken: '',
        honeypotField: '',
        honeypotValue: '',
        sessionId: ''
      });
    };
  }, [initializeSecurity]);

  // Update security score dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      calculateSecurityScore();
    }, 1000); // Update every second
    return () => clearInterval(timer);
  }, [calculateSecurityScore]);

  // Real-time input validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name must be less than 100 characters';
        if (!/^[a-zA-Z\s\-\'\.]+$/.test(value)) return 'Name contains invalid characters';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        if (value.length > 254) return 'Email address is too long';
        return '';

      case 'phone':
        if (value && !/^[\d\s\-\(\)\+\.]+$/.test(value)) return 'Phone contains invalid characters';
        if (value) {
          const digitsOnly = value.replace(/\D/g, '');
          if (digitsOnly.length < 10 || digitsOnly.length > 15) {
            return 'Phone number must be 10-15 digits';
          }
        }
        return '';

      case 'company':
        if (value && value.length > 200) return 'Company name must be less than 200 characters';
        if (value && !/^[a-zA-Z0-9\s\.\,\&\-\'\.]+$/.test(value)) return 'Company name contains invalid characters';
        return '';

      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.length < 10) return 'Message must be at least 10 characters';
        if (value.length > 5000) return 'Message must be less than 5000 characters';

        // Check for spam patterns
        const spamPatterns = [
          /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
          /\b(click here|free money|make money fast)\b/i,
          /(http|https|www\.)/i,
          /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/
        ];

        for (const pattern of spamPatterns) {
          if (pattern.test(value)) {
            return 'Message contains prohibited content';
          }
        }
        return '';

      default:
        return '';
    }
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Sanitize input
    let sanitizedValue = value;

    // Basic sanitization based on field type
    switch (name) {
      case 'name':
      case 'company':
        sanitizedValue = value.replace(/[<>"\'%;()&+]/g, '');
        break;
      case 'email':
        sanitizedValue = value.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
        break;
      case 'phone':
        sanitizedValue = value.replace(/[^0-9\s\-\(\)\+\.]/g, '');
        break;
      case 'message':
        sanitizedValue = value.replace(/<script\b[^<]*(?:(?!<\/script>)[^<]*)*<\/script>/gi, '');
        break;
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Validate field
    const error = validateField(name, sanitizedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Update security score
    calculateSecurityScore();
  };

  // Handle honeypot field (should remain empty)
  const handleHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity(prev => ({
      ...prev,
      honeypotValue: e.target.value
    }));
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate all required fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Security validations
    if (!security.csrfToken) {
      newErrors.security = 'Security token missing. Please refresh the page.';
    }

    if (security.honeypotValue) {
      newErrors.security = 'Bot detected. Submission blocked.';
    }

    if (securityScore < 30 && process.env.NODE_ENV !== 'development') {
      newErrors.security = 'Security score too low. Please try again.';
    }

    // Check form completion time
    const timeSpent = Date.now() - startTimeRef.current;
    if (timeSpent < 3000) {
      newErrors.security = 'Form submitted too quickly. Please take your time.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if blocked
    if (isBlocked) {
      if (onError) {
        onError('Too many failed attempts. Please try again later.');
      }
      return;
    }

    // Increment submit attempts
    setSubmitAttempts(prev => prev + 1);

    // Block after 3 failed attempts
    if (submitAttempts >= 3) {
      setIsBlocked(true);
      if (onError) {
        onError('Too many failed attempts. Please refresh the page and try again.');
      }
      return;
    }

    // Validate form
    if (!validateForm()) {
      if (onError) {
        onError('Please correct the errors and try again.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare secure payload
      const payload = {
        ...formData,
        csrfToken: security.csrfToken,
        sessionId: security.sessionId,
        securityScore,
        timeSpent: Date.now() - startTimeRef.current,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };

      // Add honeypot check
      const honeypotData = {
        [security.honeypotField]: security.honeypotValue
      };

      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, ...honeypotData })
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess();
        }

        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          message: '',
          trainingType: ''
        });
        setErrors({});
        setSubmitAttempts(0);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className={`text-center ${className}`}>
        <FormIcon name="check-circle" className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent Successfully!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thank you for your inquiry. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            initializeSecurity();
            startTimeRef.current = Date.now();
          }}
          className="bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 dark:text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Security indicator */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-200 dark:text-white">Send Us a Message</h2>
        <div className="flex items-center space-x-2">
          <FormIcon name="shield" className={`h-5 w-5 ${securityScore >= 70 ? 'text-green-500' : securityScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`} />
          <span className="text-sm text-gray-500">
            Security: {securityScore >= 70 ? 'High' : securityScore >= 50 ? 'Medium' : 'Low'}
          </span>
        </div>
      </div>

      {/* Error display */}
      {errors.security && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
          <FormIcon name="alert-triangle" className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400">{errors.security}</span>
        </div>
      )}

      {/* Blocked state */}
      {isBlocked && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 font-semibold">
            Access temporarily blocked due to multiple failed attempts. Please refresh the page and try again.
          </p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name={security.honeypotField}
          value={security.honeypotValue}
          onChange={handleHoneypotChange}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Name and Email row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 ${
                errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Your full name"
              maxLength={100}
              autoComplete="name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 ${
                errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="your@email.com"
              maxLength={254}
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>
        </div>

        {/* Company and Phone row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 ${
                errors.company ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Your company"
              maxLength={200}
              autoComplete="organization"
            />
            {errors.company && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent bg-white dark:bg-gray-800 text-gray-400 dark:text-white transition-colors duration-200 ${
                errors.phone ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="(250) 555-0123"
              maxLength={20}
              autoComplete="tel"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
          </div>
        </div>

        {/* Training Type */}
        <div>
          <label htmlFor="trainingType" className="block text-sm font-medium text-gray-400 dark:text-gray-300 mb-2">
            Training Interest
          </label>
          <select
            id="trainingType"
            name="trainingType"
            value={formData.trainingType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="">Select a training program</option>
            <option value="kist-orientation">KIST Orientation to Workplace Safety</option>
            <option value="whmis">WHMIS 2018 GHS</option>
            <option value="fall-protection">Fall Protection</option>
            <option value="confined-space">Confined Space Entry</option>
            <option value="equipment-training">Equipment Operator Training</option>
            <option value="custom">Custom Training Program</option>
            <option value="consultation">Safety Consultation</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-400 dark:text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 resize-vertical ${
              errors.message ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Tell us about your training needs, number of participants, preferred dates, or any specific requirements..."
            maxLength={5000}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>}
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">
            {formData.message.length}/5000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-300 dark:text-gray-400">
            <FormIcon name="shield" className="h-6 w-6" />
            <span>Your information is secure and encrypted</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isBlocked}
            className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg ${
              isSubmitting || isBlocked
                ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-500 text-gray-900 dark:text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <FormIcon name="loader-2" className="h-5 w-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FormIcon name="send" className="h-5 w-5" />
                <span>Submit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}