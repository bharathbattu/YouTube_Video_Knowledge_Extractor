/**
 * Global Loading State
 * Displayed while a route segment is loading
 */

import { Skeleton } from '@/components/ui';

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 text-gray-900">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>

        {/* Form skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
          <Skeleton className="flex-1 h-12" />
          <Skeleton className="h-12 w-32" />
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-900" />
          <span>Loading...</span>
        </div>
      </div>
    </main>
  );
}
