/**
 * Deepgram Speech-to-Text integration
 */

import { promises as fs } from 'fs';

import type { DeepgramOptions } from '@/types/video';
import { withTimeout } from '@/lib/utils';
import { API_CONFIG, AUDIO_CONFIG } from '@/lib/constants';

const MAX_FILE_SIZE_BYTES = AUDIO_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Custom error for Deepgram operations
 */
export class DeepgramError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'DeepgramError';
  }
}

/**
 * Transcribe audio file using Deepgram Nova-2
 */
export async function transcribeWithDeepgram(
  filePath: string,
  options: DeepgramOptions = {}
): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    throw new DeepgramError('DEEPGRAM_API_KEY is missing in environment variables');
  }

  // Validate file exists and check size
  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch {
    throw new DeepgramError(`Audio file not found: ${filePath}`);
  }

  if (stats.size > MAX_FILE_SIZE_BYTES) {
    throw new DeepgramError(
      `File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max ${AUDIO_CONFIG.MAX_FILE_SIZE_MB}MB)`
    );
  }

  if (stats.size === 0) {
    throw new DeepgramError('Audio file is empty');
  }

  const {
    model = 'nova-2',
    language = 'en',
    punctuate = true,
    diarize = false,
  } = options;

  // Build query parameters
  const params = new URLSearchParams({
    model,
    language,
    punctuate: punctuate.toString(),
    diarize: diarize.toString(),
  });

  const url = `${API_CONFIG.DEEPGRAM_BASE_URL}?${params.toString()}`;

  // Read file as buffer for upload
  const buffer = await fs.readFile(filePath);

  const transcribe = async (): Promise<string> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'audio/m4a',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new DeepgramError(
        `Deepgram API error: ${errorText}`,
        response.status
      );
    }

    const json = await response.json();
    
    const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    
    if (!transcript) {
      throw new DeepgramError('No transcript returned from Deepgram');
    }

    return transcript;
  };

  return withTimeout(
    transcribe(),
    API_CONFIG.LLM_TIMEOUT_MS,
    'Deepgram transcription timed out'
  );
}

/**
 * Get Deepgram usage/credits (for monitoring)
 */
export async function getDeepgramUsage(): Promise<{ balance: number } | null> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.deepgram.com/v1/projects', {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return { balance: data.balance ?? 0 };
  } catch {
    return null;
  }
}
