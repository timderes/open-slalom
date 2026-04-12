import getDatabase from "../getDatabase";

const clearDatabase = async () => {
  const db = await getDatabase();
  await db.delete();
  await db.open();
};

export default clearDatabase;
