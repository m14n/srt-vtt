/**
 * Formats a time value in milliseconds as an SRT timestamp string (HH:MM:SS,mmm).
 *
 * @param msTotal - The time in milliseconds to format.
 * @returns The formatted SRT timestamp string.
 */
export const formatSrtTime = (msTotal: number): string => {
  if (msTotal < 0) msTotal = 0;
  const h = Math.floor(msTotal / 3_600_000);
  const m = Math.floor((msTotal % 3_600_000) / 60_000);
  const s = Math.floor((msTotal % 60_000) / 1000);
  const ms = msTotal % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(ms)}`;
};

/**
 * Formats a time value in milliseconds as a WebVTT timestamp string (HH:MM:SS.mmm).
 *
 * @param msTotal - The time in milliseconds to format.
 * @returns The formatted VTT timestamp string.
 */
export const formatVttTime = (msTotal: number): string => {
  if (msTotal < 0) msTotal = 0;
  const h = Math.floor(msTotal / 3_600_000);
  const m = Math.floor((msTotal % 3_600_000) / 60_000);
  const s = Math.floor((msTotal % 60_000) / 1000);
  const ms = msTotal % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(ms)}`;
};

/**
 * Parses an SRT timestamp string (HH:MM:SS,mmm) and returns the time in milliseconds.
 *
 * @param input - The SRT timestamp string to parse.
 * @returns The time in milliseconds.
 * @throws If the input is not a valid SRT timestamp.
 */
export const parseSrtTimestamp = (input: string): number => {
  // HH:MM:SS,mmm
  const results = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/.exec(input);
  if (!results) {
    throw new Error('Invalid SRT timestamp: ' + input);
  }
  const [, hh, mm, ss, ms] = results;
  return (
    ((parseInt(hh, 10) * 60 + parseInt(mm, 10)) * 60 + parseInt(ss, 10)) *
      1000 +
    parseInt(ms, 10)
  );
};

/**
 * Parses a WebVTT timestamp string (HH:MM:SS.mmm or MM:SS.mmm) and returns the time in milliseconds.
 *
 * @param input - The VTT timestamp string to parse.
 * @returns The time in milliseconds.
 * @throws If the input is not a valid VTT timestamp.
 */
export const parseVttTimestamp = (input: string): number => {
  // HH:MM:SS.mmm or MM:SS.mmm
  const results = /^(?:(\d{2}):)?(\d{2}):(\d{2})\.(\d{3})$/.exec(input);
  if (!results) {
    throw new Error('Invalid VTT timestamp: ' + input);
  }
  const [, hh, mm, ss, ms] = results;
  const h = hh ? parseInt(hh, 10) : 0;
  return (
    ((h * 60 + parseInt(mm, 10)) * 60 + parseInt(ss, 10)) * 1000 +
    parseInt(ms, 10)
  );
};

// Private helper functions

/**
 * Pads a number to at least two digits with leading zeros.
 *
 * @param input - The number to pad.
 * @returns The number as a string, left-padded with zeros to two digits.
 */
const pad2 = (input: number): string => {
  return String(input).padStart(2, '0');
};

/**
 * Pads a number to at least three digits with leading zeros.
 *
 * @param input - The number to pad.
 * @returns The number as a string, left-padded with zeros to three digits.
 */
const pad3 = (input: number): string => {
  return String(input).padStart(3, '0');
};
