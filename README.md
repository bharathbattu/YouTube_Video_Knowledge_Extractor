# YouTube Video Knowledge Extractor

A powerful, AI-driven application that transforms YouTube videos into concise, structured study notes and summaries.

## Overview

The YouTube Video Knowledge Extractor is designed to help students, researchers, and professionals quickly digest the content of long-form video content. By simply pasting a YouTube URL, the application extracts the transcript (or generates one using advanced speech-to-text), processes it through a Large Language Model (LLM), and presents a clear, organized summary of the key points.

## Key Features

*   **Smart Transcript Extraction**: Automatically retrieves existing captions from YouTube.
*   **Audio Transcription Fallback**: If no captions are available, it downloads the audio and uses Deepgram's Nova-2 model for high-accuracy transcription.
*   **AI Summarization**: Uses OpenRouter (powered by Llama 3.3 70B) to generate intelligent, structured summaries.
*   **Rate Limiting**: Built-in protection against API abuse using Upstash Redis.
*   **Modern UI**: A clean, responsive interface built with Next.js and Tailwind CSS.
*   **Notebook Style Results**: Summaries are presented in an easy-to-read format with copy and share functionality.

## Tech Stack

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI/LLM**: OpenRouter (Llama 3.3)
*   **Transcription**: Deepgram
*   **Rate Limiting**: Upstash Redis
*   **Testing**: Vitest (Unit) & Playwright (E2E)

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (v18 or higher)
*   npm or yarn

You will also need API keys for the following services:
*   [OpenRouter](https://openrouter.ai/) (for LLM summarization)
*   [Deepgram](https://deepgram.com/) (for audio transcription fallback)
*   [Upstash](https://upstash.com/) (for Redis rate limiting)

## Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd youtube-knowledge-extractor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env.local` file in the root directory and add your API keys:

    ```env
    # AI Services
    OPENROUTER_API_KEY=your_openrouter_key
    DEEPGRAM_API_KEY=your_deepgram_key

    # Rate Limiting (Upstash Redis)
    UPSTASH_REDIS_REST_URL=your_upstash_url
    UPSTASH_REDIS_REST_TOKEN=your_upstash_token

    # Optional Configuration
    OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  Copy the URL of a YouTube video you want to summarize.
2.  Paste the URL into the input field on the home page.
3.  Click "Summarize Video".
4.  Wait for the process to complete (this may take a few moments if audio transcription is required).
5.  Read, copy, or share your generated study notes.

## Development

### Running Tests

*   **Unit Tests**: Run `npm run test` to execute Vitest unit tests.
*   **E2E Tests**: Run `npm run test:e2e` to execute Playwright end-to-end tests.

### Linting and Formatting

*   **Lint**: `npm run lint`
*   **Format**: `npm run format`

## License

This project is licensed under the MIT License.
