import Dexie from 'dexie';
import { APP_NAME } from '../constants';

import type { DatabaseTables } from './schema';

import { migrateV6 } from './migrations/v6-new-schema';
import { migrateV5 } from './migrations/v5-add-kart-history';
import { migrateV4 } from './migrations/v4-rename-gender-field';
import { migrateV3 } from './migrations/v3-remove-driver-class';
import { migrateV2 } from './migrations/v2-invalid-laps-flag';

const DB_NAME = APP_NAME.toLowerCase().replace(/\s+/g, '-');

const database = new Dexie(DB_NAME) as Dexie & DatabaseTables;

database.version(1).stores({
  drivers: '&uuid',
  karts: '&uuid',
  trainings: '&uuid',
});

database.version(2).upgrade(migrateV2);

database.version(3).upgrade(migrateV3);

database.version(4).upgrade(migrateV4);

database.version(5).upgrade(migrateV5);

database
  .version(6)
  .stores({
    // Tables that store data for the entire app
    clubs: '&uuid, name, shortName',
    teams: '&uuid, clubUuid, name',
    drivers: '&uuid, lastName, firstName, clubUuid, teamUuid',
    karts: '&uuid, type, name',
    venues: '&uuid, name',

    // Tables that store data for a specific event or session.
    sessions: '&uuid, type, slalomType, date, venueUuid',
    participations: '&uuid, sessionUuid, driverUuid, kartUuid, [sessionUuid+driverUuid]',
    stints: '&uuid, participationUuid, stintNumber',
    laps: '&uuid, stintUuid, sessionUuid, driverUuid, timestamp, [sessionUuid+driverUuid], [driverUuid+sessionUuid], [driverUuid+timestamp]',
    results: '&uuid, sessionUuid, driverUuid, position',

    // Legacy table that is no longer used in v6, but is kept for migration purposes
    trainings: null,
  })
  .upgrade(migrateV6);

export default database;
