/**
 * Smallest whole number of attendances (out of `totalClassesHeld`) so that
 * the attendance share meets or exceeds `minimumPercent`, using ceiling.
 */
export function minClassesRequiredCeil(
  totalClassesHeld: number,
  minimumPercent: number,
): number | null {
  if (!Number.isFinite(totalClassesHeld) || totalClassesHeld < 1) {
    return null;
  }
  if (!Number.isFinite(minimumPercent) || minimumPercent < 0) {
    return null;
  }
  const pct = Math.min(100, minimumPercent);
  return Math.ceil((totalClassesHeld * pct) / 100);
}
