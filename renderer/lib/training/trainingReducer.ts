import { TIME_PENALTIES_JKS, TIME_PENALTIES_SKS } from '@/lib/constants';

// =========================
// TYPES
// =========================

export type TrainingState = {
  drivers: TrainingDriver[];
  currentDriverIndex: number;
  currentDriver?: TrainingDriver;

  laps: Lap[];
  currentLap: number;
  lapsPerStint: number;
  unlimitedLapsPerStint: boolean;
  mode: SlalomType;

  time: number;
  isRunning: boolean;
};

export type TrainingAction =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'ADD_LAP'; payload: { timestamp: number } }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'TICK'; payload: number }
  | { type: 'SET_DRIVERS'; payload: TrainingDriver[] }
  | { type: 'SET_LAPS_PER_STINT'; payload: number }
  | { type: 'SET_UNLIMITED_LAPS'; payload: boolean }
  | { type: 'SET_MODE'; payload: SlalomType }
  | { type: 'UPDATE_LAP_CONES'; payload: { index: number; cones: number } }
  | { type: 'UPDATE_LAP_GATES'; payload: { index: number; gates: number } }
  | { type: 'TOGGLE_LAP_INVALID'; payload: { index: number } }
  | { type: 'RESTORE'; payload: Partial<TrainingState> };

// =========================
// INITIAL STATE
// =========================

export const initialState: TrainingState = {
  drivers: [],
  currentDriverIndex: 0,
  currentDriver: undefined,

  laps: [],
  currentLap: 1,
  lapsPerStint: 3,
  unlimitedLapsPerStint: false,
  mode: 'JKS',

  time: 0,
  isRunning: false,
};

// =========================
// REDUCER
// =========================

export const trainingReducer = (state: TrainingState, action: TrainingAction): TrainingState => {
  switch (action.type) {
    case 'START': {
      if (!state.currentDriver || state.isRunning) return state;

      return {
        ...state,
        isRunning: true,
        time: 0,
      };
    }

    case 'STOP': {
      return {
        ...state,
        isRunning: false,
      };
    }

    case 'ADD_LAP': {
      if (!state.isRunning) return state;

      // If unlimited mode is enabled we never auto-stop the stopwatch when
      // adding laps. For finite mode we stop when reaching the configured
      // lapsPerStint.
      const isFinalLap = !state.unlimitedLapsPerStint && state.currentLap >= state.lapsPerStint;

      const newLap: Lap = {
        time: state.time,
        time_with_penalties: state.time,
        timestamp: action.payload.timestamp,
        cones: 0,
        gates: 0,
        isInvalid: false,
      };

      return {
        ...state,
        laps: [...state.laps, newLap],
        currentLap: isFinalLap ? state.currentLap : state.currentLap + 1,
        isRunning: !isFinalLap,
      };
    }

    case 'RESET': {
      return {
        ...state,
        laps: [],
        time: 0,
        currentLap: 1,
        isRunning: false,
      };
    }

    case 'SKIP': {
      if (state.drivers.length === 0) return state;

      let nextIndex = (state.currentDriverIndex + 1) % state.drivers.length;

      // When the next driver is not active, increase by one more until we find an
      // active driver or loop back to the start
      if (!state.drivers[nextIndex].isActive) {
        const startingIndex = nextIndex;

        do {
          nextIndex = (nextIndex + 1) % state.drivers.length;
        } while (nextIndex !== startingIndex && !state.drivers[nextIndex].isActive);

        // If we looped back to the starting index and didn't find any active driver,
        // return the current state
        if (!state.drivers[nextIndex].isActive) {
          return state;
        }
      }

      return {
        ...state,
        currentDriverIndex: nextIndex,
        currentDriver: state.drivers[nextIndex],
        laps: [],
        currentLap: 1,
        time: 0,
        isRunning: false,
      };
    }

    case 'TICK': {
      return {
        ...state,
        time: action.payload,
      };
    }

    case 'SET_DRIVERS': {
      return {
        ...state,
        drivers: action.payload,
        currentDriver: action.payload[state.currentDriverIndex],
      };
    }

    case 'SET_LAPS_PER_STINT': {
      return {
        ...state,
        lapsPerStint: action.payload,
      };
    }

    case 'SET_UNLIMITED_LAPS': {
      return {
        ...state,
        unlimitedLapsPerStint: action.payload,
      };
    }

    case 'SET_MODE': {
      return {
        ...state,
        mode: action.payload,
      };
    }

    case 'UPDATE_LAP_CONES': {
      if (!state.laps[action.payload.index]) return state;

      const updatedLaps = [...state.laps];
      const penalties = state.mode === 'SKS' ? TIME_PENALTIES_SKS : TIME_PENALTIES_JKS;
      updatedLaps[action.payload.index] = {
        ...updatedLaps[action.payload.index],
        cones: action.payload.cones,
        time_with_penalties:
          updatedLaps[action.payload.index].time +
          1000 *
            (action.payload.cones * penalties.HIT_CONE +
              updatedLaps[action.payload.index].gates * penalties.MISSED_GATE),
      };

      return {
        ...state,
        laps: updatedLaps,
      };
    }

    case 'UPDATE_LAP_GATES': {
      if (!state.laps[action.payload.index]) return state;

      const updatedLaps = [...state.laps];
      const penalties = state.mode === 'SKS' ? TIME_PENALTIES_SKS : TIME_PENALTIES_JKS;
      updatedLaps[action.payload.index] = {
        ...updatedLaps[action.payload.index],
        gates: action.payload.gates,
        time_with_penalties:
          updatedLaps[action.payload.index].time +
          1000 *
            (updatedLaps[action.payload.index].cones * penalties.HIT_CONE +
              action.payload.gates * penalties.MISSED_GATE),
      };

      return {
        ...state,
        laps: updatedLaps,
      };
    }

    case 'TOGGLE_LAP_INVALID': {
      if (!state.laps[action.payload.index]) return state;

      const updatedLaps = [...state.laps];
      updatedLaps[action.payload.index] = {
        ...updatedLaps[action.payload.index],
        isInvalid: !updatedLaps[action.payload.index].isInvalid,
      };

      return {
        ...state,
        laps: updatedLaps,
      };
    }

    case 'RESTORE': {
      const payload = action.payload;
      const drivers = payload.drivers ?? state.drivers;
      const currentDriverIndex = payload.currentDriverIndex ?? state.currentDriverIndex;
      const currentDriver = payload.currentDriver ?? drivers[currentDriverIndex];

      return {
        drivers,
        currentDriverIndex,
        currentDriver,
        laps: payload.laps ?? state.laps,
        currentLap: payload.currentLap ?? state.currentLap,
        lapsPerStint: payload.lapsPerStint ?? state.lapsPerStint,
        unlimitedLapsPerStint: payload.unlimitedLapsPerStint ?? state.unlimitedLapsPerStint,
        mode: payload.mode ?? state.mode,
        time: payload.time ?? state.time,
        isRunning: false,
      };
    }

    default:
      return state;
  }
};
