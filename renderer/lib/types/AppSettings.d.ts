/**
 * Application-wide settings that persist across sessions.
 */
type AppSettings = {
  stopwatchInterval: number; // Interval in milliseconds for stopwatch updates
  uuid: string; // UUID v4 - settings identifier
  updatedAt: number; // Unix timestamp
};
