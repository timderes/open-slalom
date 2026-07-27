import type { Transaction } from 'dexie';
import log from 'electron-log/renderer';

/**
 * Renames sex field to gender.
 */
export const migrateV4 = async (tx: Transaction) => {
  log.info('Migrating database to version 4');

  await tx
    .table('drivers')
    .toCollection()
    .modify((driver) => {
      if (driver.sex) {
        driver.gender = driver.sex;
        delete driver.sex;
      }
    });
};
