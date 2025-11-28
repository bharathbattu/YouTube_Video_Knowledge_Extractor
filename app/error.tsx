/**
 * Global Error Boundary
 * Catches errors in route segments and displays a fallback UI
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-destructive/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full opacity-20"></div>
          <div className="relative text-8xl font-bold text-destructive/50 select-none">
            Oops!
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Don't worry, it's not your fault.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="text-left p-4 bg-destructive/10 rounded-xl border border-destructive/20 overflow-auto max-h-48">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-destructive/80 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button 
            onClick={reset} 
            size="lg"
            className="shadow-lg hover:shadow-primary/25 transition-all"
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>
      </div>
    </main>
  );
}
