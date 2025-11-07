type Kart = {
  name: string;
  uuid: string; // UUID v4
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  engine: string;
  chassis: string;
  type: SlalomType; // JKS | SKS
  history: KartHistory;
};

type KartHistory = {
  laps: number; // Total number of laps
  totalTrainingsSessions: number; // Total number of training sessions
  totalTime: number;
  firstTraining: number; // Unix timestamp
  lastTraining: number; // Unix timestamp
};
