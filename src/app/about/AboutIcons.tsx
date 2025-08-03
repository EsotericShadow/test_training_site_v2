/*
 * Evergreen Web Solutions
 * Written and developed by Gabriel Lacroix
 *
 * File: AboutIcons.tsx
 * Description: This component provides a centralized way to render SVG icons used across the About Us page.
 * It maps icon names to their corresponding SVG paths, allowing for easy reuse and consistent styling throughout the application's About Us section.
 * Dependencies: React
 * Created: 2025-07-19
 * Last Modified: August 2, 2025
 * Version: 1.0.0
 */

import React from 'react';

/**
 * @interface AboutIconProps
 * @description Defines the props for the AboutIcon component.
 * @property {string} name - The name of the icon to display (e.g., 'shield', 'camera'). This name corresponds to a key in the `iconData` object.
 * @property {number} [size=24] - Optional. The size (width and height) of the SVG icon in pixels. Defaults to 24.
 * @property {string} [color='currentColor'] - Optional. The color of the SVG icon. Defaults to 'currentColor', which inherits the text color from the parent.
 * @property {React.SVGProps<SVGSVGElement>} [props] - Optional. Standard SVG properties to be passed directly to the SVG element.
 */
interface AboutIconProps extends React.SVGProps<SVGSVGElement> {
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
  // 'shield' icon: Represents protection or security, often used for trust or safety features.
  'shield': <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  'camera': <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
  'briefcase': <><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  'calendar': <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  'users': <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  'book-open': <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
};

const AboutIcon: React.FC<AboutIconProps> = ({ name, size = 24, color = 'currentColor', ...props }) => {
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

export default AboutIcon;


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