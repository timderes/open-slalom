import database from '..';

const getDatabaseVersion = () => {
  return database.verno;
};

export default getDatabaseVersion;
