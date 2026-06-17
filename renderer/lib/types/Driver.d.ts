type Driver = {
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601 format: YYYY-MM-DD
  // "other" can be used for non-binary, undisclosed, or unspecified gender
  gender: 'male' | 'female' | 'other';
  uuid: string; // UUID v4
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
};

/**
 * Extends the default driver profile with an array of laps.
 */
type TrainingDriver = Driver & {
  stints: { laps: Lap[] }[];
  isActive: boolean; // Indicates that the driver is still participating in the training
};
