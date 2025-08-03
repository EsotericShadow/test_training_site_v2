/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: LegalIcons.tsx
 * Description: This component provides a centralized way to render SVG icons used across the legal pages (e.g., Privacy Policy, Terms and Conditions).
 * It maps icon names to their corresponding SVG paths, allowing for easy reuse and consistent styling throughout the application's legal sections.
 * Dependencies: React
 * Created: 2025-07-19
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */

import React from 'react';

/**
 * @interface LegalIconProps
 * @description Defines the props for the LegalIcon component.
 * @property {string} name - The name of the icon to display (e.g., 'mail', 'map-pin'). This name corresponds to a key in the `iconData` object.
 * @property {number} [size=24] - Optional. The size (width and height) of the SVG icon in pixels. Defaults to 24.
 * @property {string} [color='currentColor'] - Optional. The color of the SVG icon. Defaults to 'currentColor', which inherits the text color from the parent.
 * @property {React.SVGProps<SVGSVGElement>} [props] - Optional. Standard SVG properties to be passed directly to the SVG element.
 */
interface LegalIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  color?: string;
}

/**
 * @constant iconData
 * @description A mapping of icon names to their corresponding SVG path elements.
 * This object centralizes SVG definitions, making it easy to add, update, or remove icons.
 * Each value is a ReactNode, typically a JSX fragment containing SVG path or shape elements.
 */
const iconData: { [key: string]: React.ReactNode } = {
  // 'mail' icon: Represents an envelope, commonly used for email addresses or contact information.
  'mail': <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>,
  'map-pin': <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
};

const LegalIcon: React.FC<LegalIconProps> = ({ name, size = 24, color = 'currentColor', ...props }) => {
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

export default LegalIcon;

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
//                           \/                                       \/     \/                 