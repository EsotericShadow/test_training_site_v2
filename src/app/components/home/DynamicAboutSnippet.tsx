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
