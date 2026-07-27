type DriverStatsParams = {
  participations: Participation[];
  stints: Stint[];
  laps: Lap[];
  driverUUID: Driver['uuid'];
};

type DriverStats = {
  totalLaps: number;
  totalDrivingTime: number;
  hitCones: number;
  hitGates: number;
};

export const getDriverStats = ({
  participations,
  stints,
  laps,
  driverUUID,
}: DriverStatsParams): DriverStats => {
  const driverParticipations = participations?.filter(
    (participation) => participation.driverUuid === driverUUID,
  );

  if (driverParticipations?.length === 0) {
    return {
      totalLaps: 0,
      totalDrivingTime: 0,
      hitCones: 0,
      hitGates: 0,
    };
  }

  const participationUuids = driverParticipations?.map((participation) => participation.uuid);

  const driverStints = stints?.filter((stint) =>
    participationUuids.includes(stint.participationUuid),
  );

  const stintUuids = driverStints?.map((stint) => stint.uuid);

  const driverLaps = laps?.filter((lap) => stintUuids?.includes(lap.stintUuid));

  return driverLaps?.reduce<DriverStats>(
    (acc, lap) => {
      acc.totalLaps++;

      acc.totalDrivingTime += lap.time;

      acc.hitCones += lap.cones ?? 0;

      acc.hitGates += lap.gates ?? 0;

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

export default getDriverStats;
