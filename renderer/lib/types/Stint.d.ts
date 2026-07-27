/**
 * Represents one continuous driving session.
 */
type Stint = {
  uuid: UUID;

  participationUuid: UUID;

  /**
   * Sequential index of the stint within a driver's participation.
   * Starts at `1`
   *
   * ? Maybe remove this field later:
   * Is this really necessary? We can always derive this from the
   * array index of the stint in the participation's stints array.
   */
  stintNumber: number;

  startedAt?: Timestamp;

  finishedAt?: Timestamp;
};
