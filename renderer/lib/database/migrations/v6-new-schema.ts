import type { Transaction } from 'dexie';
import log from 'electron-log/renderer';

/**
 * Migrates legacy v5 trainings into the v6 session model.
 *
 * v5:
 * Training
 *  └── Drivers
 *       └── Stints
 *            └── Laps
 *
 * v6:
 * Session
 *  └── Participation
 *       └── Stint
 *            └── Lap
 */
export const migrateV6 = async (tx: Transaction) => {
  log.info('Migrating database to version 6...');

  const trainings = await tx.table('trainings').toArray();

  const sessions = [];
  const participations = [];
  const stints = [];
  const laps = [];

  for (const training of trainings) {
    const sessionUuid = training.uuid;

    /**
     * Convert training -> session
     */
    sessions.push({
      // New session fields will be filled with `undefined`
      uuid: sessionUuid,
      type: 'practice',
      slalomType: training.mode,
      venueUuid: undefined,
      date: training.createdAt,
      lapsPerStint: training.lapsPerStint,
      unlimitedLapsPerStint: training.unlimitedLapsPerStint,
      weather: undefined,
      notes: undefined,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
    });

    /**
     * Convert drivers
     */
    for (const driver of training.drivers ?? []) {
      /**
       * One participation per driver + kart.
       *
       * A driver could use multiple karts
       * in one training in v5.
       */
      const participationMap = new Map<string, string>();

      for (let stintIndex = 0; stintIndex < (driver.stints ?? []).length; stintIndex++) {
        const legacyStint = driver.stints[stintIndex];
        const kartUuid = legacyStint.kartUuid ?? driver.kartUuid;
        const participationKey = `${driver.uuid}-${kartUuid ?? 'unknown'}`;

        let participationUuid = participationMap.get(participationKey);

        /**
         * Create participation if this
         * driver/kart combination does not exist yet.
         */
        if (!participationUuid) {
          participationUuid = crypto.randomUUID();

          participationMap.set(participationKey, participationUuid);

          participations.push({
            uuid: participationUuid,
            sessionUuid,
            driverUuid: driver.uuid,
            kartUuid,
            isActive: driver.isActive ?? true,
          });
        }

        /**
         * Convert stint
         */
        const stintUuid = crypto.randomUUID();

        stints.push({
          uuid: stintUuid,
          participationUuid,
          stintNumber: stintIndex + 1,
          startedAt: legacyStint.startedAt,
          finishedAt: legacyStint.finishedAt,
        });

        /**
         * Convert laps
         */
        for (let lapIndex = 0; lapIndex < (legacyStint.laps ?? []).length; lapIndex++) {
          const legacyLap = legacyStint.laps[lapIndex];

          laps.push({
            uuid: crypto.randomUUID(),
            stintUuid,
            sessionUuid,
            driverUuid: driver.uuid,
            lapNumber: lapIndex + 1,
            time: legacyLap.time,
            timeWithPenalties: legacyLap.time_with_penalties ?? legacyLap.time,
            cones: legacyLap.cones ?? 0,
            gates: legacyLap.gates ?? 0,
            timestamp: legacyLap.timestamp,
            isInvalid: legacyLap.isInvalid ?? false,
          });
        }
      }
    }
  }

  log.info(
    [
      `Creating ${sessions.length} sessions`,
      `${participations.length} participations`,
      `${stints.length} stints`,
      `${laps.length} laps`,
    ].join(', '),
  );

  /**
   * Insert new v6 data.
   */
  await tx.table('sessions').bulkAdd(sessions);
  await tx.table('participations').bulkAdd(participations);
  await tx.table('stints').bulkAdd(stints);
  await tx.table('laps').bulkAdd(laps);

  /**
   * Remove old v5 data only after
   * everything succeeded.
   */
  await tx.table('trainings').clear();

  log.info('Database migration to version 6 completed.');
};
