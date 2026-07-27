/**
 * The team (or commonly called "Mannschaft" in Slalom Events)
 * is a group of drivers for one club, that compete together in
 * a slalom competition.
 */
type Team = {
  uuid: UUID;

  clubUuid: UUID;

  name: string;

  createdAt: Timestamp;

  updatedAt: Timestamp;
};
