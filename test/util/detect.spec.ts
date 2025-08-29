import { describe, expect, it } from 'vitest';

import { detectFormat } from '../../src/index.js';

describe('detectFormat()', () => {
  it('detects WebVTT by header', () => {
    expect(detectFormat('WEBVTT\n00:00:01.000 --> 00:00:04.000')).toBe('vtt');
  });

  it('detects SRT by timing line', () => {
    expect(detectFormat('00:00:01,000 --> 00:00:04,000\nHello')).toBe('srt');
    expect(detectFormat('\n00:00:01,000 --> 00:00:04,000')).toBe('srt');
  });

  it('returns vtt for input without SRT timing', () => {
    expect(detectFormat('Some random text')).toBe('vtt');
  });

  it('handles BOM and whitespace', () => {
    expect(detectFormat('\uFEFFWEBVTT\n')).toBe('vtt');
    expect(detectFormat('   WEBVTT\n')).toBe('vtt');
  });

  it('returns vtt for empty input', () => {
    expect(detectFormat('')).toBe('vtt');
  });

  it('returns vtt for input with only SRT-like text but not timing', () => {
    expect(detectFormat('00:00:01.000 --> 00:00:04.000')).toBe('vtt');
  });
});
