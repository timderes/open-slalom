import database from '../index';
import { exportDB } from 'dexie-export-import';

export async function exportDatabase() {
  return exportDB(database);
}
