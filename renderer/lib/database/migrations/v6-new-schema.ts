import type { Transaction } from 'dexie';
import { v4 as uuid } from 'uuid';
import log from 'electron-log/renderer';

/**
 * Normalizes the database schema to version 6.
 */
export const migrateV6 = async (tx: Transaction) => {
  log.info('Migrating database to version 6 - normalize schema');

  const sessions = tx.table('sessions');
  const participations = tx.table('participations');
  const stints = tx.table('stints');
  const laps = tx.table('laps');
  const trainings = await tx.table('trainings').toArray();

  for (const training of trainings) {
    const sessionUuid = uuid();

    await sessions.add({
      uuid: sessionUuid,
      type: 'practice',
      slalomType: training.mode,
      date: training.createdAt,
      lapsPerStint: training.lapsPerStint,
      unlimitedLapsPerStint: training.unlimitedLapsPerStint,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
    });

    for (const driver of training.drivers) {
      const participationUuid = uuid();

      await participations.add({
        uuid: participationUuid,
        sessionUuid,
        driverUuid: driver.uuid,
        kartUuid: driver.kartUuid,
        isActive: driver.isActive,
      });

      let stintNumber = 1;

      for (const oldStint of driver.stints) {
        const stintUuid = uuid();

        await stints.add({
          uuid: stintUuid,
          participationUuid,
          stintNumber,
        });

        let lapNumber = 1;

        for (const oldLap of oldStint.laps) {
          await laps.add({
            uuid: uuid(),
            stintUuid,
            sessionUuid,
            driverUuid: driver.uuid,
            lapNumber,
            time: oldLap.time,
            timeWithPenalties: oldLap.time_with_penalties,
            cones: oldLap.cones,
            gates: oldLap.gates,
            timestamp: oldLap.timestamp,
            isInvalid: oldLap.isInvalid,
          });

          lapNumber++;
        }

        stintNumber++;
      }
    }
  }

  //
  // Remove old tables after migration
  //

  await tx.table('trainings').clear();

  log.info('Database migration v6 finished');
};
