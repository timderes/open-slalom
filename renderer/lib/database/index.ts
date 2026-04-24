import Dexie, { type EntityTable } from "dexie";
import { APP_NAME } from "../constants";

const LOWER_CASED_APP_NAME = APP_NAME.toLowerCase().replace(/\s+/g, "-");

const database = new Dexie(LOWER_CASED_APP_NAME) as Dexie & {
  drivers: EntityTable<Driver, "uuid">;
  karts: EntityTable<Kart, "uuid">;
  trainings: EntityTable<Training, "uuid">;
};

database.version(1).stores({
  drivers: "&uuid",
  karts: "&uuid",
  trainings: "&uuid",
});

// This upgrade adds the "isInvalid" property to all existing laps in the database,
// defaulting to `false`. This change was merged with PR #3.
database.version(2).upgrade((tx) => {
  return tx
    .table("trainings")
    .toCollection()
    .modify((training) => {
      training.drivers.forEach((d: DriverWithStints) => {
        d.stints.forEach((s) => {
          s.laps.forEach((l) => {
            l.isInvalid = false;
          });
        });
      });
    });
});

// This upgrade normalizes kart tracking in training data to use only kartUUID
// on stint level and removes persisted kart objects from training records.
database.version(3).upgrade((tx) => {
  return tx
    .table("trainings")
    .toCollection()
    .modify((training) => {
      training.drivers.forEach((driver: DriverWithStints) => {
        const mutableDriver = driver as DriverWithStints & {
          currentKart?: Kart | null;
          currentKartUUID?: string | null;
        };

        if (!("currentKartUUID" in mutableDriver)) {
          mutableDriver.currentKartUUID =
            mutableDriver.currentKart?.uuid ?? null;
        }

        delete mutableDriver.currentKart;

        mutableDriver.stints.forEach((stint) => {
          const mutableStint = stint as Stint & {
            kart?: Kart | string | null;
            driverId?: string;
            kartUUID?: string | null;
          };

          if (typeof mutableStint.kartUUID !== "string") {
            mutableStint.kartUUID =
              typeof mutableStint.kart === "object" && mutableStint.kart
                ? mutableStint.kart.uuid ?? null
                : null;
          }

          delete mutableStint.kart;
          delete mutableStint.driverId;
        });
      });
    });
});

export default database;
