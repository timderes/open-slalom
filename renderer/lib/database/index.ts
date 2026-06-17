import Dexie, { type EntityTable } from 'dexie';
import { APP_NAME } from '../constants';

const DB_NAME = APP_NAME.toLowerCase().replace(/\s+/g, '-');

const database = new Dexie(DB_NAME) as Dexie & {
  drivers: EntityTable<Driver, 'uuid'>;
  karts: EntityTable<Kart, 'uuid'>;
  trainings: EntityTable<Training, 'uuid'>;
};

database.version(1).stores({
  drivers: '&uuid',
  karts: '&uuid',
  trainings: '&uuid',
});

// upgrade 2
database.version(2).upgrade((tx) => {
  return tx
    .table('trainings')
    .toCollection()
    .modify((training) => {
      training.drivers.forEach((d: TrainingDriver) => {
        d.stints.forEach((s) => {
          s.laps.forEach((l) => {
            l.isInvalid = false;
          });
        });
      });
    });
});

// upgrade 3
database.version(3).upgrade((tx) => {
  return tx
    .table('drivers')
    .toCollection()
    .modify((driver) => {
      delete driver.driverClass;
    });
});

database.version(4).upgrade((tx) => {
  return tx
    .table('drivers')
    .toCollection()
    .modify((driver) => {
      driver.gender = driver.sex;
      delete driver.sex;
    });
});

export default database;
