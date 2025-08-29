import { describe, expect, it } from 'vitest';

import { parseVtt } from '../../src/index.js';

describe('parser', () => {
  describe('parseVtt()', () => {
    it('parses a minimal valid VTT file', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000 line:40%,center position:90%,line-right',
        'Hello world!',
      ].join('\n');
      const result = parseVtt(input);
      expect(result.format).toBe('vtt');
      expect(result.cues.length).toBe(1);
      expect(result.cues[0].start).toBe(1000);
      expect(result.cues[0].end).toBe(4000);
      expect(result.cues[0].text).toBe('Hello world!');
    });

    it('throws on missing WEBVTT header', () => {
      const input = ['00:00:01.000 --> 00:00:04.000', 'Hello world!'].join(
        '\n',
      );
      expect(() => parseVtt(input)).toThrow();
    });

    it('gracefully ignores STYLE blocks', () => {
      const input = [
        'WEBVTT',
        '',
        'STYLE',
        '::cue {',
        '  background-image: linear-gradient(to bottom, dimgray, lightgray);',
        '  color: papayawhip;',
        '}',
        '/* Style blocks cannot use blank lines nor "dash dash greater than" */',
        '',
        '00:00:01.000',
        'Hello world!',
      ].join('\n');
      const result = parseVtt(input);
      expect(result.cues.length).toBe(0);
    });

    it('gracefully ignores cues with missing cue end timestamp', () => {
      const input = ['WEBVTT', '', '00:00:01.000', 'Hello world!'].join('\n');
      const result = parseVtt(input);
      expect(result.cues.length).toBe(0);
    });

    it('parses cue with id and settings', () => {
      const input = [
        'WEBVTT',
        '',
        'id1',
        '00:00:01.000 --> 00:00:04.000 align:center size:80%',
        'Hello again!',
      ].join('\n');
      const result = parseVtt(input);
      expect(result.cues[0].id).toBe('id1');
      expect(result.cues[0].cueSettings).toBeDefined();
      expect(result.cues[0].cueSettings?.align).toBe('center');
      expect(result.cues[0].cueSettings?.size).toBe(80);
    });

    it('skips NOTE blocks', () => {
      const input = [
        'WEBVTT',
        '',
        'NOTE',
        'This file was written by Jill. I hope',
        'you enjoy reading it. Some things to',
        'bear in mind:',
        '- I was lip-reading, so the cues may',
        'not be 100% accurate',
        '- I didn’t pay too close attention to',
        'when the cues should start or end.',
        '',
        '00:00:01.000 --> 00:00:04.000',
        'Text after first note',
        '',
        'NOTE check next cue',
        '',
        '00:00:05.000 --> 00:00:08.000',
        'Text after second note',
      ].join('\n');
      const result = parseVtt(input);
      expect(result.cues.length).toBe(2);
      expect(result.cues[0].text).toBe('Text after first note');
      expect(result.cues[1].text).toBe('Text after second note');
    });

    it('skips NOTE blocks following WEBVTT header', () => {
      const input = [
        'WEBVTT',
        'NOTE foo bar baz',
        '',
        '00:00:01.000 --> 00:00:04.000',
        'Hello world!',
      ].join('\n');
      const result = parseVtt(input);
      expect(result.cues.length).toBe(1);
    });

    it('handles multiple cues', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000',
        'First',
        '',
        '00:00:05.000 --> 00:00:06.000 line:-1',
        'Second',
      ].join('\n');
      const result = parseVtt(input);
      expect(result.cues.length).toBe(2);
      expect(result.cues[0].text).toBe('First');
      expect(result.cues[1].text).toBe('Second');
      expect(result.cues[1].cueSettings).toBeDefined();
      expect(result.cues[1].cueSettings?.line).toBe(-1);
    });

    it('parses all supported cue settings', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000 align:end vertical:rl size:75% region:foo line:40%,center position:90%,line-right',
        'Cue with all settings',
      ].join('\n');
      const result = parseVtt(input);
      const settings = result.cues[0].cueSettings;
      expect(settings).toBeDefined();
      expect(settings?.align).toBe('end');
      expect(settings?.vertical).toBe('rl');
      expect(settings?.size).toBe(75);
      expect(settings?.region).toBe('foo');
      expect(settings?.line).toBe(40);
      expect(settings?.lineAlign).toBe('center');
      expect(settings?.position).toBe(90);
      expect(settings?.positionAlign).toBe('line-right');
    });

    it('parses cue settings with auto and percent values', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000 line:auto position:auto',
        'Cue with auto settings',
      ].join('\n');
      const result = parseVtt(input);
      const settings = result.cues[0].cueSettings;
      expect(settings?.line).toBe('auto');
      expect(settings?.position).toBe('auto');
    });

    it('ignores invalid cue settings values', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000 align align:bogus vertical:xx size:999 region: line:abc,foo position:abc,foo',
        'Cue with invalid settings',
      ].join('\n');
      const result = parseVtt(input);
      const settings = result.cues[0].cueSettings;
      expect(settings?.align).toBeUndefined();
      expect(settings?.vertical).toBeUndefined();
      expect(settings?.size).toBeUndefined();
      expect(settings?.region).toBeUndefined();
      expect(settings?.line).toBeUndefined();
      expect(settings?.lineAlign).toBeUndefined();
      expect(settings?.position).toBeUndefined();
      expect(settings?.positionAlign).toBeUndefined();
    });

    it('ignores invalid cue line setting', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000 line:a position:50%',
      ].join('\n');
      const result = parseVtt(input);
      const settings = result.cues[0].cueSettings;
      expect(settings?.line).toBe(undefined);
      expect(settings?.position).toBe(50);
    });

    it('handles missing cue settings gracefully', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000',
        'Cue with no settings',
      ].join('\n');
      const result = parseVtt(input);
      expect(result.cues[0].cueSettings).toBeUndefined();
    });

    it('clamps size and percent values to 0-100', () => {
      const input = [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:04.000 size:150 line:200% position:101%',
        'Clamped values',
      ].join('\n');
      const result = parseVtt(input);
      const settings = result.cues[0].cueSettings;
      expect(settings?.size).toBe(undefined);
      expect(settings?.line).toBe(100);
      expect(settings?.position).toBe(100);
    });
  });
});
