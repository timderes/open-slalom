import { describe, expect, it } from 'vitest';
import {
  getAverageLap,
  getDiffToBest,
  getDiffToPrevious,
  getDriverFastestLap,
  getDriverLaps,
  getDriverRanking,
  getFastestLap,
  getFastestLapTimestamp,
  getLapPenaltySeconds,
  getTotalLapTime,
  getValidLaps,
} from './selectors';

const createLap = (overrides: Partial<Lap>): Lap => ({
  time: 1000,
  time_with_penalties: 1000,
  cones: 0,
  gates: 0,
  timestamp: 1,
  isInvalid: false,
  ...overrides,
});

const createDriver = (uuid: string, laps: Lap[]): TrainingDriver => ({
  uuid,
  firstName: `First-${uuid}`,
  lastName: `Last-${uuid}`,
  birthDate: '2000-01-01',
  gender: 'other',
  createdAt: 1,
  updatedAt: 1,
  stints: [{ laps }],
  isActive: true,
});

describe('training selectors', () => {
  describe('lap selectors', () => {
    it('filters invalid laps from valid lap selector', () => {
      const laps = [
        createLap({ timestamp: 1, isInvalid: false }),
        createLap({ timestamp: 2, isInvalid: true }),
        createLap({ timestamp: 3, isInvalid: false }),
      ];

      expect(getValidLaps(laps).map((lap) => lap.timestamp)).toEqual([1, 3]);
    });

    it('returns empty array when all laps are invalid', () => {
      const laps = [createLap({ isInvalid: true }), createLap({ isInvalid: true })];

      expect(getValidLaps(laps)).toEqual([]);
    });

    it('excludes invalid laps for fastest lap and returns undefined when only invalid laps exist', () => {
      expect(
        getFastestLap([createLap({ isInvalid: true }), createLap({ isInvalid: true })]),
      ).toBeUndefined();
    });

    it('calculates fastest lap correctly', () => {
      const laps = [
        createLap({ timestamp: 1, time_with_penalties: 900, isInvalid: true }),
        createLap({ timestamp: 2, time_with_penalties: 1200, isInvalid: false }),
        createLap({ timestamp: 3, time_with_penalties: 1100, isInvalid: false }),
      ];

      expect(getFastestLap(laps)?.timestamp).toBe(3);
    });

    it('calculates averages only from valid laps', () => {
      const laps = [
        createLap({ time: 1000, isInvalid: false }),
        createLap({ time: 900, isInvalid: true }),
        createLap({ time: 2000, isInvalid: false }),
      ];

      expect(getAverageLap(laps, 'time')).toBe(1500);

      expect(
        getAverageLap([createLap({ isInvalid: true }), createLap({ isInvalid: true })]),
      ).toBeUndefined();
    });

    it('calculates total lap time using only valid laps', () => {
      const laps = [
        createLap({ time: 1000, isInvalid: false }),
        createLap({ time: 500, isInvalid: true }),
        createLap({ time: 2000, isInvalid: false }),
      ];

      expect(getTotalLapTime(laps)).toBe(3000);
    });

    it('returns 0 total lap time when no valid laps exist', () => {
      expect(
        getTotalLapTime([createLap({ isInvalid: true }), createLap({ isInvalid: true })]),
      ).toBe(0);
    });
  });

  describe('driver helpers', () => {
    it('collects laps from all stints', () => {
      const lap1 = createLap({ timestamp: 1 });
      const lap2 = createLap({ timestamp: 2 });

      const driver = {
        ...createDriver('A', []),
        stints: [{ laps: [lap1] }, { laps: [lap2] }],
      };

      expect(getDriverLaps(driver)).toEqual([lap1, lap2]);
    });

    it('handles missing stints and laps', () => {
      expect(
        getDriverLaps({
          ...createDriver('A', []),
          stints: undefined as any,
        }),
      ).toEqual([]);

      expect(
        getDriverLaps({
          ...createDriver('B', []),
          stints: [{ laps: undefined as any }],
        }),
      ).toEqual([]);
    });

    it('returns fastest driver lap', () => {
      const driver = createDriver('A', [
        createLap({ timestamp: 1, time_with_penalties: 1200 }),
        createLap({ timestamp: 2, time_with_penalties: 900 }),
      ]);

      expect(getDriverFastestLap(driver)?.timestamp).toBe(2);
    });

    it('returns undefined fastest driver lap when only invalid laps exist', () => {
      const driver = createDriver('A', [createLap({ timestamp: 1, isInvalid: true })]);

      expect(getDriverFastestLap(driver)).toBeUndefined();
    });

    it('returns timestamp of fastest valid lap', () => {
      const driver = createDriver('A', [
        createLap({ timestamp: 10, time_with_penalties: 1200 }),
        createLap({ timestamp: 20, time_with_penalties: 1000 }),
      ]);

      expect(getFastestLapTimestamp(driver)).toBe(20);
    });

    it('returns undefined timestamp when no valid lap exists', () => {
      const driver = createDriver('A', [createLap({ timestamp: 10, isInvalid: true })]);

      expect(getFastestLapTimestamp(driver)).toBeUndefined();
    });
  });

  describe('driver ranking', () => {
    it('ranks drivers by fastest valid lap and places drivers with only invalid laps last', () => {
      const driverA = createDriver('A', [
        createLap({ time_with_penalties: 1100, isInvalid: false, timestamp: 1 }),
      ]);

      const driverB = createDriver('B', [
        createLap({ time_with_penalties: 900, isInvalid: true, timestamp: 2 }),
        createLap({ time_with_penalties: 1200, isInvalid: false, timestamp: 3 }),
      ]);

      const driverC = createDriver('C', [
        createLap({ time_with_penalties: 800, isInvalid: true, timestamp: 4 }),
      ]);

      const ranking = getDriverRanking([driverA, driverB, driverC]);

      expect(ranking.map((entry) => entry.driver.uuid)).toEqual(['A', 'B', 'C']);
      expect(getDriverFastestLap(driverC)).toBeUndefined();
    });

    it('uses the fastest lap across multiple stints and keeps kart uuid', () => {
      const driver = {
        ...createDriver('A', []),
        kartUuid: 'driver-kart',
        stints: [
          {
            kartUuid: 'kart-1',
            laps: [createLap({ timestamp: 1, time_with_penalties: 1200 })],
          },
          {
            kartUuid: 'kart-2',
            laps: [createLap({ timestamp: 2, time_with_penalties: 900 })],
          },
        ],
      };

      const [ranking] = getDriverRanking([driver]);

      expect(ranking.fastestLap?.timestamp).toBe(2);
      expect(ranking.fastestLapTime).toBe(900);
      expect(ranking.fastestKartUuid).toBe('kart-2');
    });

    it('falls back to driver kart uuid when stint kart uuid is missing', () => {
      const driver = {
        ...createDriver('A', []),
        kartUuid: 'driver-kart',
        stints: [
          {
            laps: [createLap({ time_with_penalties: 1000 })],
          },
        ],
      };

      const [ranking] = getDriverRanking([driver]);

      expect(ranking.fastestKartUuid).toBe('driver-kart');
    });

    it('keeps original order when all drivers have no valid laps', () => {
      const driverA = createDriver('A', [createLap({ isInvalid: true })]);
      const driverB = createDriver('B', [createLap({ isInvalid: true })]);

      const ranking = getDriverRanking([driverA, driverB]);

      expect(ranking.map((entry) => entry.driver.uuid)).toEqual(['A', 'B']);
    });
  });

  describe('time differences', () => {
    it('computes best and previous diffs from valid laps only', () => {
      const driverA = createDriver('A', [
        createLap({ time_with_penalties: 1000, isInvalid: false }),
      ]);

      const driverB = createDriver('B', [
        createLap({ time_with_penalties: 900, isInvalid: true }),
        createLap({ time_with_penalties: 1100, isInvalid: false }),
      ]);

      const driverC = createDriver('C', [createLap({ time_with_penalties: 950, isInvalid: true })]);

      const drivers = [driverA, driverB, driverC];

      expect(getDiffToBest(driverA, drivers)).toBe(0);
      expect(getDiffToBest(driverB, drivers)).toBe(100);
      expect(getDiffToBest(driverC, drivers)).toBeUndefined();

      expect(getDiffToPrevious(driverA, drivers)).toBe(0);
      expect(getDiffToPrevious(driverB, drivers)).toBe(100);
      expect(getDiffToPrevious(driverC, drivers)).toBeUndefined();
    });

    it('returns undefined when no driver has a valid fastest lap', () => {
      const driver = createDriver('A', [createLap({ isInvalid: true })]);
      expect(getDiffToBest(driver, [driver])).toBeUndefined();
    });

    it('returns undefined when driver is not part of ranking', () => {
      const driverA = createDriver('A', [createLap({ time_with_penalties: 1000 })]);
      const driverB = createDriver('B', [createLap({ time_with_penalties: 1100 })]);

      expect(getDiffToPrevious(driverB, [driverA])).toBeUndefined();
    });

    it('returns undefined when ranking has no valid fastest lap', () => {
      const driver = createDriver('A', [
        createLap({ time_with_penalties: 1000, isInvalid: false }),
      ]);
      const otherDriver = createDriver('B', [createLap({ isInvalid: true })]);

      expect(getDiffToBest(driver, [otherDriver])).toBeUndefined();
    });
  });

  describe('penalties', () => {
    it('calculates lap penalty seconds from cones and gates', () => {
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
});
