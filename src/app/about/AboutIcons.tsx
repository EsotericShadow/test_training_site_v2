/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: AboutIcons.tsx
 * Description: Icon component for About page UI elements. Provides SVG icons for features and contact information.
 * Dependencies: React 19, SVG components
 * Created: June 3, 2025
 * Last Modified: August 3, 2025
 * Version: 1.0.0
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';

// Helper function to convert kebab-case/camelCase to PascalCase
const toPascalCase = (s: string) =>
  s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

interface AboutIconProps extends LucideProps {
  name: string;
}

const AboutIcon: React.FC<AboutIconProps> = ({ name, ...props }) => {
  const pascalCaseName = toPascalCase(name);

  const DynamicIcon = dynamic(async () => {
    const { icons } = await import('lucide-react');
    const IconComponent = icons[pascalCaseName as keyof typeof icons];

    if (IconComponent) {
      const RenderedIcon = (componentProps: LucideProps) => <IconComponent {...componentProps} />;
      RenderedIcon.displayName = `LucideIcon-${pascalCaseName}`;
      return RenderedIcon;
    } else {
      console.warn(`Lucide icon "${name}" (PascalCase: "${pascalCaseName}") not found.`);
      const FallbackIcon = () => null;
      FallbackIcon.displayName = `LucideIconFallback-${pascalCaseName}`;
      return FallbackIcon;
    }
  }, {
    ssr: false,
    loading: () => <div style={{ width: props.size || 24, height: props.size || 24 }} />,
  });

  return <DynamicIcon {...props} />;
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
//                           \/ https://www.evergreenwebsolutions.ca  \/     \/                 