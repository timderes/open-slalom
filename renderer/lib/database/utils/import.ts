import database from '../index';
import { importInto } from 'dexie-export-import';

export async function importDatabase(blob: Blob) {
  return importInto(database, blob, {
    clearTablesBeforeImport: true,
  });
}
