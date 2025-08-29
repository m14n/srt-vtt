import { parseSrt } from './parser/srt.js';
import { parseVtt } from './parser/vtt.js';
import { Track } from './types.js';
import { detectFormat } from './util/detect.js';

export * from './parser/index.js';
export * from './serializer/index.js';
export * from './util/index.js';
export * from './types.js';

/**
 * Parses a subtitle file (WebVTT or SRT) and returns a Track object.
 *
 * Automatically detects the format and delegates to the appropriate parser.
 *
 * @param input - The subtitle file contents as a string.
 * @returns A Track object with parsed cues and format.
 */
export const parse = (input: string): Track => {
  const fmt = detectFormat(input);
  return fmt === 'vtt' ? parseVtt(input) : parseSrt(input);
};
