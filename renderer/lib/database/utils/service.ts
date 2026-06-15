import exportDatabase from './export';
import importDatabase from './import';
import clearDatabase from './clear';
import getDatabaseVersion from './version';

const dbService = {
  export: exportDatabase,
  import: importDatabase,
  clear: clearDatabase,
  getVersion: getDatabaseVersion,
};

export default dbService;
