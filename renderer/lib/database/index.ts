import Dexie, { type EntityTable } from 'dexie';
import { APP_NAME } from '../constants';

const LOWER_CASED_APP_NAME = APP_NAME.toLowerCase().replace(/\s+/g, '-');

const database = new Dexie(LOWER_CASED_APP_NAME) as Dexie & {
  drivers: EntityTable<Driver, 'uuid'>;
  karts: EntityTable<Kart, 'uuid'>;
  trainings: EntityTable<Training, 'uuid'>;
};

database.version(1).stores({
  drivers: '&uuid',
  karts: '&uuid',
  trainings: '&uuid',
});

// This upgrade adds the "isInvalid" property to all existing laps in the database,
// defaulting to `false`. This change was merged with PR #3.
database.version(2).upgrade((tx) => {
  return tx
    .table('trainings')
    .toCollection()
    .modify((training) => {
      training.drivers.forEach((d: DriverWithStints) => {
        d.stints.forEach((s) => {
          s.laps.forEach((l) => {
            l.isInvalid = false;
          });
        });
      });
    });
});

export default database;
