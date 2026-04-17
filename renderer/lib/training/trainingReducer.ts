// =========================
// TYPES
// =========================

export type TrainingState = {
  drivers: DriverWithStints[];
  currentDriverIndex: number;
  currentDriver?: DriverWithStints;

  laps: Lap[];
  currentLap: number;
  lapsPerStint: number;

  time: number;
  isRunning: boolean;
};

export type TrainingAction =
  | { type: "START" }
  | { type: "LAP" }
  | { type: "RESET" }
  | { type: "SKIP" }
  | { type: "TICK"; payload: number }
  | { type: "SET_DRIVERS"; payload: DriverWithStints[] };

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

  time: 0,
  isRunning: false,
};

// =========================
// REDUCER
// =========================

export const trainingReducer = (
  state: TrainingState,
  action: TrainingAction,
): TrainingState => {
  switch (action.type) {
    case "START": {
      if (!state.currentDriver || state.isRunning) return state;

      return {
        ...state,
        isRunning: true,
        time: 0,
      };
    }

    case "LAP": {
      if (!state.isRunning) return state;

      const isFinalLap = state.currentLap === state.lapsPerStint;

      const newLap: Lap = {
        time: state.time,
        time_with_penalties: state.time,
        timestamp: Date.now(),
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

    case "RESET": {
      return {
        ...state,
        laps: [],
        time: 0,
        currentLap: 1,
        isRunning: false,
      };
    }

    case "SKIP": {
      if (state.drivers.length === 0) return state;

      const nextIndex = (state.currentDriverIndex + 1) % state.drivers.length;

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

    case "TICK": {
      return {
        ...state,
        time: action.payload,
      };
    }

    case "SET_DRIVERS": {
      return {
        ...state,
        drivers: action.payload,
        currentDriver: action.payload[state.currentDriverIndex],
      };
    }

    default:
      return state;
  }
};
