# @m14n/srt-vtt

Lightweight, dependency-free **TypeScript** library to parse **WebVTT** and **SRT** into a common model, and serialize back to either format.

- ✅ Parse **WebVTT** (VTT) and **SubRip** (SRT)
- ✅ Serialize to **VTT** or **SRT**
- ✅ Preserve VTT cue **settings** (`line`, `position`, `size`, `align`, …)
- ✅ Keep cue **IDs** when present (VTT); SRT emits sequential indices
- ✅ No dependencies, small footprint

## Installation

```bash
npm i @m14n/srt-vtt
# or
yarn add @m14n/srt-vtt
# or
pnpm add @m14n/srt-vtt
```

> Requires Node.js 18+

## Quick Start

```typescript
import { parse, serializeSrt, serializeVtt } from '@m14n/srt-vtt';

const input = `WEBVTT

00:00:01.000 --> 00:00:04.000
<v Roger>Hello there!
`;

const track = parse(input);

// Mutate or inspect the unified model
track.cues[0].cueSettings = { align: 'center', line: 0 };

// Serialize to VTT
const vtt = serializeVtt(track);

// Serialize to SRT
const srt = serializeSrt(track);
```

## API

### Types

```typescript
/**
 * Represents a parsed subtitle track, containing cues and format.
 */
export interface Track {
  /** Array of cues in the track. */
  cues: Cue[];
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
  /** Cue start time in milliseconds. */
  start: number;
  /** Cue end time in milliseconds. */
  end: number;
  /** Optional cue identifier (for VTT). */
  id?: string;
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
```

### Functions

| Function                                   | Description                                                                | Parameters                                  | Returns       | Notes                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `detectFormat(input: string): TrackFormat` | Detects subtitle format (WebVTT or SRT) from input string.                 | `input`: Subtitle file contents as a string | `TrackFormat` | Uses header and timestamp heuristics                                                  |
| `parse(input: string): Track`              | Parses a subtitle file (WebVTT or SRT) and returns a unified Track object. | `input`: Subtitle file contents as a string | `Track`       | Auto-detects format and delegates to the appropriate parser                           |
| `parseVtt(input: string): Track`           | Parses a WebVTT file and returns a Track object.                           | `input`: WebVTT file contents as a string   | `Track`       | Ignores NOTE, STYLE, and REGION blocks                                                |
| `parseSrt(input: string): Track`           | Parses an SRT file and returns a Track object.                             | `input`: SRT file contents as a string      | `Track`       | Ignores malformed blocks                                                              |
| `serializeVtt(track: Track): string`       | Serializes a Track object to WebVTT format.                                | `track`: The Track object to serialize      | `string`      | Emits WEBVTT header, preserves cue settings and IDs                                   |
| `serializeSrt(track: Track): string`       | Serializes a Track object to SRT format.                                   | `track`: The Track object to serialize      | `string`      | Emits sequential numeric indices (1-based), ignores cue settings not supported by SRT |

## Examples

### Parse SRT, write VTT

```typescript
import { parseSrt, serializeVtt } from '@m14n/srt-vtt';

const srt = `1
00:00:01,000 --> 00:00:04,000
Hello, world!

2
00:00:05,000 --> 00:00:08,000
This is a second subtitle
`;

const track = parseSrt(srt);
// Add VTT positioning
track.cues[1].cueSettings = {
  align: 'center',
  line: 0,
  position: 50,
  snapToLines: true,
};

const vtt = serializeVtt(track);
```

### Parse VTT, write SRT

```typescript
import { parseVtt, serializeSrt } from '@m14n/srt-vtt';

const vtt = `WEBVTT

id-1
00:00:01.000 --> 00:00:04.000 line:-1
<v Roger>Hello there!

00:00:05.000 --> 00:00:08.000 position:50% size:35% align:middle
Centered and narrow
`;

const track = parseVtt(vtt);
const srt = serializeSrt(track); // settings are ignored by SRT format
```

### Building from a structured object

```typescript
import { Track, serializeSrt, serializeVtt } from '@m14n/srt-vtt';

const track: Track = {
  cues: [
    {
      id: 'intro',
      start: 0,
      end: 2000,
      text: '<v Narrator>Welcome!',
      cueSettings: { line: 0 },
    },
    {
      start: 2500,
      end: 6000,
      text: 'Enjoy the show.',
      cueSettings: { align: 'center' },
    },
  ],
};

const asVtt = serializeVtt(track);
const asSrt = serializeSrt(track);
```

## Notes

- VTT inline markup (e.g., `<v Roger>`, `<b>`, `<i>`, `<u>`, `<c.class>`) is left untouched in `text`.
- `NOTE`, `STYLE`, and `REGION` blocks are ignored by this lightweight implementation; you can extend the parsers to retain them if needed.
- Hours are always emitted in serialized timestamps for consistency.

## License

MIT
