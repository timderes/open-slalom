import { describe, expect, it } from "vitest";
import {
  getAverageLap,
  getDiffToBest,
  getDiffToPrevious,
  getDriverFastestLap,
  getDriverRanking,
  getFastestLap,
  getKartByLap,
  getKartByStint,
  getKartDisplayName,
  getKartFromFastestLap,
  getLapPenaltySeconds,
  getValidLaps,
} from "./selectors";

const createLap = (overrides: Partial<Lap>): Lap => ({
  time: 1000,
  time_with_penalties: 1000,
  cones: 0,
  gates: 0,
  timestamp: 1,
  isInvalid: false,
  ...overrides,
});

const createDriver = (
  uuid: string,
  laps: Lap[],
  kartUUID: string | null = null,
): DriverWithStints => ({
  uuid,
  firstName: `First-${uuid}`,
  lastName: `Last-${uuid}`,
  birthDate: "2000-01-01",
  sex: "other",
  driverClass: { jks: 1, sks: 1 },
  createdAt: 1,
  updatedAt: 1,
  stints: [{ laps, kartUUID }],
});

describe("training selectors", () => {
  it("filters invalid laps from valid lap selector", () => {
    const laps = [
      createLap({ timestamp: 1, isInvalid: false }),
      createLap({ timestamp: 2, isInvalid: true }),
      createLap({ timestamp: 3, isInvalid: false }),
    ];

    expect(getValidLaps(laps).map((lap) => lap.timestamp)).toEqual([1, 3]);
  });

  it("excludes invalid laps for fastest lap and returns undefined when only invalid laps exist", () => {
    const laps = [
      createLap({ timestamp: 1, time_with_penalties: 900, isInvalid: true }),
      createLap({ timestamp: 2, time_with_penalties: 1200, isInvalid: false }),
      createLap({ timestamp: 3, time_with_penalties: 1100, isInvalid: false }),
    ];

    expect(getFastestLap(laps)?.timestamp).toBe(3);
    expect(
      getFastestLap([
        createLap({ timestamp: 9, isInvalid: true }),
        createLap({ timestamp: 10, isInvalid: true }),
      ]),
    ).toBeUndefined();
  });

  it("calculates averages only from valid laps", () => {
    const laps = [
      createLap({ time: 1000, isInvalid: false }),
      createLap({ time: 900, isInvalid: true }),
      createLap({ time: 2000, isInvalid: false }),
    ];

    expect(getAverageLap(laps, "time")).toBe(1500);
    expect(
      getAverageLap([
        createLap({ isInvalid: true }),
        createLap({ isInvalid: true }),
      ]),
    ).toBeUndefined();
  });

  it("ranks drivers by fastest valid lap and places drivers with only invalid laps last", () => {
    const driverA = createDriver("A", [
      createLap({ time_with_penalties: 1100, isInvalid: false, timestamp: 1 }),
    ]);
    const driverB = createDriver("B", [
      createLap({ time_with_penalties: 900, isInvalid: true, timestamp: 2 }),
      createLap({ time_with_penalties: 1200, isInvalid: false, timestamp: 3 }),
    ]);
    const driverC = createDriver("C", [
      createLap({ time_with_penalties: 800, isInvalid: true, timestamp: 4 }),
    ]);

    const ranking = getDriverRanking([driverA, driverB, driverC]);

    expect(ranking.map((entry) => entry.driver.uuid)).toEqual(["A", "B", "C"]);
    expect(getDriverFastestLap(driverC)).toBeUndefined();
  });

  it("resolves kart from fastest lap and lap->stint mapping", () => {
    const kartA: Kart = {
      uuid: "kart-a",
      name: "Kart A",
      createdAt: 1,
      updatedAt: 1,
      engine: "E",
      chassis: "C",
      type: "JKS",
      history: {
        laps: 0,
        totalTrainingsSessions: 0,
        totalTime: 0,
        firstTraining: 0,
        lastTraining: 0,
      },
    };
    const lap = createLap({
      timestamp: 101,
      time_with_penalties: 990,
      isInvalid: false,
    });
    const driver = createDriver("A", [lap], kartA.uuid);

    expect(getKartFromFastestLap(driver, [kartA])?.uuid).toBe(kartA.uuid);
    expect(getKartByLap(lap, driver, [kartA])?.name).toBe("Kart A");
    expect(
      getKartByStint(driver.stints[0], new Map([[kartA.uuid, kartA]]))?.name,
    ).toBe("Kart A");
  });

  it("uses fallback name when kart is missing", () => {
    const lap = createLap({ timestamp: 201, isInvalid: false });
    const driver = createDriver("A", [lap], "deleted-kart");
    const ranking = getDriverRanking([driver], []);

    expect(ranking[0]?.kart).toBeNull();
    expect(getKartDisplayName(ranking[0]?.kart)).toBe("N/A");
  });

  it("computes best and previous diffs from valid laps only", () => {
    const driverA = createDriver("A", [
      createLap({ time_with_penalties: 1000, isInvalid: false }),
    ]);
    const driverB = createDriver("B", [
      createLap({ time_with_penalties: 900, isInvalid: true }),
      createLap({ time_with_penalties: 1100, isInvalid: false }),
    ]);
    const driverC = createDriver("C", [
      createLap({ time_with_penalties: 950, isInvalid: true }),
    ]);
    const drivers = [driverA, driverB, driverC];

    expect(getDiffToBest(driverA, drivers)).toBe(0);
    expect(getDiffToBest(driverB, drivers)).toBe(100);
    expect(getDiffToBest(driverC, drivers)).toBeUndefined();
    expect(getDiffToPrevious(driverA, drivers)).toBe(0);
    expect(getDiffToPrevious(driverB, drivers)).toBe(100);
    expect(getDiffToPrevious(driverC, drivers)).toBeUndefined();
  });

  it("calculates lap penalty seconds from cones and gates", () => {
    const lap = createLap({ cones: 2, gates: 1 });

    expect(
      getLapPenaltySeconds(lap, {
        HIT_CONE: 2,
        MISSED_GATE: 10,
      }),
    ).toBe(14);

    expect(
      getLapPenaltySeconds(lap, {
        HIT_CONE: 3,
        MISSED_GATE: 10,
      }),
    ).toBe(16);
  });
});
