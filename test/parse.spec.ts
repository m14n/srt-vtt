import { describe, expect, it } from 'vitest';

import { parse } from '../src/index.js';

describe('parse', () => {
  it('parses a minimal VTT file', () => {
    const input = 'WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nHello world!';
    const result = parse(input);
    expect(result.format).toBe('vtt');
    expect(result.cues.length).toBe(1);
    expect(result.cues[0].text).toBe('Hello world!');
  });

  it('parses a minimal SRT file', () => {
    const input = '1\n00:00:01,000 --> 00:00:04,000\nHello world!';
    const result = parse(input);
    expect(result.format).toBe('srt');
    expect(result.cues.length).toBe(1);
    expect(result.cues[0].text).toBe('Hello world!');
  });

  it('detects format automatically', () => {
    expect(parse('WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nText').format).toBe('vtt');
    expect(parse('1\n00:00:01,000 --> 00:00:04,000\nText').format).toBe('srt');
  });

  it('throws on empty input', () => {
    expect(() => parse('')).toThrow();
  });
});
