import getUUID from '@/lib/misc/getUUID';
import type { SlalomState } from '../types/state';

/**
 * The initial state of the slalom training or competition
 * session.
 *
 * This state is used to initialize the application when
 * starting a new session.
 */
const INITIAL_SLALOM_STATE: SlalomState = {
  currentDriverUuid: undefined,
  currentStint: undefined,

  drivers: [],
  session: {
    uuid: getUUID(),
    type: 'practice',
    slalomType: 'JKS',
    venueUuid: undefined,
    date: Date.now(),
    lapsPerStint: 3,
    unlimitedLapsPerStint: false,
    weather: undefined,
    notes: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  stopwatch: {
    isRunning: false,
    startedAt: undefined,
    elapsed: 0,
  },
};

export default INITIAL_SLALOM_STATE;
