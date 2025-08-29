import { describe, expect, it } from 'vitest';

import { Cue, Track, serializeSrt } from '../../src/index.js';

describe('serializeSrt', () => {
  it('serializes a minimal track', () => {
    const track: Track = {
      cues: [{ start: 1000, end: 4000, text: 'Hello world!' }],
      format: 'srt',
    };
    const out = serializeSrt(track);
    expect(out).toContain('1');
    expect(out).toContain('00:00:01,000 --> 00:00:04,000');
    expect(out).toContain('Hello world!');
  });

  it('serializes multiple cues', () => {
    const track: Track = {
      cues: [
        { start: 1000, end: 2000, text: 'First' },
        { start: 3000, end: 4000, text: 'Second' },
      ],
      format: 'srt',
    };
    const out = serializeSrt(track);
    expect(out).toContain('1');
    expect(out).toContain('2');
    expect(out).toContain('First');
    expect(out).toContain('Second');
  });

  it('serializes cue with empty text', () => {
    const track: Track = {
      cues: [{ start: 1000, end: 4000, text: '' }],
      format: 'srt',
    };
    expect(serializeSrt(track)).toContain('00:00:01,000 --> 00:00:04,000');
  });

  it('serializes cue with no text property', () => {
    const track: Track = {
      cues: [{ start: 1000, end: 4000 } as Cue],
      format: 'srt',
    };
    expect(serializeSrt(track)).toContain('00:00:01,000 --> 00:00:04,000');
  });
});
