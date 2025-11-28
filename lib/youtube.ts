/**
 * YouTube utilities - Video ID extraction, metadata, transcripts, and audio download
 */

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

import type { VideoMetadata, TranscriptItem } from '@/types/video';
import { videoIdSchema } from '@/lib/validations';
import { withTimeout, retry } from '@/lib/utils';
import { API_CONFIG, AUDIO_CONFIG } from '@/lib/constants';

const execFileAsync = promisify(execFile);

/**
 * Custom error class for YouTube operations
 */
export class YouTubeError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_URL' | 'INVALID_VIDEO_ID' | 'TRANSCRIPT_UNAVAILABLE' | 'METADATA_FAILED' | 'AUDIO_DOWNLOAD_FAILED'
  ) {
    super(message);
    this.name = 'YouTubeError';
  }
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  // Sanitize input - remove any potentially dangerous characters
  const sanitizedUrl = url.trim();
  
  const patterns = [
    // Standard watch URL
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    // Shorts URL
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
    // Embed URL
    /youtube\.com\/embed\/([^"&?\/\s]{11})/,
  ];

  for (const pattern of patterns) {
    const match = sanitizedUrl.match(pattern);
    if (match && match[1]) {
      // Validate the extracted ID format
      const result = videoIdSchema.safeParse(match[1]);
      if (result.success) {
        return result.data;
      }
    }
  }

  return null;
}

/**
 * Validate a video ID format
 */
export function isValidVideoId(videoId: string): boolean {
  return videoIdSchema.safeParse(videoId).success;
}

/**
 * Fetch video metadata (title, thumbnail) with timeout and retry
 */
export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  if (!isValidVideoId(videoId)) {
    console.error('Invalid video ID format:', videoId);
    return null;
  }

  try {
    const fetchMetadata = async () => {
      const info = await ytdl.getBasicInfo(videoId);
      return {
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[0]?.url ?? null,
      };
    };

    return await withTimeout(
      retry(fetchMetadata, { maxAttempts: 2, initialDelay: 500 }),
      API_CONFIG.REQUEST_TIMEOUT_MS,
      'Video metadata fetch timed out'
    );
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    
    // Check for specific ytdl errors
    if (error instanceof Error) {
      if (error.message.includes('Private video')) {
        throw new YouTubeError('This video is private', 'METADATA_FAILED');
      }
      if (error.message.includes('Sign in to confirm your age')) {
        throw new YouTubeError('This video is age-restricted', 'METADATA_FAILED');
      }
    }
    
    return null;
  }
}

/**
 * Fetch transcript from YouTube with timeout
 */
export async function fetchTranscript(videoId: string): Promise<string | null> {
  if (!isValidVideoId(videoId)) {
    console.error('Invalid video ID format:', videoId);
    return null;
  }

  try {
    const fetchFromYT = async () => {
      const transcriptItems: TranscriptItem[] = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptItems || transcriptItems.length === 0) {
        return null;
      }

      return transcriptItems.map((item) => item.text).join(' ');
    };

    return await withTimeout(
      fetchFromYT(),
      API_CONFIG.REQUEST_TIMEOUT_MS,
      'Transcript fetch timed out'
    );
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

/**
 * Get the correct yt-dlp binary path based on platform
 */
function getYtDlpPath(): string {
  const binName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const localPath = path.join(process.cwd(), binName);
  const binDirPath = path.join(process.cwd(), 'bin', binName);
  
  // Check local directory first, then bin directory
  // In production, you might want to use a system-installed yt-dlp
  return localPath; // Default to local for now
}

/**
 * Validate YouTube URL for audio download (security check)
 */
function isValidYouTubeUrlForDownload(url: string): boolean {
  // Strict validation - only allow known YouTube domains
  const allowedPatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11}/,
  ];
  
  return allowedPatterns.some((pattern) => pattern.test(url));
}

/**
 * Download audio from YouTube video using yt-dlp
 */
export async function getYouTubeAudioFile(youtubeUrl: string): Promise<string> {
  // Security: Validate URL before passing to external command
  if (!isValidYouTubeUrlForDownload(youtubeUrl)) {
    throw new YouTubeError(
      'Invalid YouTube URL format for audio download',
      'INVALID_URL'
    );
  }

  const tempDir = os.tmpdir();
  const fileName = `yt_audio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.m4a`;
  const filePath = path.join(tempDir, fileName);
  const binaryPath = getYtDlpPath();

  // Check if binary exists
  try {
    await fs.access(binaryPath);
  } catch {
    throw new YouTubeError(
      `yt-dlp binary not found at ${binaryPath}`,
      'AUDIO_DOWNLOAD_FAILED'
    );
  }

  try {
    // Add extractor args to suppress JS warning and improve stability
    const args = [
      '-f', AUDIO_CONFIG.YT_DLP_FORMAT,
      '-o', filePath,
      '--no-playlist',
      '--no-warnings',
      '--extractor-args', 'youtube:player_client=default',
      youtubeUrl,
    ];

    console.log(`Executing yt-dlp: ${binaryPath} ${args.join(' ')}`);

    await execFileAsync(binaryPath, args, {
      timeout: API_CONFIG.REQUEST_TIMEOUT_MS,
    });

    // Verify file was created
    await fs.access(filePath);
    const stats = await fs.stat(filePath);
    
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    return filePath;
  } catch (error) {
    // Clean up partial file if exists
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore cleanup errors
    }

    console.error('yt-dlp error:', error);
    
    // Enhance error message with stderr if available
    let errorMessage = 'Failed to download audio from YouTube';
    if (error instanceof Error && 'stderr' in error) {
      errorMessage += `: ${(error as any).stderr}`;
    } else if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }

    throw new YouTubeError(
      errorMessage,
      'AUDIO_DOWNLOAD_FAILED'
    );
  }
}

/**
 * Clean up temporary audio file
 */
export async function cleanupAudioFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch {
    // File doesn't exist or already deleted - ignore
  }
}
