'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FeaturedCourses = dynamic(() => import('./featured-courses'), {
  loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>,
});

export default function DynamicFeaturedCourses() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div></div>}>
      <FeaturedCourses />
    </Suspense>
  );
}
