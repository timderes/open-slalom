import type { Transaction } from 'dexie';
import log from 'electron-log/renderer';

/**
 * Adds kart reference to stints and initializes kart history.
 */
export const migrateV5 = async (tx: Transaction) => {
  log.info('Migrating database to version 5');

  await tx
    .table('trainings')
    .toCollection()
    .modify((training) => {
      training.drivers.forEach((driver: LegacyTrainingDriver) => {
        driver.stints.forEach((stint) => {
          stint.kartUuid = driver.kartUuid;
        });
      });
    });

  await tx
    .table('karts')
    .toCollection()
    .modify((kart) => {
      kart.history ??= {
        totalLaps: 0,
        totalStints: 0,
        totalTime: 0,
        trainingUuids: [],
        usageByDriver: {},
      };
    });
};
