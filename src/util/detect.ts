import { TrackFormat } from '../types.js';
import { stripBom } from './text.js';

/**
 * Detects the subtitle format (WebVTT or SRT) from the input string.
 *
 * Returns 'vtt' if the input starts with 'WEBVTT',
 * or if it does not match SRT timing, otherwise returns 'srt'.
 *
 * @param input - The subtitle file contents as a string.
 * @returns The detected format: 'vtt' or 'srt'.
 */
export const detectFormat = (input: string): TrackFormat => {
  const src = stripBom(input).trimStart();
  if (src.startsWith('WEBVTT')) {
    return 'vtt';
  }

  const hasSrtTime = /(?:^|\n)\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}/.test(src);
  return hasSrtTime ? 'srt' : 'vtt';
};
