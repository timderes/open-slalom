export type TrainingDriver = Driver & {
  kartUuid?: string;
  stints: TrainingStint[];
};

export type TrainingStint = Stint & {
  laps: Lap[];
};

export type DriverRankingEntry = {
  driver: TrainingDriver;
  fastestLap?: Lap;
  fastestLapTime?: number;
  fastestKartUuid?: string;
};

export type TimePenalties = {
  HIT_CONE: number;
  MISSED_GATE: number;
};

export const getValidLaps = (laps: Lap[]) => {
  return laps.filter((lap) => !lap.isInvalid);
};

export const getFastestLap = (laps: Lap[]) => {
  const validLaps = getValidLaps(laps);

  if (validLaps.length === 0) {
    return undefined;
  }

  return validLaps.reduce(
    (fastest, lap) => (lap.timeWithPenalties < fastest.timeWithPenalties ? lap : fastest),
    validLaps[0],
  );
};

export const getAverageLap = (laps: Lap[], key: 'time' | 'time_with_penalties' = 'time') => {
  const validLaps = getValidLaps(laps);

  if (validLaps.length === 0) {
    return undefined;
  }

  return validLaps.reduce((sum, lap) => sum + lap[key], 0) / validLaps.length;
};

export const getTotalLapTime = (laps: Lap[], key: 'time' | 'time_with_penalties' = 'time') => {
  return getValidLaps(laps).reduce((sum, lap) => sum + lap[key], 0);
};

export const getDriverLaps = (driver: TrainingDriver) => {
  return driver.stints.flatMap((stint) => stint.laps);
};

export const getDriverFastestLap = (driver: TrainingDriver) => {
  return getFastestLap(getDriverLaps(driver));
};

export const getDriverRanking = (drivers: TrainingDriver[]): DriverRankingEntry[] => {
  return drivers
    .map((driver, index) => {
      let fastestLap: Lap | undefined;
      let fastestLapTime: number | undefined;
      let fastestKartUuid: string | undefined;

      for (const stint of driver.stints) {
        const stintFastest = getFastestLap(stint.laps);

        if (!stintFastest) continue;

        if (
          fastestLap === undefined ||
          stintFastest.timeWithPenalties < fastestLap.timeWithPenalties
        ) {
          fastestLap = stintFastest;
          fastestLapTime = stintFastest.timeWithPenalties;
          fastestKartUuid = driver.kartUuid;
        }
      }

      return {
        driver,
        fastestLap,
        fastestLapTime,
        fastestKartUuid,
        index,
      };
    })
    .sort((a, b) => {
      if (a.fastestLapTime === undefined && b.fastestLapTime === undefined) {
        return a.index - b.index;
      }

      if (a.fastestLapTime === undefined) {
        return 1;
      }

      if (b.fastestLapTime === undefined) {
        return -1;
      }

      return a.fastestLapTime - b.fastestLapTime;
    })
    .map(({ index: _index, ...entry }) => entry);
};

export const getDiffToBest = (driver: TrainingDriver, drivers: TrainingDriver[]) => {
  const fastest = getDriverFastestLap(driver);
  const best = getDriverRanking(drivers)[0]?.fastestLap;

  if (!fastest || !best) {
    return undefined;
  }

  return fastest.timeWithPenalties - best.timeWithPenalties;
};

export const getDiffToPrevious = (driver: TrainingDriver, drivers: TrainingDriver[]) => {
  const ranking = getDriverRanking(drivers);

  const index = ranking.findIndex((entry) => entry.driver.uuid === driver.uuid);

  if (index <= 0) {
    return undefined;
  }

  const current = ranking[index]?.fastestLap;
  const previous = ranking[index - 1]?.fastestLap;

  if (!current || !previous) {
    return undefined;
  }

  return current.timeWithPenalties - previous.timeWithPenalties;
};

export const getFastestLapTimestamp = (driver: TrainingDriver) => {
  return getDriverFastestLap(driver)?.timestamp;
};

export const getLapPenaltySeconds = (lap: Lap, penalties: TimePenalties) => {
  return lap.cones * penalties.HIT_CONE + lap.gates * penalties.MISSED_GATE;
};
