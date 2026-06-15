import database from '../index';

const clearDatabase = async () => {
  await database.delete();
  await database.open();
};

export default clearDatabase;
