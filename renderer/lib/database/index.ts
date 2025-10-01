import Dexie, { type EntityTable } from "dexie";
import { APP_NAME } from "../constants";

const LOWER_CASED_APP_NAME = APP_NAME.toLowerCase().replace(/\s+/g, "-");

const database = new Dexie(LOWER_CASED_APP_NAME) as Dexie & {
  drivers: EntityTable<Driver, "uuid">;
};

database.version(1).stores({
  drivers: "&uuid",
});

export default database;
