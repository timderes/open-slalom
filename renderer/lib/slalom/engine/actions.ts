/**
 * Actions for a slalom session (training or competition).
 *
 * Session:
 * - UPDATE_SESSION_SETTINGS
 * - SAVE_SESSION
 * - LOAD_SESSION
 *
 * Stopwatch:
 * - START_STOPWATCH
 * - STOP_STOPWATCH
 * - RESET_STOPWATCH
 * - TICK
 *
 * Stint:
 * - START_STINT
 * - FINISH_STINT
 * - RESET_STINT
 *
 * Lap:
 * - ADD_LAP
 * - TOGGLE_LAP_VALIDITY
 * - UPDATE_CONES
 * - UPDATE_GATES
 *
 * Drivers:
 * - ADD_DRIVER
 * - SELECT_DRIVER
 * - REMOVE_DRIVER
 * - SKIP_DRIVER
 * - UPDATE_DRIVER_KART
 */

export type SlalomAction =
  //
  // Session
  //
  | {
      type: 'UPDATE_SESSION_SETTINGS';
      payload: Partial<Session>;
    }
  | {
      type: 'SAVE_SESSION';
    }
  | {
      type: 'LOAD_SESSION';
      payload: {
        sessionUUID: UUID;
      };
    }
  //
  // Stopwatch
  //
  | {
      type: 'START_STOPWATCH';
      // Maybe not needed, but we can pass a timestamp to
      // start the stopwatch at a specific time
      payload?: {
        startedAt?: number;
      };
    }
  | {
      type: 'STOP_STOPWATCH';
    }
  | {
      type: 'RESET_STOPWATCH';
    }
  | {
      type: 'TICK';
      payload?: {
        // The elapsed time in milliseconds since the
        // stopwatch was started
        elapsed: number;
      };
    }
  //
  // Stint
  //
  | {
      type: 'START_STINT';
      payload: {
        driverUuid: UUID;
        // A driver can start a stint without a specific kart,
        // in which case the kartUuid will be undefined
        kartUuid?: UUID;
      };
    }
  | {
      type: 'FINISH_STINT';
    }
  | {
      type: 'RESET_STINT';
    }
  //
  // Lap
  //
  | {
      type: 'ADD_LAP';
      payload: {
        timestamp: number; // Unix timestamp in milliseconds
      };
    }
  | {
      type: 'TOGGLE_LAP_VALIDITY';
      payload: {
        lapUuid: UUID;
      };
    }
  | {
      type: 'UPDATE_CONES';
      payload: {
        lapUuid: UUID;
        cones: number;
      };
    }
  | {
      type: 'UPDATE_GATES';
      payload: {
        lapUuid: UUID;
        gates: number;
      };
    }
  //
  // Drivers
  //
  | {
      type: 'ADD_DRIVER';
      payload: {
        driverUuid: UUID;
      };
    }
  | {
      type: 'SELECT_DRIVER';
      payload: {
        driverUuid: UUID;
      };
    }
  | {
      type: 'REMOVE_DRIVER';
      payload: {
        driverUuid: UUID;
      };
    }
  | {
      type: 'SKIP_DRIVER';
    }
  | {
      type: 'UPDATE_DRIVER_KART';
      payload: {
        driverUuid: UUID;
        kartUuid?: UUID;
      };
    };
