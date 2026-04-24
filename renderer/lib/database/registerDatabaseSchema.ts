import { normalizeTrainingKartTracking } from "./normalizeKartTracking";

export const registerDatabaseSchema = (db: any) => {
  db.version(1).stores({
    drivers: "&uuid",
    karts: "&uuid",
    trainings: "&uuid",
  });

  // This upgrade adds the "isInvalid" property to all existing laps in the database,
  // defaulting to `false`. This change was merged with PR #3.
  db.version(2).upgrade((tx: any) => {
    return tx
      .table("trainings")
      .toCollection()
      .modify((training: Training) => {
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
  db.version(3).upgrade((tx: any) => {
    return tx
      .table("trainings")
      .toCollection()
      .modify(normalizeTrainingKartTracking);
  });
};
