/**
 * Represents one completed lap in a session.
 */
type Lap = {
  uuid: UUID;

  stintUuid: UUID;

  sessionUuid: UUID;

  driverUuid: UUID;

  lapNumber: number;

  /**
   * Raw lap time without penalties.
   */
  time: number;

  /**
   * Total penalty time added to this lap.
   */
  penaltyTime: number;

  /**
   * Final lap time including penalties.
   */
  timeWithPenalties: number;

  /**
   * Number of cones ("Pylonen-Fehler") hit during this lap.
   */
  cones: number;

  /**
   * Number of missed or falsely driven gates ("Tor-Fehler") during this lap.
   */
  gates: number;

  timestamp: Timestamp;

  isInvalid: boolean;
};
