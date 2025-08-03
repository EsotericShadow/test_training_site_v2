/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: smart-theme-provider.tsx
 * Description: Theme provider component that enforces dark mode theme across the application.
 *              Manages theme state and ensures consistent dark theme application with
 *              proper CSS class management and localStorage cleanup.
 * Dependencies: React 19 Context API
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook to access theme context from components
 * 
 * WHY: Provides a safe way to access theme state with proper error handling
 *      to ensure components are used within the correct provider context
 * 
 * HOW: Uses React useContext hook with error boundary to validate proper usage
 * 
 * WHAT: Returns current theme context or throws descriptive error if misused
 * 
 * @returns {ThemeContextType} Current theme context with theme state
 * @throws {Error} When used outside of ThemeProvider
 */
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

/**
 * Theme provider component that enforces dark mode across the application
 * 
 * WHY: Ensures consistent dark theme application and prevents theme conflicts
 *      that could arise from user preferences or system settings
 * 
 * HOW: Sets up React context with fixed dark theme, applies CSS classes to document,
 *      and cleans up any stored preferences that might interfere
 * 
 * WHAT: Provides theme context to all child components with enforced dark mode
 * 
 * @param {ThemeProviderProps} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with theme context
 * @returns {JSX.Element} Theme context provider wrapping children
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';

    // Clean up any stored preference that might interfere
    localStorage.removeItem('karma-theme-preference');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
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