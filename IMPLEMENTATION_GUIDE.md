# Implementation Guide
## YouTube Video Knowledge Extractor - Technical Implementation Details

**Version:** 2.1.0

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Security Implementation](#security-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Type System](#type-system)
6. [Testing Strategy](#testing-strategy)
7. [Configuration Reference](#configuration-reference)

---

## Architecture Overview

### High-Level Flow

The application follows a streamlined serverless architecture using Next.js API routes.

1.  **Client Side (React)**: User submits a YouTube URL.
2.  **Middleware**: Intercepts requests for rate limiting and security header injection.
3.  **API Route (/api/summarize)**: The central orchestration point.
    *   Validates the input URL.
    *   Attempts to fetch a transcript directly via YouTube APIs.
    *   **Fallback**: If no transcript exists, it downloads the audio (using `yt-dlp`) and transcribes it using Deepgram.
    *   Sends the text to OpenRouter (LLM) for summarization.
4.  **Response**: Returns a structured JSON object containing the video metadata and the generated summary.

### Request Lifecycle

1.  **Client** submits YouTube URL.
2.  **Middleware** checks rate limits (Upstash Redis) & adds security headers.
3.  **API Route** validates input with Zod schemas.
4.  **YouTube Service** fetches transcript or downloads audio.
5.  **Deepgram Service** (fallback) transcribes audio if necessary.
6.  **OpenRouter Service** generates a structured summary from the text.
7.  **Response** returned to the client.

---

## Security Implementation

### Rate Limiting (middleware.ts)

The application uses Upstash Redis to implement a sliding window rate limiter. This prevents abuse of the expensive AI and transcription APIs.

*   **Limit**: 10 requests per 60 seconds.
*   **Identifier**: Composite key of IP address and request path.
*   **Headers**: Returns standard `X-RateLimit-*` headers to the client.

### Security Headers

The middleware injects the following headers into every response:

*   `Strict-Transport-Security`: Forces HTTPS.
*   `X-Frame-Options`: Prevents clickjacking (SAMEORIGIN).
*   `X-Content-Type-Options`: Prevents MIME sniffing.
*   `Permissions-Policy`: Disables sensitive features like camera and microphone.

### Input Validation (lib/validations.ts)

All incoming data is validated using Zod schemas before processing.

*   **URL Validation**: Ensures the input is a valid YouTube URL (standard, short, or embed formats).
*   **Video ID**: Validates the extracted 11-character video ID against a regex pattern.

### URL Sanitization (lib/youtube.ts)

Before passing URLs to the audio downloader (`yt-dlp`), the application checks them against a strict allowlist of regex patterns to prevent command injection or arbitrary file access.

---

## Backend Implementation

### YouTube Service (lib/youtube.ts)

Handles all interactions with YouTube content.

*   **extractVideoId**: Parses video IDs from various YouTube URL formats.
*   **fetchVideoMetadata**: Retrieves title and thumbnail information.
*   **fetchTranscript**: Attempts to retrieve existing captions/transcripts.
*   **getYouTubeAudioFile**: Downloads audio as a temporary file using `yt-dlp` (only when necessary).
*   **cleanupAudioFile**: Safely removes temporary audio files after processing.

### Deepgram Service (lib/sttDeepgram.ts)

Provides fallback transcription capabilities when YouTube captions are unavailable.

*   **transcribeWithDeepgram**: Uploads the temporary audio file to Deepgram's Nova-2 model for high-accuracy transcription.
*   **File Size Check**: Enforces a maximum file size limit before upload.

### OpenRouter Service (lib/openrouter.ts)

Interfaces with Large Language Models for content summarization.

*   **summarizeTranscript**: Sends the transcript to the configured LLM (default: Llama 3.3 70B).
*   **Token Management**: Truncates input text to ensure it fits within the model's context window.
*   **Error Handling**: Includes timeouts and safe JSON parsing for the model's response.

### Utility Functions (lib/utils.ts)

*   **retry**: Implements exponential backoff for network operations.
*   **withTimeout**: Wraps promises to enforce strict execution time limits.
*   **safeJsonParse**: robustly parses JSON, handling potential markdown code blocks in LLM responses.

---

## Frontend Implementation

### Component Hierarchy

*   **Page (Server Component)**: Main layout container.
    *   **VideoForm (Client Component)**: Handles user input and submission state.
        *   **Input**: Custom styled input field.
        *   **Button**: Interactive submit button with loading states.
        *   **ResultSkeleton**: Loading placeholder.
        *   **VideoResult**: Displays the final summary.

### State Management (hooks/use-video-extractor.ts)

The `useVideoExtractor` hook encapsulates the complex state logic for the extraction process.

*   **State**: Manages `isLoading`, `error`, `result`, and `progress`.
*   **Actions**:
    *   `extract(url)`: Initiates the API request and handles the response.
    *   `cancel()`: Aborts the in-flight fetch request using `AbortController`.
    *   `reset()`: Clears the current state to allow for a new search.

### VideoResult Component

Displays the generated summary in a clean, notebook-style layout.

*   **Clipboard Integration**: Uses the native `navigator.clipboard` API to allow users to copy the summary.
*   **Sharing**: Uses the Web Share API (where available) to share the result, falling back to clipboard copy.

---

## Type System

The application uses TypeScript interfaces to ensure type safety across the stack.

### Core Types (types/video.ts)

*   **VideoMetadata**: Basic info (title, thumbnail).
*   **VideoSummary**: The complete result object (id, title, thumbnail, summary text).

### API Types (types/api.ts)

*   **ApiResponse**: Discriminated union of `ApiSuccessResponse` and `ApiErrorResponse`.
*   **API_ERROR_CODES**: Constant values for consistent error handling (e.g., `TRANSCRIPT_UNAVAILABLE`, `RATE_LIMITED`).

---

## Testing Strategy

### Unit Tests (Vitest)

Located in `tests/unit/`.
*   **Utils**: Verifies utility functions like class merging and sleep.
*   **Validations**: Tests Zod schemas against valid and invalid inputs.
*   **YouTube**: Tests video ID extraction logic against various URL formats.

### E2E Tests (Playwright)

Located in `tests/e2e/`.
*   **Home Page**: Verifies the presence of key elements (heading, input, button).
*   **Interactions**: Tests form submission, button states (disabled/enabled), and error handling for invalid URLs.
*   **Responsiveness**: Checks layout on mobile viewports.

---

## Configuration Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | API key for OpenRouter LLM access. |
| `OPENROUTER_MODEL` | No | Specific model to use (default: `llama-3.3-70b-instruct`). |
| `DEEPGRAM_API_KEY` | No | API key for Deepgram (required for audio fallback). |
| `UPSTASH_REDIS_REST_URL` | No | URL for Upstash Redis (required for rate limiting). |
| `UPSTASH_REDIS_REST_TOKEN` | No | Token for Upstash Redis. |

### Constants (lib/constants.ts)

*   **Timeouts**: 60s for general requests, 120s for LLM operations.
*   **Rate Limits**: 10 requests per minute.
*   **Transcript Limits**: ~12,000 characters (approx. 3,000 tokens) context window.
*   **Audio Limits**: 100MB max file size for uploads.
