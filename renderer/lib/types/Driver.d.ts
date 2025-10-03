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
  createdAt: string; // Unix timestamp
  updatedAt: string; // Unix timestamp
};

type DriverWithTrainingData = Driver & {
  totalLaps: number;
  totalCones: number;
  totalGates: number;
  laps: Lap[];
};
