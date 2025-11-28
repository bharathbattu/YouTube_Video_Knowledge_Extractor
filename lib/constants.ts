/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1/chat/completions',
  DEEPGRAM_BASE_URL: 'https://api.deepgram.com/v1/listen',
  DEFAULT_MODEL: 'meta-llama/llama-3.3-70b-instruct:free',
  REQUEST_TIMEOUT_MS: 60000, // 60 seconds
  LLM_TIMEOUT_MS: 120000, // 120 seconds for LLM responses
} as const;

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  REQUESTS_PER_MINUTE: 10,
  WINDOW_SECONDS: 60,
} as const;

// Transcript Configuration
export const TRANSCRIPT_CONFIG = {
  MAX_CHARS: 12000, // ~3000 tokens
  MAX_TOKENS: 3000,
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  MAX_FILE_SIZE_MB: 100,
  SUPPORTED_FORMATS: ['m4a', 'mp3', 'wav', 'ogg', 'webm'] as const,
  YT_DLP_FORMAT: 'bestaudio[ext=m4a]',
} as const;

// LLM System Prompt
export const SYSTEM_PROMPT = `
You are an expert knowledge extractor and helpful AI assistant.
Your task is to create a clean, concise, and easy-to-understand summary of the provided YouTube video transcript.

Please format your response as a friendly chat-style message using Markdown.
- Use clear headings, bullet points, and bold text to make it readable.
- Start with a brief 1-sentence overview.
- Then provide the key takeaways in a bulleted list.
- End with a short concluding thought or "Why this matters" section if appropriate.
- Keep the tone conversational but professional.
- Do NOT output JSON. Just return the Markdown text directly.
`.trim();

// Error Messages (user-facing)
export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid YouTube video URL',
  TRANSCRIPT_UNAVAILABLE: 'Could not retrieve transcript for this video',
  TRANSCRIPTION_FAILED: 'Failed to generate transcript from video audio',
  RATE_LIMITED: 'Too many requests. Please try again in a minute.',
  LLM_ERROR: 'AI summarization failed. Please try again later.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
  API_KEY_MISSING: 'Server configuration error',
  TIMEOUT: 'The request took too long. Please try again.',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// App Metadata
export const APP_METADATA = {
  TITLE: 'YouTube Knowledge Extractor',
  DESCRIPTION: 'Convert YouTube videos into clear learning notes',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;
