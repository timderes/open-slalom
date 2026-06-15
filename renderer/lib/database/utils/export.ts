import database from '../index';
import { type ExportOptions } from 'dexie-export-import';

const exportDatabase = async (options?: ExportOptions) => {
  const { exportDB } = await import('dexie-export-import');

  return exportDB(database, { ...options });
};

export default exportDatabase;
