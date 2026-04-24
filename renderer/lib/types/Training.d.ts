type TrainingMode = "JKS" | "SKS";

type Training = {
  lapsPerStint: number;
  mode: TrainingMode;
  drivers: DriverWithStints[];
  karts: Kart["uuid"][];
  uuid: string; // UUID v4
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  // TODO: Add these later
  // weather
  // location
};
