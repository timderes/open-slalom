/**
 * Migrates legacy kart references in a training record to UUID-only storage.
 * Mutates the provided training object in place.
 */
export const normalizeTrainingKartTracking = (training: Training) => {
  training.drivers.forEach((driver) => {
    const mutableDriver = driver as DriverWithStints & {
      currentKart?: Kart | null;
      currentKartUUID?: string | null;
    };

    if (!Object.prototype.hasOwnProperty.call(mutableDriver, "currentKartUUID")) {
      mutableDriver.currentKartUUID = mutableDriver.currentKart?.uuid ?? null;
    }

    delete mutableDriver.currentKart;

    mutableDriver.stints.forEach((stint) => {
      const mutableStint = stint as Stint & {
        kart?: Kart | string | null;
        driverId?: string;
      };

      if (!Object.prototype.hasOwnProperty.call(mutableStint, "kartUUID")) {
        (mutableStint as Stint & { kartUUID?: string | null }).kartUUID =
          typeof mutableStint.kart === "object" && mutableStint.kart
            ? mutableStint.kart.uuid ?? null
            : null;
      }

      delete mutableStint.kart;
      delete mutableStint.driverId;
    });
  });
};
