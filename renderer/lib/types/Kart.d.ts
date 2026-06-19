type Kart = {
  name: string;
  uuid: string; // UUID v4
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  engine: string;
  chassis: string;
  type: SlalomType;
  history: KartHistory;
};

type KartHistory = {
  totalLaps: number;
  trainingUuids: Training['uuid'][];
  totalTime: number;
  totalStints: number;
  usageByDriver?: Record<
    Driver['uuid'],
    {
      stints: number;
      laps: number;
      totalTime: number;
    }
  >;
  firstTraining?: number; // Unix timestamp
  lastTraining?: number; // Unix timestamp
};
