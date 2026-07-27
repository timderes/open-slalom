import Dexie from 'dexie';
import { APP_NAME } from '../constants';
import type { DatabaseTables } from './schema';

const DB_NAME = APP_NAME.toLowerCase().replace(/\s+/g, '-');

const database = new Dexie(DB_NAME) as Dexie & DatabaseTables;

database.version(6).stores({
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
});

export default database;
