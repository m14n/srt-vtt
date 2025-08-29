import { describe, expect, it } from 'vitest';

import { parseSrt } from '../../src/index.js';

describe('parser', () => {
  describe('parseSrt()', () => {
    it('parses a minimal valid SRT file', () => {
      const input = '1\n00:00:01,000 --> 00:00:04,000\nHello world!';
      const result = parseSrt(input);
      expect(result.format).toBe('srt');
      expect(result.cues.length).toBe(1);
      expect(result.cues[0].start).toBe(1000);
      expect(result.cues[0].end).toBe(4000);
      expect(result.cues[0].text).toBe('Hello world!');
    });

    it('parses multiple cues', () => {
      const input =
        '1\n00:00:01,000 --> 00:00:02,000\nFirst\n\n2\n00:00:03,000 --> 00:00:04,000\nSecond';
      const result = parseSrt(input);
      expect(result.cues.length).toBe(2);
      expect(result.cues[0].text).toBe('First');
      expect(result.cues[1].text).toBe('Second');
    });

    it('parses cue with multiline text', () => {
      const input = '1\n00:00:01,000 --> 00:00:04,000\nHello\nWorld!';
      const result = parseSrt(input);
      expect(result.cues[0].text).toBe('Hello\nWorld!');
    });

    it('skips blocks without valid timing', () => {
      const input =
        '1\ninvalid timing\nText\n\n2\n00:00:03,000 --> 00:00:04,000\nSecond';
      const result = parseSrt(input);
      expect(result.cues.length).toBe(1);
      expect(result.cues[0].text).toBe('Second');
    });

    it('handles missing index line', () => {
      const input = '00:00:01,000 --> 00:00:04,000\nHello world!';
      const result = parseSrt(input);
      expect(result.cues.length).toBe(1);
      expect(result.cues[0].text).toBe('Hello world!');
    });

    it('handles empty input', () => {
      const input = '';
      const result = parseSrt(input);
      expect(result.cues.length).toBe(0);
    });

    it('handles BOM and whitespace', () => {
      const input = '\uFEFF1\n00:00:01,000 --> 00:00:04,000\nHello world!';
      const result = parseSrt(input);
      expect(result.cues.length).toBe(1);
      expect(result.cues[0].text).toBe('Hello world!');
    });
  });
});
