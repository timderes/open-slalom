/**
 * Represents a motorsport club. Each driver can be part of one club.
 */
type Club = {
  uuid: UUID;

  address?: Address; // Optional address of the club

  name: string; // Full name of the club

  shortName?: string; // Short name or abbreviation of the club

  website?: string; // Optional website URL of the club

  createdAt: Timestamp;

  updatedAt: Timestamp;
};
