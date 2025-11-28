/**
 * OpenRouter LLM integration
 */

import type { LLMSummaryResponse } from '@/types/video';
import { withTimeout, safeJsonParse } from '@/lib/utils';
import { API_CONFIG, SYSTEM_PROMPT, TRANSCRIPT_CONFIG } from '@/lib/constants';

/**
 * Custom error for LLM operations
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Get the configured model or default
 */
function getModel(): string {
  return process.env.OPENROUTER_MODEL || API_CONFIG.DEFAULT_MODEL;
}

/**
 * Get the referer URL for OpenRouter
 */
function getReferer(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Summarize transcript using OpenRouter LLM
 */
export async function summarizeTranscript(
  transcript: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<LLMSummaryResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new LLMError('OPENROUTER_API_KEY is missing', undefined, 'API_KEY_MISSING');
  }

  const { maxTokens = 1024, temperature = 0.7 } = options;

  // Truncate transcript to stay within token limits
  const truncatedTranscript = transcript.length > TRANSCRIPT_CONFIG.MAX_CHARS
    ? transcript.slice(0, TRANSCRIPT_CONFIG.MAX_CHARS) + '...'
    : transcript;

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: truncatedTranscript },
  ];

  const callLLM = async (): Promise<LLMSummaryResponse> => {
    const response = await fetch(API_CONFIG.OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': getReferer(),
        'X-Title': 'YouTube Knowledge Extractor',
      },
      body: JSON.stringify({
        model: getModel(),
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw new LLMError(
        `OpenRouter API failed: ${response.status}`,
        response.status,
        'API_ERROR'
      );
    }

    const data: OpenRouterResponse = await response.json();

    if (data.error) {
      throw new LLMError(
        data.error.message,
        undefined,
        data.error.code
      );
    }

    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new LLMError('No content received from LLM', undefined, 'EMPTY_RESPONSE');
    }

    // Return the raw markdown content
    return {
      summary: rawContent.trim(),
    };
  };

  return withTimeout(
    callLLM(),
    API_CONFIG.LLM_TIMEOUT_MS,
    'LLM summarization timed out'
  );
}

/**
 * Check if OpenRouter API is configured and accessible
 */
export async function checkOpenRouterHealth(): Promise<boolean> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
