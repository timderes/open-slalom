type TimePenalties = {
  HIT_CONE: number;
  MISSED_GATE: number;
};

export const UNKNOWN_KART_NAME = "N/A";

export type DriverRankingEntry = {
  driver: DriverWithStints;
  fastestLap?: Lap;
  fastestLapTime?: number;
  kart?: Kart | null;
  diffToBest?: number;
  diffToPrevious?: number;
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
  let fastestLap: Lap | undefined = undefined;

  for (const lap of laps) {
    if (lap.isInvalid) continue;
    if (!fastestLap || lap.time_with_penalties < fastestLap.time_with_penalties) {
      fastestLap = lap;
    }
  }

  return fastestLap;
};

/**
 * Average lap time
 */
export const getAverageLap = (
  laps: Lap[],
  key: "time" | "time_with_penalties" = "time",
) => {
  let total = 0;
  let count = 0;

  for (const lap of laps) {
    if (lap.isInvalid) continue;
    total += lap[key];
    count += 1;
  }

  if (count === 0) return undefined;
  return total / count;
};

/**
 * Total lap time
 */
export const getTotalLapTime = (
  laps: Lap[],
  key: "time" | "time_with_penalties" = "time",
) => {
  let total = 0;
  for (const lap of laps) {
    if (lap.isInvalid) continue;
    total += lap[key];
  }
  return total;
};

/**
 * Flatten all laps of a driver
 */
export const getDriverLaps = (driver: DriverWithStints) =>
  (driver.stints ?? []).reduce<Lap[]>((acc, stint) => {
    if (!stint?.laps || stint.laps.length === 0) return acc;
    acc.push(...stint.laps);
    return acc;
  }, []);

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

const getKartLookup = (availableKarts: Kart[]) =>
  new Map(availableKarts.map((kart) => [kart.uuid, kart] as const));

const resolveKartByUUID = (
  kartUUID: string | null | undefined,
  kartLookup: Map<string, Kart>,
) => {
  if (!kartUUID) return undefined;
  return kartLookup.get(kartUUID);
};

const getDriverFastestLapWithStint = (driver: DriverWithStints) => {
  let fastestLap: Lap | undefined = undefined;
  let fastestStint: Stint | undefined = undefined;

  for (const stint of driver.stints ?? []) {
    for (const lap of stint.laps ?? []) {
      if (lap.isInvalid) continue;

      if (!fastestLap || lap.time_with_penalties < fastestLap.time_with_penalties) {
        fastestLap = lap;
        fastestStint = stint;
      }
    }
  }

  return { fastestLap, fastestStint };
};

/**
 * Resolve kart from stint
 */
export const getKartByStint = (
  stint: Stint | undefined,
  availableKarts: Kart[] | Map<string, Kart> = [],
) => {
  if (!stint?.kartUUID) return undefined;

  if (availableKarts instanceof Map) {
    return resolveKartByUUID(stint.kartUUID, availableKarts);
  }

  return availableKarts.find((kart) => kart.uuid === stint.kartUUID);
};

/**
 * Resolve kart from lap -> stint
 */
export const getKartByLap = (
  lap: Lap | undefined,
  driver: DriverWithStints,
  availableKarts: Kart[] | Map<string, Kart> = [],
) => {
  const stint = getStintByLap(driver, lap);
  return getKartByStint(stint, availableKarts);
};

/**
 * Resolve kart from driver's fastest lap
 */
export const getKartFromFastestLap = (
  driver: DriverWithStints,
  availableKarts: Kart[] | Map<string, Kart> = [],
) => {
  const fastestLap = getDriverFastestLap(driver);
  return getKartByLap(fastestLap, driver, availableKarts);
};

/**
 * Fallback-safe kart name for UI output
 */
export const getKartDisplayName = (kart?: Kart | null) =>
  kart?.name ?? UNKNOWN_KART_NAME;

/**
 * DRIVER RANKING (with kart resolved from stint)
 */
export const getDriverRanking = (
  drivers: DriverWithStints[],
  availableKarts: Kart[] = [],
) => {
  const kartLookup = getKartLookup(availableKarts);

  const ranking = drivers
    .reduce<
      Array<{
        driver: DriverWithStints;
        fastestLap?: Lap;
        fastestLapTime?: number;
        kart: Kart | null;
        index: number;
      }>
    >((acc, driver, index) => {
      if (!driver) return acc;

      const { fastestLap, fastestStint } = getDriverFastestLapWithStint(driver);

      acc.push({
        driver,
        fastestLap,
        fastestLapTime: fastestLap?.time_with_penalties,
        kart: getKartByStint(fastestStint, kartLookup) ?? null,
        index,
      });

      return acc;
    }, [])
    .sort((a, b) => {
      if (a.fastestLapTime === undefined && b.fastestLapTime === undefined) {
        return a.index - b.index;
      }

      if (a.fastestLapTime === undefined) return 1;
      if (b.fastestLapTime === undefined) return -1;

      return a.fastestLapTime - b.fastestLapTime;
    })
    .map(({ index, ...entry }): DriverRankingEntry => entry);

  const bestTime = ranking[0]?.fastestLapTime;

  return ranking.map((entry, index) => {
    const current = entry.fastestLapTime;
    const previous = ranking[index - 1]?.fastestLapTime;

    return {
      ...entry,
      diffToBest:
        current !== undefined && bestTime !== undefined
          ? current - bestTime
          : undefined,
      diffToPrevious:
        current === undefined
          ? undefined
          : index === 0
            ? 0
            : previous === undefined
              ? undefined
              : current - previous,
    };
  });
};

/**
 * Difference to best driver
 */
export const getDiffToBest = (
  driver: DriverWithStints,
  drivers: DriverWithStints[],
  availableKarts: Kart[] = [],
) => {
  const ranking = getDriverRanking(drivers, availableKarts);
  return ranking.find((entry) => entry.driver.uuid === driver.uuid)?.diffToBest;
};

/**
 * Difference to previous driver
 */
export const getDiffToPrevious = (
  driver: DriverWithStints,
  drivers: DriverWithStints[],
  availableKarts: Kart[] = [],
) => {
  const ranking = getDriverRanking(drivers, availableKarts);
  return ranking.find((entry) => entry.driver.uuid === driver.uuid)
    ?.diffToPrevious;
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
