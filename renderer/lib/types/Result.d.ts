/**
 * Represents the result of a session.
 */
type Result = {
  uuid: UUID;

  sessionUuid: UUID;

  driverUuid: UUID;

  position: number;

  points?: number;

  totalTime?: number;
};
