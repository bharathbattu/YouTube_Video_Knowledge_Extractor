/**
 * Video Form Component
 * Client component with form handling, validation, and API calls
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

import { Button, Input } from '@/components/ui';
import { VideoResult } from '@/components/video-result';
import { ResultSkeleton } from '@/components/result-skeleton';
import type { VideoSummary } from '@/types/video';

// Progress stages for user feedback
const PROGRESS_STAGES = [
  'Validating URL...',
  'Fetching video info...',
  'Getting transcript...',
  'AI is summarizing...',
] as const;

export function VideoForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoSummary | null>(null);
  const [progressStage, setProgressStage] = useState(0);
  
  // AbortController for canceling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setProgressStage(0);
      toast.info('Request cancelled');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError('');
    setResult(null);
    setProgressStage(0);

    // Simulate progress stages
    const progressInterval = setInterval(() => {
      setProgressStage((prev) => Math.min(prev + 1, PROGRESS_STAGES.length - 1));
    }, 2000);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        // Include details if available
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}`
          : (data.error || 'Failed to summarize video');
        throw new Error(errorMessage);
      }

      // Handle new API response format
      if (data.success && data.data) {
        setResult(data.data);
        toast.success('Summary generated!');
      } else if (data.videoId) {
        // Backward compatibility with old format
        setResult(data);
        toast.success('Summary generated!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Request was cancelled, don't show error
          return;
        }
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Something went wrong');
        toast.error('Something went wrong');
      }
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setProgressStage(0);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:gap-2">
        <Input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={!!error}
          disabled={isLoading}
          className="flex-1 h-12 text-base"
          aria-label="YouTube video URL"
          aria-describedby={error ? 'url-error' : undefined}
          required
        />
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-12 px-6"
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="submit"
            className="h-12 px-6"
            disabled={!url.trim()}
          >
            Summarize
          </Button>
        )}
      </form>

      {/* Progress indicator */}
      {isLoading && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 animate-pulse">
            {PROGRESS_STAGES[progressStage]}
          </p>
          <div className="mt-2 flex justify-center gap-1">
            {PROGRESS_STAGES.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index <= progressStage ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div 
          id="url-error"
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 flex-shrink-0 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <div>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setError('')}
                className="mt-1 text-red-600 underline hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && <ResultSkeleton />}

      {/* Result */}
      {result && !isLoading && <VideoResult result={result} />}
    </div>
  );
}
