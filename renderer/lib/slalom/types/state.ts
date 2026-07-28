/**
 * The current Stopwatch state, including whether it is running,
 * when it was started, and the elapsed time.
 */
export type StopwatchState = {
  isRunning: boolean;
  startedAt?: number;
  elapsed: number;
};

/**
 * The state of the current stint, including the driver, kart, and laps.
 */
export type CurrentStintState = {
  uuid: UUID;
  driverUuid: UUID;
  kartUuid?: UUID;
  laps: Lap[];
};

/**
 * State of a slalom training or competition session.
 * This state is used to manage the current session, including
 * the drivers, stints, laps, and stopwatch.
 */
export type SlalomState = {
  currentDriverUuid?: UUID;
  currentStint?: CurrentStintState;

  drivers: Driver['uuid'][];
  session: Session;

  stopwatch: StopwatchState;
};
