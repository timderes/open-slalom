import type { SlalomAction } from './actions';
import type { SlalomState } from '../types/state';
import getUUID from '@/lib/misc/getUUID';

/**
 * Responsible for handling actions related to the slalom training or
 * competition sessions.
 */
const slalomReducer = (action: SlalomAction, state: SlalomState): SlalomState => {
  switch (action.type) {
    //
    // Session
    //

    //
    // Stopwatch
    //
    case 'RESET_STOPWATCH': {
      return {
        ...state,

        stopwatch: {
          isRunning: false,
          startedAt: undefined,
          elapsed: 0,
        },
      };
    }
    case 'START_STOPWATCH': {
      const startedAt = action.payload?.startedAt ?? Date.now();

      return {
        ...state,

        stopwatch: {
          isRunning: true,
          startedAt,
          elapsed: 0,
        },
      };
    }
    case 'STOP_STOPWATCH': {
      return {
        ...state,

        stopwatch: {
          ...state.stopwatch,
          isRunning: false,
        },
      };
    }
    case 'TICK': {
      const elapsed = action.payload?.elapsed ?? state.stopwatch.elapsed;

      return {
        ...state,

        stopwatch: {
          ...state.stopwatch,
          elapsed,
        },
      };
    }

    //
    // Stint
    //
    case 'RESET_STINT': {
      return {
        ...state,

        currentStint: undefined,

        // Also reset the stopwatch for a new stint
        stopwatch: {
          isRunning: false,
          startedAt: undefined,
          elapsed: 0,
        },
      };
    }
    case 'START_STINT': {
      return {
        ...state,

        // Prepare for the next stint by setting the current driver
        // and creating a new stint object
        currentDriverUuid: action.payload.driverUuid,

        currentStint: {
          uuid: getUUID(),
          driverUuid: action.payload.driverUuid,
          kartUuid: action.payload.kartUuid,
          laps: [],
        },

        stopwatch: {
          isRunning: false,
          startedAt: undefined,
          elapsed: 0,
        },
      };
    }

    //
    // Lap
    //

    //
    // Drivers
    //

    default:
      return state;
  }
};

export default slalomReducer;
