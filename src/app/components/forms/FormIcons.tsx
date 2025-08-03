/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/components/forms/FormIcons.tsx
 * Description: Reusable SVG icon component for form elements. Provides a centralized
 *              icon system with consistent styling and customizable properties for
 *              security indicators, form validation, and user feedback elements.
 * Dependencies: React 19
 * Created: 2025-07-19
 * Last Modified: 2025-08-03
 * Version: 1.0.3
 */

import React from 'react';

interface FormIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  color?: string;
}

/**
 * Icon path data for various form-related SVG icons
 * 
 * WHY: Centralizing icon definitions ensures consistency and makes icon management
 *      easier while reducing bundle size compared to individual icon imports
 * 
 * HOW: Each icon is defined as SVG path elements optimized for 24x24 viewBox
 *      with Lucide React compatible path data for consistent design language
 * 
 * WHAT: Contains security, validation, and UI feedback icons commonly used in forms
 */
const iconData: { [key: string]: React.ReactNode } = {
  'shield': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  'alert-triangle': <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  'check-circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></>,
  'send': <path d="m22 2-7 20-4-9-9-4 20-7z" />,
  'loader-2': <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
};

/**
 * Renders SVG icons for form components with customizable properties
 * 
 * WHY: Provides a consistent, reusable icon system that maintains design coherence
 *      across all form elements while supporting theme and accessibility requirements
 * 
 * HOW: Takes icon name and renders corresponding SVG with customizable size, color,
 *      and additional props for flexibility in different contexts
 * 
 * WHAT: Returns an SVG element with the specified icon or null if icon doesn't exist
 * 
 * @param {FormIconProps} props - Component props including icon configuration
 * @param {string} props.name - Name of the icon to render from iconData
 * @param {number} [props.size=24] - Size of the icon in pixels (width and height)
 * @param {string} [props.color='currentColor'] - Color of the icon stroke
 * @param {...object} props.props - Additional SVG properties to pass through
 * @returns {JSX.Element|null} SVG icon element or null if icon not found
 */
const FormIcon: React.FC<FormIconProps> = ({ name, size = 24, color = 'currentColor', ...props }) => {
  const iconContent = iconData[name];

  if (!iconContent) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {iconContent}
    </svg>
  );
};

export default FormIcon;


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