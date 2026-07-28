import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import slalomReducer from '@/lib/slalom/engine/reducer';
import getUUID from '@/lib/misc/getUUID';
import type { SlalomAction } from '../engine/actions';
import createMockSlalomState from './mocks/createMockSlalomState';

const NOW = new Date('2026-07-08T16:42:00Z');

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterAll(() => {
  vi.useRealTimers();
});

describe('slalomReducer', () => {
  it('should reset the stopwatch state when RESET_STOPWATCH action is dispatched', () => {
    const state = createMockSlalomState();

    const action: SlalomAction = { type: 'RESET_STOPWATCH' };
    const newState = slalomReducer(action, state);

    expect(newState.stopwatch).toEqual({
      isRunning: false,
      startedAt: undefined,
      elapsed: 0,
    });

    // Expect the rest to remain unchanged
    expect(newState.currentDriverUuid).toEqual(state.currentDriverUuid);
    expect(newState.currentStint).toEqual(state.currentStint);
    expect(newState.drivers).toEqual(state.drivers);
    expect(newState.session).toEqual(state.session);
  });

  it('should start the stopwatch state when START_STOPWATCH action is dispatched', () => {
    const state = createMockSlalomState();

    const action: SlalomAction = { type: 'START_STOPWATCH' };
    const newState = slalomReducer(action, state);

    expect(newState.stopwatch).toEqual({
      isRunning: true,
      startedAt: NOW.getTime(),
      elapsed: 0,
    });

    // Expect the rest to remain unchanged
    expect(newState.currentDriverUuid).toEqual(state.currentDriverUuid);
    expect(newState.currentStint).toEqual(state.currentStint);
    expect(newState.drivers).toEqual(state.drivers);
    expect(newState.session).toEqual(state.session);
  });

  it('should stop the stopwatch state when STOP_STOPWATCH action is dispatched', () => {
    const state = createMockSlalomState();

    const action: SlalomAction = { type: 'STOP_STOPWATCH' };
    const newState = slalomReducer(action, state);

    expect(newState.stopwatch).toEqual({
      isRunning: false,
      startedAt: state.stopwatch.startedAt,
      elapsed: state.stopwatch.elapsed,
    });

    // Expect the rest to remain unchanged
    expect(newState.currentDriverUuid).toEqual(state.currentDriverUuid);
    expect(newState.currentStint).toEqual(state.currentStint);
    expect(newState.drivers).toEqual(state.drivers);
    expect(newState.session).toEqual(state.session);
  });

  it('should update the elapsed time when TICK action is dispatched', () => {
    const state = createMockSlalomState();

    const action: SlalomAction = { type: 'TICK', payload: { elapsed: 10000 } };
    const newState = slalomReducer(action, state);

    expect(newState.stopwatch).toEqual({
      isRunning: true,
      startedAt: state.stopwatch.startedAt,
      elapsed: 10000,
    });

    // Expect the rest to remain unchanged
    expect(newState.currentDriverUuid).toEqual(state.currentDriverUuid);
    expect(newState.currentStint).toEqual(state.currentStint);
    expect(newState.drivers).toEqual(state.drivers);
    expect(newState.session).toEqual(state.session);
  });

  it("should return the state stopwatch elapsed time if the 'TICK' action is dispatched without a payload", () => {
    const state = createMockSlalomState();

    const action: SlalomAction = { type: 'TICK' };
    const newState = slalomReducer(action, state);

    expect(newState.stopwatch).toEqual({
      isRunning: true,
      startedAt: state.stopwatch.startedAt,
      elapsed: state.stopwatch.elapsed,
    });
  });

  it("should reset the stint if the 'RESET_STINT' action is dispatched", () => {
    const state = createMockSlalomState();

    const action: SlalomAction = { type: 'RESET_STINT' };
    const newState = slalomReducer(action, state);

    expect(newState.currentStint).toBeUndefined();

    // Reset the stopwatch as well
    expect(newState.stopwatch).toEqual({
      isRunning: false,
      startedAt: undefined,
      elapsed: 0,
    });

    // Expect the rest to remain unchanged
    expect(newState.currentDriverUuid).toEqual(state.currentDriverUuid);
    expect(newState.drivers).toEqual(state.drivers);
    expect(newState.session).toEqual(state.session);
  });

  it("should start a new stint if the 'START_STINT' action is dispatched", () => {
    const state = createMockSlalomState();

    const action: SlalomAction = {
      type: 'START_STINT',
      payload: {
        driverUuid: getUUID(),
        kartUuid: getUUID(),
      },
    };
    const newState = slalomReducer(action, state);

    expect(newState.currentStint).toEqual({
      uuid: expect.any(String),
      driverUuid: action.payload.driverUuid,
      kartUuid: action.payload.kartUuid,
      laps: [],
    });

    // Expect the rest to remain unchanged
    expect(newState.currentDriverUuid).toEqual(action.payload.driverUuid);
    expect(newState.drivers).toEqual(state.drivers);
    expect(newState.session).toEqual(state.session);
    expect(newState.stopwatch).toEqual({
      isRunning: false,
      startedAt: undefined,
      elapsed: 0,
    });
  });

  it('should return the state if the action type is unknown', () => {
    const state = createMockSlalomState();

    // Return a state with an not existing action type to test the default case
    const action = { type: 'NOT_EXISTING_ACTION' } as any;
    const newState = slalomReducer(action, state);

    expect(newState).toEqual(state);
  });
});
