/**
 * Represents a driver participating in slalom events.
 */
type Driver = {
  uuid: UUID;

  firstName: string;

  lastName: string;

  /**
   * ISO date format `YYYY-MM-DD`
   */
  birthDate: string;

  gender: Gender;

  clubUuid?: UUID;

  /**
   * A driver can be part of a team for a specific event or championship.
   */
  teamUuid?: UUID;

  createdAt: Timestamp;

  updatedAt: Timestamp;
};
