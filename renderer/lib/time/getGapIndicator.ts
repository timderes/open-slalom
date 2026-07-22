/**
 * A positive or negative indicator for a time gap.
 */
type GapIndicator = '+' | '-';

/**
 * Returns a string indicating whether the time gap is positive or negative.
 *
 * For example, if the gap is positive, the driver is behind the other driver or leader.
 * If the gap is negative, the driver is ahead.
 *
 * @example getGapIndicator(5000) // returns '+', 5000 milliseconds is a positive gap.
 * getGapIndicator(-5000) // returns '-'
 *
 * @param gap The time gap between two timestamps.
 *
 * @returns Returns `'+'` if the gap is positive, `'-'` if the gap is negative.
 */
const getGapIndicator = (gap: number): GapIndicator => {
  if (gap < 0) return '-';

  return '+';
};

export default getGapIndicator;
