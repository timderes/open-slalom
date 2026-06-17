type DriverRankingEntry = {
  driver: TrainingDriver;
  fastestLap?: Lap;
  fastestLapTime?: number;
};

type TimePenalties = {
  HIT_CONE: number;
  MISSED_GATE: number;
};

export const getValidLaps = (laps: Lap[]) => laps.filter((lap) => !lap.isInvalid);

export const getFastestLap = (laps: Lap[]) => {
  const validLaps = getValidLaps(laps);

  if (validLaps.length === 0) {
    return undefined;
  }

  return validLaps.reduce((fastest, lap) =>
    lap.time_with_penalties < fastest.time_with_penalties ? lap : fastest,
  );
};

export const getAverageLap = (laps: Lap[], key: 'time' | 'time_with_penalties' = 'time') => {
  const validLaps = getValidLaps(laps);

  if (validLaps.length === 0) {
    return undefined;
  }

  const total = validLaps.reduce((sum, lap) => sum + lap[key], 0);
  return total / validLaps.length;
};

export const getTotalLapTime = (laps: Lap[], key: 'time' | 'time_with_penalties' = 'time') => {
  const validLaps = getValidLaps(laps);
  return validLaps.reduce((sum, lap) => sum + lap[key], 0);
};

export const getDriverLaps = (driver: TrainingDriver) =>
  (driver.stints ?? []).flatMap((stint) => stint.laps ?? []);

export const getDriverFastestLap = (driver: TrainingDriver) => getFastestLap(getDriverLaps(driver));

export const getDriverRanking = (drivers: TrainingDriver[]) =>
  drivers
    .map((driver, index) => {
      const fastestLap = getDriverFastestLap(driver);

      return {
        driver,
        fastestLap,
        fastestLapTime: fastestLap?.time_with_penalties,
        index,
      };
    })
    .sort((a, b) => {
      if (a.fastestLapTime === undefined && b.fastestLapTime === undefined) {
        return a.index - b.index;
      }

      if (a.fastestLapTime === undefined) return 1;
      if (b.fastestLapTime === undefined) return -1;

      return a.fastestLapTime - b.fastestLapTime;
    })
    .map(({ index, ...entry }): DriverRankingEntry => entry);

export const getDiffToBest = (driver: TrainingDriver, drivers: TrainingDriver[]) => {
  const driverFastest = getDriverFastestLap(driver);

  if (!driverFastest) {
    return undefined;
  }

  const ranking = getDriverRanking(drivers);
  const best = ranking[0]?.fastestLap;

  if (!best) {
    return undefined;
  }

  return driverFastest.time_with_penalties - best.time_with_penalties;
};

export const getDiffToPrevious = (driver: TrainingDriver, drivers: TrainingDriver[]) => {
  const ranking = getDriverRanking(drivers);
  const index = ranking.findIndex((entry) => entry.driver.uuid === driver.uuid);

  if (index === -1) {
    return undefined;
  }

  if (index === 0) {
    return 0;
  }

  const current = ranking[index]?.fastestLap;
  const previous = ranking[index - 1]?.fastestLap;

  if (!current || !previous) {
    return undefined;
  }

  return current.time_with_penalties - previous.time_with_penalties;
};

export const getFastestLapTimestamp = (driver: TrainingDriver) =>
  getDriverFastestLap(driver)?.timestamp;

export const getLapPenaltySeconds = (lap: Lap, penalties: TimePenalties) =>
  lap.cones * penalties.HIT_CONE + lap.gates * penalties.MISSED_GATE;
