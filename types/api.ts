/**
 * API request/response types
 */

import type { VideoSummary } from './video';

// Request types
export interface SummarizeRequest {
  youtubeUrl: string;
}

// Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type SummarizeResponse = ApiResponse<VideoSummary>;

// Rate limit types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Error codes
export const API_ERROR_CODES = {
  INVALID_URL: 'INVALID_URL',
  TRANSCRIPT_UNAVAILABLE: 'TRANSCRIPT_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  LLM_ERROR: 'LLM_ERROR',
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];
