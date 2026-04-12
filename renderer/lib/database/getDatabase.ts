import { APP_NAME } from "@/lib/constants";

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

  instance = db;
  return instance;
}
