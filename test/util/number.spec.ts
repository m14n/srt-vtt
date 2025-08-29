import { describe, expect, it } from 'vitest';

import { clamp0to100 } from '../../src/index.js';

describe('number util', () => {
  describe('clamp0to100()', () => {
    it('returns input if within range', () => {
      expect(clamp0to100(50)).toBe(50);
      expect(clamp0to100(0)).toBe(0);
      expect(clamp0to100(100)).toBe(100);
    });

    it('clamps values below 0 to 0', () => {
      expect(clamp0to100(-1)).toBe(0);
      expect(clamp0to100(-100)).toBe(0);
    });

    it('clamps values above 100 to 100', () => {
      expect(clamp0to100(101)).toBe(100);
      expect(clamp0to100(1000)).toBe(100);
    });

    it('handles floating point numbers', () => {
      expect(clamp0to100(99.9)).toBe(99.9);
      expect(clamp0to100(-0.1)).toBe(0);
      expect(clamp0to100(100.1)).toBe(100);
    });
  });
});
