import { Cue, CueAlign, CueLineAlign, CuePositionAlign, CueSettings, Track } from '../types.js';
import { clamp0to100, parseVttTimestamp, stripBom } from '../util/index.js';

const VTT_HEADER_RE = /^WEBVTT(?:[ \t].*)?$/;

/**
 * Parses a WebVTT file into a Track object containing cues and format.
 *
 * This function processes the input string, validates the header, skips metadata,
 * and extracts cues with timing, text, and settings.
 *
 * @param input - The WebVTT file contents as a string.
 * @returns A Track object with parsed cues and format 'vtt'.
 * @throws If the input is missing a valid WEBVTT header.
 */
export const parseVtt = (input: string): Track => {
  const src = stripBom(input).replace(/\r/g, '');
  const lines = src.split('\n');

  if (!VTT_HEADER_RE.test(lines[0]?.trim() ?? '')) {
    throw new Error('Invalid VTT: missing WEBVTT header');
  }

  const cues: Array<Cue> = [];
  let i = 1;

  // Skip file-level metadata/comment lines until a blank line.
  while (i < lines.length && lines[i].trim() !== '') {
    i++;
  }

  if (lines[i] === '') {
    i++;
  }

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === '') {
      i++;
    }

    if (i >= lines.length) {
      break;
    }

    // Ignore NOTE / STYLE / REGION blocks in this lightweight core
    if (/^NOTE($|\s)/.test(lines[i]) || lines[i] === 'STYLE' || lines[i] === 'REGION') {
      i++;
      while (i < lines.length && lines[i].trim() !== '') i++;
      i++;
      continue;
    }

    let id: string | undefined;
    let timingLineIdx = i;

    if (!isVttTimingLine(lines[i])) {
      id = lines[i].trim();
      timingLineIdx = i + 1;
    }

    if (!isVttTimingLine(lines[timingLineIdx])) {
      // Skip malformed block gracefully
      i++;
      continue;
    }

    const { end, start, cueSettings } = parseVttTiming(lines[timingLineIdx]);

    const textLines: Array<string> = [];
    let j = timingLineIdx + 1;
    while (j < lines.length && lines[j].trim() !== '') {
      textLines.push(lines[j]);
      j++;
    }

    cues.push({ id, end, start, text: textLines.join('\n'), cueSettings });
    i = j + 1;
  }

  return { cues, format: 'vtt' };
};

/**
 * Type guard to check if a string is a valid VTT cue alignment value.
 *
 * @param input - The string to check.
 * @returns True if the input is a valid VttCueAlign value, false otherwise.
 */
const isVttCueAlign = (input: string): input is CueAlign => {
  return ['start', 'center', 'end', 'left', 'right'].includes(input);
};

/**
 * Type guard to check if a string is a valid VTT cue line alignment value.
 *
 * @param input - The string to check.
 * @returns True if the input is a valid VttCueLineAlign value, false otherwise.
 */
const isVttCueLineAlign = (input: string): input is CueLineAlign => {
  return ['center', 'end', 'start'].includes(input);
};

/**
 * Type guard to check if a string is a valid VTT cue position alignment value.
 *
 * @param input - The string to check.
 * @returns True if the input is a valid VttCuePositionAlign value, false otherwise.
 */
const isVttCuePositionAlign = (input: string): input is CuePositionAlign => {
  return ['auto', 'center', 'line-left', 'line-right'].includes(input);
};

/**
 * Checks if a line matches the WebVTT timing format (e.g., 00:00:01.000 --> 00:00:04.000).
 *
 * @param line - The line to check.
 * @returns True if the line is a VTT timing line, false otherwise.
 */
const isVttTimingLine = (line: string): boolean => {
  return /\d{2}:\d{2}(?::\d{2})?\.\d{3}\s+-->\s+\d{2}:\d{2}(?::\d{2})?\.\d{3}/.test(line);
};

/**
 * Parses an array of WebVTT cue setting tokens into a cueSettings object.
 *
 * Supported settings include `align`, `vertical`, `size`, `region`, `line`, and `position`.
 * Each setting is validated and normalized according to the WebVTT specification.
 *
 * @param tokens - Array of cue setting strings (e.g., ['align:center', 'size:80%']).
 * @returns A cueSettings object with parsed settings, or undefined if no valid settings are found.
 */
const parsecueSettings = (tokens: Array<string>): CueSettings | undefined => {
  const out: CueSettings = {};
  for (const token of tokens) {
    if (!token.includes(':')) {
      continue;
    }

    const [key, value] = token.split(':', 2).map((s) => s.trim());

    if (key === 'align') {
      const maybeVttCueAlign = value.toLowerCase();
      if (isVttCueAlign(maybeVttCueAlign)) {
        out.align = maybeVttCueAlign;
      }
    } else if (key === 'vertical') {
      if (value === 'rl' || value === 'lr') {
        out.vertical = value;
      }
    } else if (key === 'size') {
      const results = /^(\d{1,3})%$/.exec(value);
      if (results) {
        out.size = clamp0to100(+results[1]);
      }
    } else if (key === 'region') {
      if (value) {
        out.region = value;
      }
    } else if (key === 'line') {
      // line:auto | line:40%[,center] | line:-1[,start]
      const [rawValue, anchor] = value.split(',');
      if (rawValue === 'auto') {
        out.line = 'auto';
      } else if (rawValue.endsWith('%')) {
        out.line = clamp0to100(+rawValue.slice(0, -1));
        out.snapToLines = false;
      } else {
        const maybeNumberValue = parseInt(rawValue, 10);
        if (!Number.isNaN(maybeNumberValue)) {
          out.line = maybeNumberValue;
          out.snapToLines = true;
        }
      }

      const maybeVttCueLineAlign = anchor?.toLowerCase();
      if (maybeVttCueLineAlign && isVttCueLineAlign(maybeVttCueLineAlign)) {
        out.lineAlign = maybeVttCueLineAlign;
      }
    } else if (key === 'position') {
      // position:auto | position:90%[,line-right]
      const [rawValue, anchor] = value.split(',');
      if (rawValue === 'auto') {
        out.position = 'auto';
      } else if (rawValue.endsWith('%')) {
        out.position = clamp0to100(+rawValue.slice(0, -1));
      }

      const maybeVttCuePositionAlign = anchor?.toLowerCase();
      if (maybeVttCuePositionAlign && isVttCuePositionAlign(maybeVttCuePositionAlign)) {
        out.positionAlign = maybeVttCuePositionAlign;
      }
    }
  }
  return Object.keys(out).length ? out : undefined;
};

/**
 * Parses a WebVTT timing line into start/end times and cue settings.
 *
 * The timing line format is typically: 00:00:01.000 --> 00:00:04.000 [settings...]
 *
 * @param line - The timing line to parse.
 * @returns An object containing start and end times (ms) and optional cue settings.
 * @throws If the line does not contain a valid VTT timing.
 */
const parseVttTiming = (line: string): Pick<Cue, 'end' | 'start' | 'cueSettings'> => {
  if (!line.includes('-->')) {
    throw new Error('Invalid VTT timing line: ' + line);
  }

  const [left, rightAndSettings] = line.split('-->', 2).map((_) => _.trim());

  const [right, ...settingsParts] = rightAndSettings.split(/\s+/);
  const start = parseVttTimestamp(left);
  const end = parseVttTimestamp(right);

  const cueSettings = parsecueSettings(settingsParts);
  return { start, end, cueSettings };
};
