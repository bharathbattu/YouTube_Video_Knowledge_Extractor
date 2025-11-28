import { describe, it, expect } from 'vitest';
import { summarizeRequestSchema, videoIdSchema, formatZodErrors } from '@/lib/validations';
import { ZodError } from 'zod';

describe('Validation Schemas', () => {
  describe('summarizeRequestSchema', () => {
    it('should accept valid YouTube watch URL', () => {
      const result = summarizeRequestSchema.safeParse({
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid youtu.be URL', () => {
      const result = summarizeRequestSchema.safeParse({
        youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
      });
      expect(result.success).toBe(true);
    });

    it('should accept YouTube Shorts URL', () => {
      const result = summarizeRequestSchema.safeParse({
        youtubeUrl: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-YouTube URL', () => {
      const result = summarizeRequestSchema.safeParse({
        youtubeUrl: 'https://example.com/video',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = summarizeRequestSchema.safeParse({
        youtubeUrl: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing youtubeUrl', () => {
      const result = summarizeRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('videoIdSchema', () => {
    it('should accept valid 11-character video ID', () => {
      const result = videoIdSchema.safeParse('dQw4w9WgXcQ');
      expect(result.success).toBe(true);
    });

    it('should reject video ID with wrong length', () => {
      const result = videoIdSchema.safeParse('abc');
      expect(result.success).toBe(false);
    });

    it('should reject video ID with invalid characters', () => {
      const result = videoIdSchema.safeParse('abc!@#$%^&*');
      expect(result.success).toBe(false);
    });
  });

  describe('formatZodErrors', () => {
    it('should format Zod errors into a readable object', () => {
      const result = summarizeRequestSchema.safeParse({});
      
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toHaveProperty('youtubeUrl');
        expect(Array.isArray(formatted.youtubeUrl)).toBe(true);
      }
    });
  });
});
