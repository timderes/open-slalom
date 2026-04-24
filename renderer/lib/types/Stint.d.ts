/**
 * Represents a stint — a sequence of laps during a driver is on track.
 * It includes information about the current driver, completed laps, and the
 * total elapsed time of the stint.
 */
type Stint = {
  currentDriverIndex: number; // Index of the driver currently on track
  currentLap: number; // Current lap number within the stint (starting from 1)
  driver?: DriverWithStints; // Optional reference to the driver currently on track (can be undefined if no driver is assigned yet)
  laps: Lap[]; // Array of laps completed in this stint
  time: number; // Total elapsed time for the stint
  kart?: Kart["name"];
};
