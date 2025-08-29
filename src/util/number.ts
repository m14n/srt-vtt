/**
 * Clamps a number to the range 0 to 100, inclusive.
 *
 * @param input - The number to clamp.
 * @returns The input number, clamped between 0 and 100.
 */
export const clamp0to100 = (input: number): number => {
  return Math.max(0, Math.min(100, input));
};
