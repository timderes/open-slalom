import exportDatabase from './export';
import importDatabase from './import';
import clearDatabase from './clear';
import getDatabaseVersion from './version';
import { exportToFile, importFromFile } from './file';

const dbService = {
  export: exportDatabase,
  import: importDatabase,
  clear: clearDatabase,
  getVersion: getDatabaseVersion,
  exportToFile,
  importFromFile,
};

export default dbService;
