/**
 * Parses a duration string (e.g., "10:30", "1:15:45", "90") into seconds.
 * @param durationStr The string to parse.
 * @returns The total number of seconds.
 */
export const parseDurationToSeconds = (durationStr: string): number => {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map(Number);
  let seconds = 0;
  if (parts.length === 1) {
    seconds = parts[0]; // "SS"
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1]; // "MM:SS"
  } else if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]; // "HH:MM:SS"
  }
  return isNaN(seconds) ? 0 : seconds;
};
