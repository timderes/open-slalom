import type { Transaction } from 'dexie';
import log from 'electron-log/renderer';

/**
 * Removes deprecated driverClass field.
 */
export const migrateV3 = async (tx: Transaction) => {
  log.info('Migrating database to version 3');

  await tx
    .table('drivers')
    .toCollection()
    .modify((driver) => {
      delete driver.driverClass;
    });
};
