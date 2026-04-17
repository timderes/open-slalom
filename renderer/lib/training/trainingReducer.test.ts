import { describe, expect, it } from "vitest";
import { initialState, trainingReducer } from "./trainingReducer";

const createDriver = (uuid: string): DriverWithStints => ({
  uuid,
  firstName: `First-${uuid}`,
  lastName: `Last-${uuid}`,
  birthDate: "2000-01-01",
  sex: "other",
  driverClass: { jks: 1, sks: 1 },
  createdAt: 1,
  updatedAt: 1,
  stints: [],
});

const createRunningState = (mode: SlalomType = "JKS") => {
  const firstDriver = createDriver("driver-1");

  return {
    ...initialState,
    mode,
    drivers: [firstDriver],
    currentDriver: firstDriver,
    currentLap: 1,
    lapsPerStint: 3,
    time: 1234,
    isRunning: true,
  };
};

describe("trainingReducer", () => {
  it("starts a stint when a driver exists", () => {
    const firstDriver = createDriver("driver-1");
    const started = trainingReducer(
      {
        ...initialState,
        drivers: [firstDriver],
        currentDriver: firstDriver,
        isRunning: false,
        time: 999,
      },
      { type: "START" },
    );

    expect(started.isRunning).toBe(true);
    expect(started.time).toBe(0);
  });

  it("adds a lap and increments current lap for non-final laps", () => {
    const next = trainingReducer(createRunningState(), {
      type: "ADD_LAP",
      payload: { timestamp: 777 },
    });

    expect(next.laps).toHaveLength(1);
    expect(next.laps[0].timestamp).toBe(777);
    expect(next.laps[0].time).toBe(1234);
    expect(next.currentLap).toBe(2);
    expect(next.isRunning).toBe(true);
  });

  it("adds final lap and stops running", () => {
    const next = trainingReducer(
      {
        ...createRunningState(),
        currentLap: 3,
        lapsPerStint: 3,
      },
      {
        type: "ADD_LAP",
        payload: { timestamp: 888 },
      },
    );

    expect(next.laps).toHaveLength(1);
    expect(next.currentLap).toBe(3);
    expect(next.isRunning).toBe(false);
  });

  it("skips to next driver and resets stint state", () => {
    const firstDriver = createDriver("driver-1");
    const secondDriver = createDriver("driver-2");
    const next = trainingReducer(
      {
        ...initialState,
        drivers: [firstDriver, secondDriver],
        currentDriverIndex: 0,
        currentDriver: firstDriver,
        laps: [
          {
            time: 1000,
            time_with_penalties: 1000,
            timestamp: 10,
            cones: 0,
            gates: 0,
            isInvalid: false,
          },
        ],
        currentLap: 2,
        time: 1000,
        isRunning: true,
      },
      { type: "SKIP" },
    );

    expect(next.currentDriverIndex).toBe(1);
    expect(next.currentDriver?.uuid).toBe(secondDriver.uuid);
    expect(next.laps).toEqual([]);
    expect(next.currentLap).toBe(1);
    expect(next.time).toBe(0);
    expect(next.isRunning).toBe(false);
  });

  it("applies JKS cone penalties", () => {
    const next = trainingReducer(
      {
        ...createRunningState("JKS"),
        laps: [
          {
            time: 5000,
            time_with_penalties: 5000,
            timestamp: 1,
            cones: 0,
            gates: 0,
            isInvalid: false,
          },
        ],
      },
      {
        type: "UPDATE_LAP_CONES",
        payload: { index: 0, cones: 2 },
      },
    );

    expect(next.laps[0].time_with_penalties).toBe(9000);
  });

  it("applies SKS cone penalties", () => {
    const next = trainingReducer(
      {
        ...createRunningState("SKS"),
        laps: [
          {
            time: 5000,
            time_with_penalties: 5000,
            timestamp: 1,
            cones: 0,
            gates: 0,
            isInvalid: false,
          },
        ],
      },
      {
        type: "UPDATE_LAP_CONES",
        payload: { index: 0, cones: 2 },
      },
    );

    expect(next.laps[0].time_with_penalties).toBe(11000);
  });
});
