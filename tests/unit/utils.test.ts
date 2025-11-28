import { describe, it, expect } from 'vitest';
import {
  cn,
  sleep,
  truncateText,
  estimateTokens,
  generateRequestId,
  safeJsonParse,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toBe('foo baz');
    });

    it('should handle tailwind conflicts', () => {
      const result = cn('p-4', 'p-8');
      expect(result).toBe('p-8');
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than max length', () => {
      const result = truncateText('Hello', 10);
      expect(result).toBe('Hello');
    });

    it('should truncate text longer than max length', () => {
      const result = truncateText('Hello World', 8);
      expect(result).toBe('Hello...');
    });

    it('should handle empty string', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens based on character count', () => {
      const text = 'This is a test string with some words';
      const estimate = estimateTokens(text);
      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(text.length);
    });
  });

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      expect(id1).not.toBe(id2);
    });

    it('should start with req_ prefix', () => {
      const id = generateRequestId();
      expect(id.startsWith('req_')).toBe(true);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"foo": "bar"}', { default: true });
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('invalid json', fallback);
      expect(result).toEqual(fallback);
    });

    it('should handle JSON wrapped in markdown code blocks', () => {
      const result = safeJsonParse('```json\n{"foo": "bar"}\n```', { default: true });
      expect(result).toEqual({ foo: 'bar' });
    });
  });
});
