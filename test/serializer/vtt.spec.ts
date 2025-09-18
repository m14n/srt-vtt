import { describe, expect, it } from 'vitest';

import { Cue, CueSettings, Track, serializeVtt, serializecueSettings } from '../../src/index.js';

describe('serializer', () => {
  describe('serializeVtt()', () => {
    it('serializes a minimal track', () => {
      const track: Track = {
        cues: [{ start: 1000, end: 4000, text: 'Hello world!' }],
        format: 'vtt',
      };
      expect(serializeVtt(track)).toContain('WEBVTT');
      expect(serializeVtt(track)).toContain('00:00:01.000 --> 00:00:04.000');
      expect(serializeVtt(track)).toContain('Hello world!');
    });

    it('serializes cue with id and settings', () => {
      const track: Track = {
        cues: [
          {
            id: 'id1',
            start: 1000,
            end: 4000,
            text: 'Hello!',
            cueSettings: { align: 'center', size: 80 },
          },
        ],
        format: 'vtt',
      };
      const out = serializeVtt(track);
      expect(out).toContain('id1');
      expect(out).toContain('align:center');
      expect(out).toContain('size:80');
    });

    it('serializes multiple cues', () => {
      const track: Track = {
        cues: [
          { start: 1000, end: 2000, text: 'First' },
          { start: 3000, end: 4000, text: 'Second' },
        ],
        format: 'vtt',
      };
      const out = serializeVtt(track);
      expect(out).toEqual(
        'WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nFirst\n\n00:00:03.000 --> 00:00:04.000\nSecond\n',
      );
    });

    it('serializes cue with empty text', () => {
      const track: Track = {
        cues: [{ start: 1000, end: 4000, text: '' }],
        format: 'vtt',
      };
      expect(serializeVtt(track)).toContain('00:00:01.000 --> 00:00:04.000');
    });

    it('serializes cue with no text property', () => {
      const track: Track = {
        cues: [{ start: 1000, end: 4000 } as Cue],
        format: 'vtt',
      };
      expect(serializeVtt(track)).toContain('00:00:01.000 --> 00:00:04.000');
    });
  });

  describe('serializecueSettings()', () => {
    it('serializes line with auto', () => {
      expect(serializecueSettings({ line: 'auto' })).toBe('line:auto');
    });

    it('serializes line with percent and lineAlign', () => {
      expect(
        serializecueSettings({
          line: 40,
          lineAlign: 'center',
          snapToLines: false,
        }),
      ).toBe('line:40%,center');
    });

    it('serializes line with number and lineAlign', () => {
      expect(
        serializecueSettings({
          line: 2,
          lineAlign: 'end',
          snapToLines: true,
        }),
      ).toBe('line:2,end');
    });

    it('serializes position with auto', () => {
      expect(serializecueSettings({ position: 'auto' })).toBe('position:auto');
    });

    it('serializes position with percent and positionAlign', () => {
      expect(serializecueSettings({ position: 90, positionAlign: 'line-right' })).toBe(
        'position:90%,line-right',
      );
    });

    it('serializes position with auto positionAlign', () => {
      expect(serializecueSettings({ position: 90, positionAlign: 'auto' })).toBe(
        'position:90%,auto',
      );
    });

    it('serializes size', () => {
      expect(serializecueSettings({ size: 80 })).toBe('size:80%');
    });

    it('serializes align, vertical, region', () => {
      expect(
        serializecueSettings({
          align: 'center',
          region: 'foo',
          vertical: 'rl',
        }),
      ).toBe('align:center vertical:rl region:foo');
    });

    it('serializes all settings together', () => {
      const settings: CueSettings = {
        align: 'end',
        line: 40,
        lineAlign: 'center',
        position: 90,
        positionAlign: 'line-right',
        region: 'foo',
        size: 80,
        snapToLines: false,
        vertical: 'rl',
      };
      expect(serializecueSettings(settings)).toBe(
        'line:40%,center position:90%,line-right size:80% align:end vertical:rl region:foo',
      );
    });

    it('returns empty string for empty settings', () => {
      expect(serializecueSettings({})).toBe('');
    });
  });
});
