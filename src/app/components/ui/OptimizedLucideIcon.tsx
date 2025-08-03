/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: OptimizedLucideIcon.tsx
 * Description: Optimized icon component wrapper for Lucide React icons with performance enhancements.
 * Dependencies: React 19, Lucide React
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */

import React from 'react';

// Define a type for the icon props
interface OptimizedLucideIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
  color?: string;
}

// A placeholder for the icon data
// In a real implementation, you would populate this with the SVG data for the icons you need
const iconData: { [key: string]: React.ReactNode } = {
  // Example:
  // 'arrow-right': <path d="M5 12h14" />,
};

const OptimizedLucideIcon: React.FC<OptimizedLucideIconProps> = ({ name, size = 24, color = 'currentColor', ...props }) => {
  const iconContent = iconData[name];

  if (!iconContent) {
    // Return a placeholder or null if the icon is not found
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

export default OptimizedLucideIcon;
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