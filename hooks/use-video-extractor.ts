/**
 * useVideoExtractor Hook
 * Encapsulates video extraction logic with state management
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import type { VideoSummary } from '@/types/video';

interface UseVideoExtractorOptions {
  onSuccess?: (result: VideoSummary) => void;
  onError?: (error: Error) => void;
}

interface UseVideoExtractorReturn {
  isLoading: boolean;
  error: string | null;
  result: VideoSummary | null;
  progress: number;
  extract: (url: string) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useVideoExtractor(
  options: UseVideoExtractorOptions = {}
): UseVideoExtractorReturn {
  const { onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoSummary | null>(null);
  const [progress, setProgress] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    abortControllerRef.current = null;
    setProgress(0);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    cleanup();
    setIsLoading(false);
  }, [cleanup]);

  const reset = useCallback(() => {
    cancel();
    setError(null);
    setResult(null);
  }, [cancel]);

  const extract = useCallback(async (url: string) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Simulate progress
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
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
        throw new Error(data.error || 'Failed to summarize video');
      }

      // Handle response format
      const videoResult = data.success && data.data ? data.data : data;
      
      setResult(videoResult);
      setProgress(100);
      onSuccess?.(videoResult);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled
        }
        setError(err.message);
        onError?.(err);
      } else {
        const genericError = new Error('Something went wrong');
        setError(genericError.message);
        onError?.(genericError);
      }
    } finally {
      cleanup();
      setIsLoading(false);
    }
  }, [onSuccess, onError, cleanup]);

  return {
    isLoading,
    error,
    result,
    progress,
    extract,
    cancel,
    reset,
  };
}
