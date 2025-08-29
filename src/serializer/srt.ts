import { Track } from '../types.js';
import { formatSrtTime } from '../util/time.js';

/**
 * Serializes a Track object to an SRT string.
 *
 * Each cue is formatted with a numeric index, timing, and text.
 *
 * @param track - The Track object containing cues to serialize.
 * @returns The SRT file contents as a string.
 */
export const serializeSrt = (track: Track): string => {
  const parts: string[] = [];

  for (let i = 0; i < track.cues.length; i++) {
    const cue = track.cues[i];
    parts.push(String(i + 1));
    parts.push(`${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}`);
    parts.push(cue.text ?? '');
    parts.push('');
  }

  return parts.join('\n');
};
