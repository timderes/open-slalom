import type { EntityTable } from 'dexie';

export type DatabaseTables = {
  clubs: EntityTable<Club, 'uuid'>;

  teams: EntityTable<Team, 'uuid'>;

  drivers: EntityTable<Driver, 'uuid'>;

  karts: EntityTable<Kart, 'uuid'>;

  venues: EntityTable<Venue, 'uuid'>;

  sessions: EntityTable<Session, 'uuid'>;

  participations: EntityTable<Participation, 'uuid'>;

  stints: EntityTable<Stint, 'uuid'>;

  laps: EntityTable<Lap, 'uuid'>;

  results: EntityTable<Result, 'uuid'>;
};
