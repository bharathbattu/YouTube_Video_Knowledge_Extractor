/**
 * Zod validation schemas for API inputs
 */

import { z } from 'zod';

// YouTube URL patterns
const YOUTUBE_URL_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/,
  /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/v\/[a-zA-Z0-9_-]{11}/,
  /^https?:\/\/(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11}/,
];

// Custom YouTube URL validator
const isValidYouTubeUrl = (url: string): boolean => {
  return YOUTUBE_URL_PATTERNS.some((pattern) => pattern.test(url));
};

// Summarize request schema
export const summarizeRequestSchema = z.object({
  youtubeUrl: z
    .string({ message: 'YouTube URL is required' })
    .min(1, 'YouTube URL is required')
    .url('Please enter a valid URL')
    .refine(isValidYouTubeUrl, {
      message: 'Please enter a valid YouTube video URL',
    }),
});

// Video ID schema (11 characters, alphanumeric with - and _)
export const videoIdSchema = z
  .string()
  .length(11, 'Video ID must be exactly 11 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid video ID format');

// Environment variables schema
export const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  OPENROUTER_MODEL: z.string().optional(),
  DEEPGRAM_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Type exports
export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>;
export type VideoId = z.infer<typeof videoIdSchema>;
export type EnvConfig = z.infer<typeof envSchema>;

// Format Zod errors for API response
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'general';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  
  return formatted;
}
