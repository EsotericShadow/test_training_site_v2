/*
 * Karma Industrial Safety Training Website
 * Written and developed by Gabriel Lacroix for Evergreen Web Solutions
 *
 * File: src/app/components/home/DynamicAboutSnippet.tsx
 * Description: Dynamic about section component for homepage with team member highlights.
 * Dependencies: React 19, Next.js 15, team data
 * Created: 2025-07-18
 * Last Modified: 2025-08-03
 * Version: 1.0.3
 */
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { TeamMember } from '../../../../types/database';

interface DynamicAboutSnippetProps {
  teamMembers: TeamMember[];
}

const AboutSnippet = dynamic(() => import('./about-snippet'), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>,
});

export default function DynamicAboutSnippet({ teamMembers }: DynamicAboutSnippetProps) {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>}>
      <AboutSnippet teamMembers={teamMembers} />
    </Suspense>
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