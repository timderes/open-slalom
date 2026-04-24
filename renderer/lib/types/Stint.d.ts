/**
 * Represents a persisted stint for a driver.
 */
type Stint = {
  laps: Lap[]; // Array of laps completed in this stint
  kartUUID: Kart["uuid"] | null; // Assigned kart for this full stint
};
