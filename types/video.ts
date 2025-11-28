/**
 * Shared types for video-related data structures
 */

export interface VideoMetadata {
  title: string;
  thumbnail: string | null;
}

export interface VideoSummary {
  videoId: string;
  title: string;
  thumbnail: string | null;
  summary: string;
}

export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

export interface DeepgramOptions {
  model?: 'nova-2' | 'nova' | 'enhanced' | 'base';
  language?: string;
  punctuate?: boolean;
  diarize?: boolean;
}

export interface LLMSummaryResponse {
  summary: string;
}
