import { describe, expect, it } from 'vitest';

import {
  formatSrtTime,
  formatVttTime,
  parseSrtTimestamp,
  parseVttTimestamp,
} from '../../src/index.js';

describe('time util', () => {
  describe('formatSrtTime()', () => {
    it('formats 0 ms as 00:00:00,000', () => {
      expect(formatSrtTime(0)).toBe('00:00:00,000');
    });

    it('formats 3723456 ms as 01:02:03,456', () => {
      expect(formatSrtTime(3723456)).toBe('01:02:03,456');
    });

    it('formats negative ms as 00:00:00,000', () => {
      expect(formatSrtTime(-100)).toBe('00:00:00,000');
    });
  });

  describe('formatVttTime()', () => {
    it('formats 0 ms as 00:00:00.000', () => {
      expect(formatVttTime(0)).toBe('00:00:00.000');
    });

    it('formats 3723456 ms as 01:02:03.456', () => {
      expect(formatVttTime(3723456)).toBe('01:02:03.456');
    });

    it('formats negative ms as 00:00:00.000', () => {
      expect(formatVttTime(-100)).toBe('00:00:00.000');
    });
  });

  describe('parseSrtTimestamp()', () => {
    it('parses HH:MM:SS,mmm format', () => {
      expect(parseSrtTimestamp('01:02:03,456')).toBe(3723456);
    });

    it('throws on invalid format', () => {
      expect(() => parseSrtTimestamp('not-a-timestamp')).toThrow();
      expect(() => parseSrtTimestamp('01:02:03.456')).toThrow();
      expect(() => parseSrtTimestamp('01:02')).toThrow();
    });

    it('parses edge case: 00:00:00,000', () => {
      expect(parseSrtTimestamp('00:00:00,000')).toBe(0);
    });
  });

  describe('parseVttTimestamp()', () => {
    it('parses HH:MM:SS.mmm format', () => {
      expect(parseVttTimestamp('01:02:03.456')).toBe(3723456);
    });

    it('parses MM:SS.mmm format', () => {
      expect(parseVttTimestamp('02:03.456')).toBe(123456);
    });

    it('throws on invalid format', () => {
      expect(() => parseVttTimestamp('not-a-timestamp')).toThrow();
      expect(() => parseVttTimestamp('01:02:03,456')).toThrow();
      expect(() => parseVttTimestamp('01:02')).toThrow();
    });

    it('parses edge case: 00:00:00.000', () => {
      expect(parseVttTimestamp('00:00:00.000')).toBe(0);
    });

    it('parses edge case: 00:00.000', () => {
      expect(parseVttTimestamp('00:00.000')).toBe(0);
    });
  });
});
