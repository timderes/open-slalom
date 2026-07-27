import type { Transaction } from 'dexie';
import log from 'electron-log/renderer';

const migrateLap = (lap: LegacyLap): void => {
  lap.isInvalid ??= false;
};

const migrateStint = (stint: LegacyStint): void => {
  stint.laps.forEach(migrateLap);
};

const migrateDriver = (driver: LegacyTrainingDriver): void => {
  driver.stints.forEach(migrateStint);
};

const migrateTraining = (training: LegacyTraining): void => {
  training.drivers.forEach(migrateDriver);
};

/**
 * Adds isInvalid flag to existing laps.
 */
export const migrateV2 = async (tx: Transaction) => {
  log.info('Migrating database to version 2');

  await tx.table('trainings').toCollection().modify(migrateTraining);
};
