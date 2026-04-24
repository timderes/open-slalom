type TimePenalties = {
  HIT_CONE: number;
  MISSED_GATE: number;
};

export type Stint = {
  laps: Lap[];
  kart: Kart | null;
};

export type DriverRankingEntry = {
  driver: DriverWithStints;
  fastestLap?: Lap;
  fastestLapTime?: number;
  kart?: Kart | null;
};

/**
 * Filters invalid laps out
 */
export const getValidLaps = (laps: Lap[]) =>
  laps.filter((lap) => !lap.isInvalid);

/**
 * Returns fastest valid lap (by time with penalties)
 */
export const getFastestLap = (laps: Lap[]) => {
  const validLaps = getValidLaps(laps);

  if (validLaps.length === 0) return undefined;

  return validLaps.reduce((fastest, lap) =>
    lap.time_with_penalties < fastest.time_with_penalties ? lap : fastest,
  );
};

/**
 * Average lap time
 */
export const getAverageLap = (
  laps: Lap[],
  key: "time" | "time_with_penalties" = "time",
) => {
  const validLaps = getValidLaps(laps);

  if (validLaps.length === 0) return undefined;

  const total = validLaps.reduce((sum, lap) => sum + lap[key], 0);
  return total / validLaps.length;
};

/**
 * Total lap time
 */
export const getTotalLapTime = (
  laps: Lap[],
  key: "time" | "time_with_penalties" = "time",
) => {
  const validLaps = getValidLaps(laps);
  return validLaps.reduce((sum, lap) => sum + lap[key], 0);
};

/**
 * Flatten all laps of a driver
 */
export const getDriverLaps = (driver: DriverWithStints) =>
  (driver.stints ?? []).flatMap((stint) => stint.laps ?? []);

/**
 * Fastest lap of driver
 */
export const getDriverFastestLap = (driver: DriverWithStints) =>
  getFastestLap(getDriverLaps(driver));

/**
 * Find stint that contains a lap
 */
export const getStintByLap = (driver: DriverWithStints, lap?: Lap) => {
  if (!lap) return undefined;

  return driver.stints?.find((stint) =>
    stint.laps?.some((l) => l.timestamp === lap.timestamp),
  );
};

/**
 * DRIVER RANKING (with kart resolved from stint)
 */
export const getDriverRanking = (drivers: DriverWithStints[]) =>
  drivers
    .map((driver, index) => {
      const fastestLap = getDriverFastestLap(driver);

      const stint = getStintByLap(driver, fastestLap);

      return {
        driver,
        fastestLap,
        fastestLapTime: fastestLap?.time_with_penalties,
        kart: stint?.kart ?? null,
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

/**
 * Difference to best driver
 */
export const getDiffToBest = (
  driver: DriverWithStints,
  drivers: DriverWithStints[],
) => {
  const driverFastest = getDriverFastestLap(driver);
  if (!driverFastest) return undefined;

  const ranking = getDriverRanking(drivers);
  const best = ranking[0]?.fastestLap;

  if (!best) return undefined;

  return driverFastest.time_with_penalties - best.time_with_penalties;
};

/**
 * Difference to previous driver
 */
export const getDiffToPrevious = (
  driver: DriverWithStints,
  drivers: DriverWithStints[],
) => {
  const ranking = getDriverRanking(drivers);

  const index = ranking.findIndex((entry) => entry.driver.uuid === driver.uuid);

  if (index === -1) return undefined;
  if (index === 0) return 0;

  const current = ranking[index]?.fastestLap;
  const previous = ranking[index - 1]?.fastestLap;

  if (!current || !previous) return undefined;

  return current.time_with_penalties - previous.time_with_penalties;
};

/**
 * Fastest lap timestamp helper
 */
export const getFastestLapTimestamp = (driver: DriverWithStints) =>
  getDriverFastestLap(driver)?.timestamp;

/**
 * Penalty calculation
 */
export const getLapPenaltySeconds = (lap: Lap, penalties: TimePenalties) =>
  lap.cones * penalties.HIT_CONE + lap.gates * penalties.MISSED_GATE;
