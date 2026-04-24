import { APP_NAME } from "@/lib/constants";
import { normalizeTrainingKartTracking } from "./normalizeKartTracking";

let instance = null;

// This is a mess because of client-only dynamic imports,
// but it allows us to keep the database logic. NEEDED for
// importing and exporting the database to JSON.
//
// Maybe sometime in the future we can refactor this to be cleaner
//
// @see {settings.tsx}
export default async function getDatabase() {
  if (instance) return instance;

  if (typeof window === "undefined") {
    throw new Error("getDatabase() called on the server");
  }

  // Dynamically import Dexie on the client only
  const DexieModule = await import("dexie");
  const Dexie = (DexieModule && (DexieModule as any).default) || DexieModule;

  const name = APP_NAME.toLowerCase().replace(/\s+/g, "-");
  const db = new Dexie(name);

  db.version(1).stores({
    drivers: "&uuid",
    karts: "&uuid",
    trainings: "&uuid",
  });

  // This upgrade adds the "isInvalid" property to all existing laps in the database,
  // defaulting to `false`. This change was merged with PR #3.
  db.version(2).upgrade((tx) => {
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
  db.version(3).upgrade((tx) => {
    return tx
      .table("trainings")
      .toCollection()
      .modify(normalizeTrainingKartTracking);
  });

  instance = db;
  return instance;
}
