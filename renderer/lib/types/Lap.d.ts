type Lap = {
  time: number; // in milliseconds
  time_with_penalties: number; // in milliseconds
  cones: number;
  gates: number;
  timestamp: number; // Unix timestamp in milliseconds when the lap started
};
