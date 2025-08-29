import { describe, expect, it } from 'vitest';

import { stripBom } from '../../src/index.js';

describe('text util', () => {
  describe('stripBom()', () => {
    it('removes BOM from string', () => {
      const input = '\uFEFFhello';
      expect(stripBom(input)).toBe('hello');
    });

    it('returns string unchanged if no BOM', () => {
      const input = 'hello';
      expect(stripBom(input)).toBe('hello');
    });

    it('returns empty string if input is only BOM', () => {
      const input = '\uFEFF';
      expect(stripBom(input)).toBe('');
    });

    it('handles empty string', () => {
      const input = '';
      expect(stripBom(input)).toBe('');
    });
  });
});
