type Driver = {
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601 format: YYYY-MM-DD
  // "other" can be used for non-binary, undisclosed, or unspecified sex
  sex: "male" | "female" | "other";
  driverClass: {
    jks: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
    sks: 1 | 2 | 3 | 4 | 5;
  };
  uuid: string; // UUID v4
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
};

/**
 * Extends the default driver profile with an array of laps.
 */
type DriverWithStints = Driver & {
  stints: { laps: Lap[] }[];
  currentKart?: Kart; // Optional current kart assignment
};
