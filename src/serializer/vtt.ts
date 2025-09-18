import { CueSettings, Track } from '../types.js';
import { formatVttTime } from '../util/time.js';

/**
 * Serializes a cueSettings object into a string suitable for a VTT timing line.
 *
 * Handles all WebVTT cue settings according to spec:
 * - line: number | 'auto' | percent, with optional lineAlign
 * - position: number | 'auto' | percent, with optional positionAlign
 * - size: percent
 * - align, vertical, region: string values
 *
 * @param settings - The cue settings object to serialize.
 * @returns A string representation of the cue settings for a VTT timing line.
 */
export const serializecueSettings = (settings: CueSettings): string => {
  const tokens: Array<string> = [];

  if (settings.line !== undefined) {
    let val: string;
    if (settings.line === 'auto') {
      val = 'auto';
    } else if (settings.snapToLines === false) {
      val = `${settings.line}%`;
    } else {
      val = String(settings.line);
    }
    if (settings.lineAlign) {
      val += `,${settings.lineAlign}`;
    }
    tokens.push(`line:${val}`);
  }

  if (settings.position !== undefined) {
    let val: string;
    if (settings.position === 'auto') {
      val = 'auto';
    } else {
      val = `${settings.position}%`;
    }
    if (settings.positionAlign && settings.positionAlign !== 'auto') {
      val += `,${settings.positionAlign}`;
    } else if (settings.positionAlign === 'auto') {
      val += ',auto';
    }
    tokens.push(`position:${val}`);
  }

  if (typeof settings.size === 'number') {
    tokens.push(`size:${settings.size}%`);
  }
  if (settings.align) {
    tokens.push(`align:${settings.align}`);
  }
  if (settings.vertical) {
    tokens.push(`vertical:${settings.vertical}`);
  }
  if (settings.region) {
    tokens.push(`region:${settings.region}`);
  }

  return tokens.join(' ');
};

/**
 * Serializes a Track object to a WebVTT string.
 *
 * Each cue is formatted with timing, optional id, text, and settings.
 *
 * @param track - The Track object containing cues to serialize.
 * @returns The WebVTT file contents as a string.
 */
export const serializeVtt = (track: Track): string => {
  const parts: Array<string> = ['WEBVTT', ''];

  for (const cue of track.cues) {
    if (cue.id) parts.push(cue.id);

    const timingLineParts = [formatVttTime(cue.start), '-->', formatVttTime(cue.end)];
    if (cue.cueSettings) {
      timingLineParts.push(serializecueSettings(cue.cueSettings));
    }

    parts.push(timingLineParts.join(' '));
    parts.push(cue.text ?? '');
    parts.push('');
  }

  return parts.join('\n');
};
