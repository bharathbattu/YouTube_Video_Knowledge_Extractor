/**
 * Result Skeleton - Loading state for video results
 * Matches the notebook-style layout
 */

import { Skeleton } from '@/components/ui';
import { BookOpen } from 'lucide-react';

export function ResultSkeleton() {
  return (
    <div className="mt-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Notebook Header Label */}
      <div className="flex items-center gap-2 mb-4 px-1 text-slate-400">
        <BookOpen className="w-4 h-4" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Main Notebook Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Source Material Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Video Thumbnail */}
            <Skeleton className="w-full sm:w-48 aspect-video rounded-lg" />

            {/* Title & Metadata */}
            <div className="flex-1 w-full space-y-4 py-1">
              <div className="space-y-2">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-7 w-1/2" />
              </div>
              <Skeleton className="h-4 w-32" />
              
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Content */}
        <div className="p-8 md:p-10 bg-white space-y-6">
          {/* Heading */}
          <Skeleton className="h-8 w-1/3 mb-6" />
          
          {/* Paragraph 1 */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* List */}
          <div className="space-y-3 pl-4 border-l-2 border-slate-100 py-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-11/12" />
          </div>

          {/* Paragraph 2 */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex justify-center">
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
    </div>
  );
}
