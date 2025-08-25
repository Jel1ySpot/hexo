import strip from 'strip-ansi';

/**
 * Utility helpers shared by list subcommands.
 *
 * Currently provides a `stringLength` function that measures the visual length
 * of console strings, accounting for ANSI colors and double-byte characters.
 */

export function stringLength(str: string): number {
  str = strip(str);

  const len = str.length;
  let result = len;

  // Detect double-byte characters
  for (let i = 0; i < len; i++) {
    if (str.charCodeAt(i) > 255) {
      result++;
    }
  }

  return result;
}
