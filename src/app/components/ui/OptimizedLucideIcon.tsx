
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
