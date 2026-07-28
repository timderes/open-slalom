import type { SlalomState } from '../../types/state';
import getUUID from '@/lib/misc/getUUID';

/**
 * Creates a overridable mock SlalomState for testing purposes.
 *
 * Any properties provided in the `overrides` parameter will replace the default values in the mock state.
 */
const createMockSlalomState: (overrides?: Partial<SlalomState>) => SlalomState = (overrides) => {
  return {
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
      isRunning: true,
      startedAt: Date.now() - 5000, // Started 5 seconds ago
      elapsed: 5000,
    },

    ...overrides,
  };
};

export default createMockSlalomState;
