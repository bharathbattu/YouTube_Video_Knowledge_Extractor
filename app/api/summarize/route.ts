/**
 * API Route: /api/summarize
 * Extracts knowledge from YouTube videos using transcripts and LLM summarization
 */

import { NextResponse } from 'next/server';

import { 
  extractVideoId, 
  fetchTranscript, 
  fetchVideoMetadata, 
  getYouTubeAudioFile,
  cleanupAudioFile,
} from '@/lib/youtube';
import { transcribeWithDeepgram } from '@/lib/sttDeepgram';
import { summarizeTranscript } from '@/lib/openrouter';
import { summarizeRequestSchema, formatZodErrors } from '@/lib/validations';
import { generateRequestId } from '@/lib/utils';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants';
import { API_ERROR_CODES } from '@/types/api';

import type { VideoSummary } from '@/types/video';

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  console.log(`[${requestId}] Starting summarize request`);

  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON in request body',
          code: API_ERROR_CODES.VALIDATION_ERROR,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate with Zod schema
    const validation = summarizeRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.INVALID_URL,
          code: API_ERROR_CODES.VALIDATION_ERROR,
          details: formatZodErrors(validation.error),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { youtubeUrl } = validation.data;

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.INVALID_URL,
          code: API_ERROR_CODES.INVALID_URL,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    console.log(`[${requestId}] Processing video: ${videoId}`);

    // Fetch transcript and metadata in parallel
    const [transcript, metadata] = await Promise.all([
      fetchTranscript(videoId),
      fetchVideoMetadata(videoId).catch((err) => {
        console.error(`[${requestId}] Metadata fetch failed:`, err);
        return null;
      }),
    ]);

    let finalTranscript = transcript;

    // Fallback to Deepgram if no transcript available
    if (!finalTranscript) {
      console.log(`[${requestId}] No transcript available, trying Deepgram...`);
      
      if (!process.env.DEEPGRAM_API_KEY) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Server configuration error',
            details: 'DEEPGRAM_API_KEY is missing',
            code: API_ERROR_CODES.INTERNAL_ERROR,
          },
          { status: HTTP_STATUS.INTERNAL_ERROR }
        );
      }

      let audioPath = '';
      try {
        audioPath = await getYouTubeAudioFile(youtubeUrl);
        finalTranscript = await transcribeWithDeepgram(audioPath);
      } catch (error) {
        console.error(`[${requestId}] Transcription failed:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { 
            success: false,
            error: ERROR_MESSAGES.TRANSCRIPTION_FAILED,
            details: errorMessage,
            code: API_ERROR_CODES.TRANSCRIPTION_FAILED,
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      } finally {
        // Always cleanup audio file
        if (audioPath) {
          await cleanupAudioFile(audioPath);
        }
      }
    }

    if (!finalTranscript) {
      return NextResponse.json(
        { 
          success: false,
          error: ERROR_MESSAGES.TRANSCRIPT_UNAVAILABLE,
          code: API_ERROR_CODES.TRANSCRIPT_UNAVAILABLE,
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    console.log(`[${requestId}] Transcript length: ${finalTranscript.length} chars`);

    // Summarize with LLM
    const summaryResponse = await summarizeTranscript(finalTranscript);

    const result: VideoSummary = {
      videoId,
      title: metadata?.title || 'Unknown Video',
      thumbnail: metadata?.thumbnail || null,
      summary: summaryResponse.summary,
    };

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Error after ${duration}ms:`, error);

    // Don't expose internal error details to client
    return NextResponse.json(
      { 
        success: false,
        error: ERROR_MESSAGES.LLM_ERROR,
        code: API_ERROR_CODES.INTERNAL_ERROR,
      },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    );
  }
}
