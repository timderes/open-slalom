import database from '../index';
import { type ImportOptions } from 'dexie-export-import';

const importDatabase = async (blob: Blob, options?: ImportOptions) => {
  const { importInto } = await import('dexie-export-import');

  return importInto(database, blob, {
    clearTablesBeforeImport: true,
    ...options,
  });
};

export default importDatabase;
