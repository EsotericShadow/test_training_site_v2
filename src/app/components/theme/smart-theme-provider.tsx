'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  systemTheme: Theme;
  detectionMethod: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  const [systemTheme, setSystemTheme] = useState<Theme>('light');
  const [detectionMethod, setDetectionMethod] = useState<string>('system');

  useEffect(() => {
    const detectTheme = () => {
      // 1. Check system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setSystemTheme(systemPreference);

      // 2. Detect device type
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMacOS = /macintosh|mac os x/.test(userAgent);
      const isWindows = /windows/.test(userAgent);

      // 3. Time-based detection
      const now = new Date();
      const hour = now.getHours();
      const isNightTime = hour >= 18 || hour <= 6; // 6PM to 6AM

      // 4. Geographic location detection (if available)
      let finalTheme: Theme = systemPreference;
      let method = 'system-preference';

      // Enhanced detection logic
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Calculate sunset/sunrise based on location
            const lat = position.coords.latitude;
            
            // Simple sunset calculation (can be enhanced with proper solar calculation)
            const sunsetHour = 18 + (lat / 90) * 2; // Rough approximation
            const sunriseHour = 6 - (lat / 90) * 2;
            
            const isAfterSunset = hour >= sunsetHour || hour <= sunriseHour;
            
            if (isAfterSunset) {
              finalTheme = 'dark';
              method = 'geographic-sunset';
            }
            
            applyTheme(finalTheme, method);
          },
          () => {
            // Fallback to time-based if geolocation fails
            if (isNightTime && systemPreference === 'dark') {
              finalTheme = 'dark';
              method = 'time-based-night';
            }
            applyTheme(finalTheme, method);
          }
        );
      } else {
        // Device-specific preferences
        if (isIOS && systemPreference === 'dark') {
          finalTheme = 'dark';
          method = 'ios-system';
        } else if (isAndroid && systemPreference === 'dark') {
          finalTheme = 'dark';
          method = 'android-system';
        } else if (isMacOS && systemPreference === 'dark') {
          finalTheme = 'dark';
          method = 'macos-system';
        } else if (isWindows && systemPreference === 'dark') {
          finalTheme = 'dark';
          method = 'windows-system';
        } else if (isNightTime) {
          finalTheme = 'dark';
          method = 'time-based-auto';
        }
        
        applyTheme(finalTheme, method);
      }
    };

    const applyTheme = (newTheme: Theme, method: string) => {
      setTheme(newTheme);
      setDetectionMethod(method);
      
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }

      // Store preference for learning
      localStorage.setItem('karma-theme-preference', JSON.stringify({
        theme: newTheme,
        method,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }));
    };

    // Check for stored user behavior patterns
    const storedPreference = localStorage.getItem('karma-theme-preference');
    if (storedPreference) {
      try {
        const parsed = JSON.parse(storedPreference);
        const hoursSinceStored = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
        
        // If preference is recent (within 24 hours), consider it
        if (hoursSinceStored < 24) {
          applyTheme(parsed.theme, `learned-${parsed.method}`);
          return;
        }
      } catch (error) {
        // Invalid stored data - clear it and log error in development
        console.warn('Invalid theme preference data, clearing:', error);
        localStorage.removeItem('karma-theme-preference');
        // Proceed with fresh detection
      }
    }

    // Initial detection
    detectTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => detectTheme();
    
    mediaQuery.addEventListener('change', handleChange);

    // Re-detect every hour for time-based changes
    const interval = setInterval(detectTheme, 60 * 60 * 1000);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, systemTheme, detectionMethod }}>
      {children}
    </ThemeContext.Provider>
  );
}

