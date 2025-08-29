import { Cue, Track } from '../types.js';
import { stripBom } from '../util/text.js';
import { parseSrtTimestamp } from '../util/time.js';

/**
 * Parses an SRT file into a Track object containing cues and format.
 *
 * @param input - The SRT file contents as a string.
 * @returns A Track object with parsed cues and format 'srt'.
 */
export const parseSrt = (input: string): Track => {
  const src = stripBom(input).replace(/\r/g, '');
  const blocks = src.split(/\n{2,}/);
  const cues: Cue[] = [];

  for (const block of blocks) {
    const lines = block
      .split(/\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      continue;
    }

    // SRT: [index], timing, text...
    let timingIdx = 0;
    if (/^\d+$/.test(lines[0])) {
      timingIdx = 1;
    }

    const timingLine = lines[timingIdx];
    const results =
      /^(\d{2}:\d{2}:\d{2},\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2},\d{3})$/.exec(
        timingLine,
      );
    if (!results) {
      continue;
    }

    const start = parseSrtTimestamp(results[1]);
    const end = parseSrtTimestamp(results[2]);
    const text = lines.slice(timingIdx + 1).join('\n');

    cues.push({ start, end, text });
  }

  return { cues, format: 'srt' };
};
