/**
 * Represents a parsed subtitle track, containing cues and format.
 */
export interface Track {
  /** Array of cues in the track. */
  cues: Array<Cue>;
  /** Subtitle format: 'srt' or 'vtt'. */
  format?: TrackFormat;
}

/**
 * Supported subtitle formats.
 * - `srt` — SubRip
 * - `vtt` — WebVTT
 */
export type TrackFormat = 'srt' | 'vtt';

/**
 * Represents a single subtitle cue (line) in a track.
 */
export interface Cue {
  /** Optional cue identifier (for VTT). */
  id?: string;
  /** Cue start time in milliseconds. */
  start: number;
  /** Cue end time in milliseconds. */
  end: number;
  /** Cue text content. */
  text: string;
  /** Optional VTT cue settings (for advanced positioning, etc). */
  cueSettings?: CueSettings;
}

/**
 * Alignment for cue text inside the cue box.
 * Matches VTTCue.align.
 */
export type CueAlign = 'center' | 'end' | 'left' | 'right' | 'start';

/**
 * Anchor for line placement (VTTCue.lineAlign).
 */
export type CueLineAlign = 'center' | 'end' | 'start';

/**
 * Anchor for position placement (VTTCue.positionAlign).
 */
export type CuePositionAlign = 'auto' | 'center' | 'line-left' | 'line-right';

/**
 * Vertical text flow direction (VTTCue.vertical).
 * - `lr` — left-to-right
 * - `rl` — right-to-left
 */
export type CueVertical = 'lr' | 'rl';

/**
 * Advanced cue settings for WebVTT cues (positioning, alignment, etc).
 */
export interface CueSettings {
  /** Text alignment inside cue box. */
  align?: CueAlign;
  /**
   * Line placement:
   * - If `snapToLines` is `true` — line index (int, negative counts from bottom).
   * - If `snapToLines` is `false` — percentage (0–100) → serialized as `line:NN%`.
   * - Or 'auto'.
   */
  line?: number | 'auto';
  /** Anchor for the `line` placement. */
  lineAlign?: CueLineAlign;
  /** Indentation within the line: percent (0–100) → serialized as `position:NN%`, or 'auto'. */
  position?: number | 'auto';
  /** Anchor for `position`. */
  positionAlign?: CuePositionAlign;
  /** Region id (if the file references a REGION). */
  region?: string;
  /** Width (or height if vertical), percent (0–100) → serialized as `size:NN%`. */
  size?: number;
  /**
   * If `true`, `line` is index-based (browser default).
   * If `false`, `line` is percent-based.
   */
  snapToLines?: boolean;
  /** Vertical text flow direction. */
  vertical?: CueVertical;
}
