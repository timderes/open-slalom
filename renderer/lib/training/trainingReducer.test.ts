import { describe, expect, it } from 'vitest';
import { initialState, trainingReducer } from './trainingReducer';

const createDriver = (uuid: string): TrainingDriver => ({
  uuid,
  firstName: `First-${uuid}`,
  lastName: `Last-${uuid}`,
  birthDate: '2000-01-01',
  gender: 'other',
  createdAt: 1,
  updatedAt: 1,
  stints: [],
  isActive: true,
});

const createRunningState = (mode: SlalomType = 'JKS') => {
  const firstDriver = createDriver('driver-1');

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

describe('trainingReducer', () => {
  // =========================
  // START / STOP
  // =========================

  it('starts a stint when driver exists', () => {
    const firstDriver = createDriver('driver-1');

    const next = trainingReducer(
      {
        ...initialState,
        drivers: [firstDriver],
        currentDriver: firstDriver,
        isRunning: false,
        time: 999,
      },
      { type: 'START' },
    );

    expect(next.isRunning).toBe(true);
    expect(next.time).toBe(0);
  });

  it('START returns state when no currentDriver exists', () => {
    const state = {
      ...initialState,
      currentDriver: undefined,
      isRunning: false,
    };

    const next = trainingReducer(state, { type: 'START' });

    expect(next).toBe(state);
  });

  it('START returns state when already running', () => {
    const state = createRunningState();

    const next = trainingReducer(state, { type: 'START' });

    expect(next).toBe(state);
  });

  // =========================
  // ADD LAP
  // =========================

  it('adds a lap and increments current lap', () => {
    const next = trainingReducer(createRunningState(), {
      type: 'ADD_LAP',
      payload: { timestamp: 777 },
    });

    expect(next.laps).toHaveLength(1);
    expect(next.laps[0].timestamp).toBe(777);
    expect(next.currentLap).toBe(2);
    expect(next.isRunning).toBe(true);
  });

  it('adds final lap and stops running', () => {
    const next = trainingReducer(
      {
        ...createRunningState(),
        currentLap: 3,
        lapsPerStint: 3,
      },
      {
        type: 'ADD_LAP',
        payload: { timestamp: 888 },
      },
    );

    expect(next.isRunning).toBe(false);
  });

  // =========================
  // SKIP
  // =========================

  it('skips to next driver and resets state', () => {
    const d1 = createDriver('1');
    const d2 = createDriver('2');

    const next = trainingReducer(
      {
        ...initialState,
        drivers: [d1, d2],
        currentDriverIndex: 0,
        currentDriver: d1,
        laps: [],
        currentLap: 2,
        time: 1000,
        isRunning: true,
      },
      { type: 'SKIP' },
    );

    expect(next.currentDriverIndex).toBe(1);
    expect(next.currentDriver?.uuid).toBe('2');
    expect(next.laps).toEqual([]);
    expect(next.currentLap).toBe(1);
    expect(next.time).toBe(0);
    expect(next.isRunning).toBe(false);
  });

  it('SKIP returns state when no drivers exist', () => {
    const next = trainingReducer(initialState, { type: 'SKIP' });
    expect(next).toBe(initialState);
  });

  it('SKIP ignores inactive drivers', () => {
    const d1 = { ...createDriver('1'), isActive: false };
    const d2 = createDriver('2');

    const next = trainingReducer(
      {
        ...initialState,
        drivers: [d1, d2],
        currentDriverIndex: 0,
        currentDriver: d1,
      },
      { type: 'SKIP' },
    );

    expect(next.currentDriver?.uuid).toBe('2');
  });

  it('SKIP returns state if no active driver exists', () => {
    const d1 = { ...createDriver('1'), isActive: false };
    const d2 = { ...createDriver('2'), isActive: false };

    const state = {
      ...initialState,
      drivers: [d1, d2],
      currentDriverIndex: 0,
      currentDriver: d1,
    };

    const next = trainingReducer(state, { type: 'SKIP' });

    expect(next).toBe(state);
  });

  // =========================
  // LAP PENALTIES
  // =========================

  it('applies cone penalties JKS', () => {
    const next = trainingReducer(
      {
        ...createRunningState('JKS'),
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
        type: 'UPDATE_LAP_CONES',
        payload: { index: 0, cones: 2 },
      },
    );

    expect(next.laps[0].time_with_penalties).toBe(9000);
  });

  it('applies cone penalties SKS', () => {
    const next = trainingReducer(
      {
        ...createRunningState('SKS'),
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
        type: 'UPDATE_LAP_CONES',
        payload: { index: 0, cones: 2 },
      },
    );

    expect(next.laps[0].time_with_penalties).toBe(11000);
  });

  it('keeps gate penalties when updating cones', () => {
    const next = trainingReducer(
      {
        ...createRunningState('JKS'),
        laps: [
          {
            time: 5000,
            time_with_penalties: 5000,
            timestamp: 1,
            cones: 0,
            gates: 1,
            isInvalid: false,
          },
        ],
      },
      {
        type: 'UPDATE_LAP_CONES',
        payload: { index: 0, cones: 2 },
      },
    );

    expect(next.laps[0].time_with_penalties).toBe(19000);
  });

  it('UPDATE_LAP_GATES updates correctly', () => {
    const next = trainingReducer(
      {
        ...createRunningState(),
        laps: [
          {
            time: 5000,
            time_with_penalties: 5000,
            timestamp: 1,
            cones: 1,
            gates: 0,
            isInvalid: false,
          },
        ],
      },
      {
        type: 'UPDATE_LAP_GATES',
        payload: { index: 0, gates: 2 },
      },
    );

    expect(next.laps[0].gates).toBe(2);
  });

  it('TOGGLE_LAP_INVALID toggles state', () => {
    const next = trainingReducer(
      {
        ...createRunningState(),
        laps: [
          {
            time: 1,
            time_with_penalties: 1,
            timestamp: 1,
            cones: 0,
            gates: 0,
            isInvalid: false,
          },
        ],
      },
      {
        type: 'TOGGLE_LAP_INVALID',
        payload: { index: 0 },
      },
    );

    expect(next.laps[0].isInvalid).toBe(true);
  });

  // =========================
  // DRIVER UPDATE
  // =========================

  it('UPDATE_DRIVER_KART updates correct driver only', () => {
    const d1 = createDriver('1');
    const d2 = createDriver('2');

    const next = trainingReducer(
      {
        ...initialState,
        drivers: [d1, d2],
        currentDriver: d1,
      },
      {
        type: 'UPDATE_DRIVER_KART',
        payload: { driverUuid: '2', kartUuid: 'kart-2' },
      },
    );

    expect(next.drivers[1].kartUuid).toBe('kart-2');
    expect(next.drivers[0].kartUuid).toBeUndefined();
  });

  it('SET_STINT_KART updates currentDriver safely', () => {
    const d1 = createDriver('1');

    const next = trainingReducer(
      {
        ...initialState,
        currentDriver: d1,
      },
      {
        type: 'SET_STINT_KART',
        payload: { kartUuid: 'kart-x' },
      },
    );

    expect(next.currentDriver?.kartUuid).toBe('kart-x');
  });

  it('SET_STINT_KART handles undefined currentDriver', () => {
    const next = trainingReducer(initialState, {
      type: 'SET_STINT_KART',
      payload: { kartUuid: 'kart-x' },
    });

    expect(next.currentDriver).toBeUndefined();
  });

  // =========================
  // RESTORE
  // =========================

  it('RESTORE merges state correctly', () => {
    const next = trainingReducer(initialState, {
      type: 'RESTORE',
      payload: {
        time: 999,
        currentLap: 5,
      },
    });

    expect(next.time).toBe(999);
    expect(next.currentLap).toBe(5);
  });

  it('RESTORE falls back to state values', () => {
    const state = {
      ...initialState,
      time: 100,
      currentLap: 1,
    };

    const next = trainingReducer(state, {
      type: 'RESTORE',
      payload: {},
    });

    expect(next.time).toBe(100);
    expect(next.currentLap).toBe(1);
  });

  // =========================
  // SIMPLE ACTIONS
  // =========================

  it('SET_LAPS_PER_STINT updates value', () => {
    const next = trainingReducer(initialState, {
      type: 'SET_LAPS_PER_STINT',
      payload: 10,
    });

    expect(next.lapsPerStint).toBe(10);
  });

  it('SET_UNLIMITED_LAPS updates flag', () => {
    const next = trainingReducer(initialState, {
      type: 'SET_UNLIMITED_LAPS',
      payload: true,
    });

    expect(next.unlimitedLapsPerStint).toBe(true);
  });

  it('SET_MODE updates mode', () => {
    const next = trainingReducer(initialState, {
      type: 'SET_MODE',
      payload: 'SKS',
    });

    expect(next.mode).toBe('SKS');
  });

  it('TICK updates time', () => {
    const next = trainingReducer(initialState, {
      type: 'TICK',
      payload: 1234,
    });

    expect(next.time).toBe(1234);
  });

  it('STOP disables running', () => {
    const next = trainingReducer({ ...createRunningState(), isRunning: true }, { type: 'STOP' });

    expect(next.isRunning).toBe(false);
  });

  it('unknown action returns state', () => {
    const state = createRunningState();

    const next = trainingReducer(state, {
      type: 'UNKNOWN' as any,
    });

    expect(next).toBe(state);
  });
});
