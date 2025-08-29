/**
 * Removes the UTF-8 Byte Order Mark (BOM) from the beginning of a string, if present.
 *
 * @param input - The input string to process.
 * @returns The string without a BOM at the start.
 */
export const stripBom = (input: string): string => {
  return input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
};
