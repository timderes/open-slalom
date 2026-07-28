/**
 * Legacy database types used before the v6 database migration.
 *
 * @deprecated These types represent old database schemas used only during migrations.
 * They must not be used in application code!
 */

/**
 * @deprecated This type is used only during migrations and represents the old database schema for a lap.
 */
type LegacyLap = {
  time: number;

  time_with_penalties: number;

  cones: number;

  gates: number;

  timestamp: Timestamp;

  isInvalid?: boolean;
};
/**
 * @deprecated This type is used only during migrations and represents the old database schema for a stint.
 */
type LegacyStint = {
  laps: LegacyLap[];

  kartUuid?: UUID;
};

/**
 * @deprecated This type is used only during migrations and represents the old database schema for a training driver.
 */
type LegacyTrainingDriver = {
  uuid: UUID;

  kartUuid?: UUID;

  stints: LegacyStint[];

  isActive?: boolean;
};

/**
 * @deprecated This type is used only during migrations and represents the old database schema for a training session.
 */
type LegacyTraining = {
  drivers: LegacyTrainingDriver[];
};
