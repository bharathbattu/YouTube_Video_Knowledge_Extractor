import { describe, it, expect } from 'vitest';
import { extractVideoId, isValidVideoId } from '@/lib/youtube';

describe('YouTube Utilities', () => {
  describe('extractVideoId', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from short YouTube URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from YouTube Shorts URL', () => {
      const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/video';
      expect(extractVideoId(url)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(extractVideoId('')).toBeNull();
    });

    it('should handle URL with extra parameters', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLtest';
      expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
    });
  });

  describe('isValidVideoId', () => {
    it('should return true for valid 11-character ID', () => {
      expect(isValidVideoId('dQw4w9WgXcQ')).toBe(true);
    });

    it('should return true for ID with underscores and hyphens', () => {
      expect(isValidVideoId('abc_def-123')).toBe(true);
    });

    it('should return false for ID with less than 11 characters', () => {
      expect(isValidVideoId('abc123')).toBe(false);
    });

    it('should return false for ID with more than 11 characters', () => {
      expect(isValidVideoId('abc123456789012')).toBe(false);
    });

    it('should return false for ID with special characters', () => {
      expect(isValidVideoId('abc!@#$%^&*')).toBe(false);
    });
  });
});
