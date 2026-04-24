import { describe, expect, it } from "vitest";
import { normalizeTrainingKartTracking } from "./normalizeKartTracking";

const createKart = (uuid: string, name = "Kart"): Kart => ({
  uuid,
  name,
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
});

const createLap = (timestamp: number): Lap => ({
  time: 1000,
  time_with_penalties: 1000,
  cones: 0,
  gates: 0,
  timestamp,
  isInvalid: false,
});

const createTraining = (): Training => ({
  lapsPerStint: 3,
  mode: "JKS",
  karts: [],
  uuid: "training-1",
  createdAt: 1,
  updatedAt: 1,
  drivers: [
    {
      uuid: "driver-1",
      firstName: "A",
      lastName: "B",
      birthDate: "2000-01-01",
      sex: "other",
      driverClass: { jks: 1, sks: 1 },
      createdAt: 1,
      updatedAt: 1,
      stints: [{ laps: [createLap(1)], kartUUID: null }],
    },
  ],
});

describe("normalizeTrainingKartTracking", () => {
  it("migrates legacy kart object fields to uuid fields", () => {
    const training = createTraining();
    const legacyKart = createKart("kart-1", "Legacy Kart");
    const driver = training.drivers[0] as DriverWithStints & {
      currentKart?: Kart;
    };
    const stint = driver.stints[0] as Stint & {
      kart?: Kart;
      driverId?: string;
      kartUUID?: string | null;
    };

    driver.currentKart = legacyKart;
    stint.kart = legacyKart;
    stint.driverId = driver.uuid;
    delete stint.kartUUID;

    normalizeTrainingKartTracking(training);

    expect(driver.currentKartUUID).toBe("kart-1");
    expect("currentKart" in driver).toBe(false);
    expect(stint.kartUUID).toBe("kart-1");
    expect("kart" in stint).toBe(false);
    expect("driverId" in stint).toBe(false);
  });

  it("preserves explicit null kartUUID values", () => {
    const training = createTraining();
    const driver = training.drivers[0] as DriverWithStints & {
      currentKart?: Kart;
    };
    const stint = driver.stints[0] as Stint & {
      kart?: Kart;
      kartUUID?: string | null;
    };

    stint.kartUUID = null;
    stint.kart = createKart("kart-2", "Should not overwrite null");
    driver.currentKartUUID = null;
    driver.currentKart = createKart("kart-3", "Should not overwrite null");

    normalizeTrainingKartTracking(training);

    expect(stint.kartUUID).toBeNull();
    expect(driver.currentKartUUID).toBeNull();
  });
});
