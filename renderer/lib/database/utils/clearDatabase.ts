import database from "..";

const clearDatabase = async () => {
  await database.delete();
  await database.open();
};

export default clearDatabase;
