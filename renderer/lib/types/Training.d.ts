type TrainingMode = "JKS" | "SKS";

type Training = {
  lapsPerStint: number;
  mode: TrainingMode;
  drivers: Driver[];
  uuid: string; // UUID v4
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  // TODO: Add these later
  // weather
  // location
};

type TrainingData = {
  bestLapTime: number;
  averageLapTime: number;
  totalLaps: number;
  totalCones: number;
  totalGates: number;
  laps: Lap[];
};
