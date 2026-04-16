/**
 * Represents a single lap in a JKS or SKS training session.
 */
type Lap = {
  time: number; // in milliseconds
  time_with_penalties: number; // in milliseconds
  cones: number; // Number of cones hit during the lap
  gates: number; // Number of gates missed during the lap (Torfehler)
  timestamp: number; // Unix timestamp in milliseconds when the lap started
  isInvalid: boolean; // This is used to invalid a lap after it's been recorded
};
