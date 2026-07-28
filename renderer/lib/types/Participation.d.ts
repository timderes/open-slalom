/**
 * Connects a driver with a session.
 */
type Participation = {
  uuid: UUID;

  sessionUuid: UUID;

  driverUuid: UUID;

  kartUuid?: UUID;

  isActive: boolean;
};
