type TrainingMode = "JKS" | "SKS";

type Training = {
  lapsPerStint: number;
  mode: TrainingMode;
  drivers: DriverWithTrainingData[];
  // TODO: Add these later
  // weather
  // location
};
