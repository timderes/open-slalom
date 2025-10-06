import database from "..";

const clearDatabase = () => {
  database
    .delete()
    .catch((err) => {
      console.error("Failed to clear database:", err);
    })
    .then(() => {
      console.info("Database cleared successfully!");
      database.open();
    });
};

export default clearDatabase;
