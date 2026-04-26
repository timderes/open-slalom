type DriverStatsParams = {
  trainings: Training[];
  driverUUID: Driver['uuid'];
};

type DriverStats = {
  totalLaps: number;
  totalDrivingTime: number;
  hitCones: number;
  hitGates: number;
};

const getDriverData = (training: Training, driverUUID: Driver['uuid']) => {
  return training.drivers.find((d) => d.uuid === driverUUID);
};

export const getDriverStats = ({ trainings, driverUUID }: DriverStatsParams): DriverStats => {
  if (!trainings || trainings.length === 0) {
    return {
      totalLaps: 0,
      totalDrivingTime: 0,
      hitCones: 0,
      hitGates: 0,
    };
  }

  return trainings.reduce<DriverStats>(
    (acc, training) => {
      const driverData = getDriverData(training, driverUUID);
      if (!driverData) return acc;

      acc.totalLaps += driverData.stints.length * training.lapsPerStint;

      for (const stint of driverData.stints) {
        for (const lap of stint.laps) {
          acc.totalDrivingTime += lap.time;
          acc.hitCones += lap.cones;
          acc.hitGates += lap.gates;
        }
      }

      return acc;
    },
    {
      totalLaps: 0,
      totalDrivingTime: 0,
      hitCones: 0,
      hitGates: 0,
    },
  );
};
