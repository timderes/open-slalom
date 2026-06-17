type TrainingMode = 'JKS' | 'SKS';

type Training = {
  lapsPerStint: number;
  unlimitedLapsPerStint: boolean;
  mode: TrainingMode;
  drivers: TrainingDriver[];
  uuid: string; // UUID v4
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  // TODO: Add these later
  // weather
  // location
};
