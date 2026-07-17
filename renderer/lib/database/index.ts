import Dexie, { type EntityTable } from 'dexie';
import { APP_NAME } from '../constants';
import log from 'electron-log/renderer';

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

//
// Migrations / Upgrades
//
// Should these be done in a separate file?
//
database.version(2).upgrade((tx) => {
  log.info('Upgrading database to version 2...');

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
    })
    .catch((error) => {
      log.error('Error during database upgrade to version 2:', error);
    });
});

database.version(3).upgrade((tx) => {
  log.info('Upgrading database to version 3.');
  return tx
    .table('drivers')
    .toCollection()
    .modify((driver) => {
      delete driver.driverClass;
    })
    .catch((error) => {
      log.error('Error during database upgrade to version 3:', error);
    });
});

database.version(4).upgrade((tx) => {
  log.info('Upgrading database to version 4...');
  return tx
    .table('drivers')
    .toCollection()
    .modify((driver) => {
      driver.gender = driver.sex;
      delete driver.sex;
    })
    .catch((error) => {
      log.error('Error during database upgrade to version 4:', error);
    });
});

database.version(5).upgrade((tx) => {
  log.info('Upgrading database to version 5...');
  return Promise.all([
    tx
      .table('trainings')
      .toCollection()
      .modify((training) => {
        training.drivers.forEach((d: TrainingDriver) => {
          d.stints.forEach((s) => {
            s.kartUuid = d.kartUuid ?? undefined;
          });
        });
      })
      .catch((error) => {
        log.error('Error during database upgrade to version 5:', error);
      }),

    tx
      .table('karts')
      .toCollection()
      .modify((kart) => {
        kart.history = {
          totalLaps: kart.history?.totalLaps ?? 0,
          totalStints: kart.history?.totalStints ?? 0,
          trainingUuids: kart.history?.trainingUuids ?? [],
          totalTime: kart.history?.totalTime ?? 0,
          firstTraining: kart.history?.firstTraining ?? undefined,
          lastTraining: kart.history?.lastTraining ?? undefined,
          usageByDriver: kart.history?.usageByDriver ?? {},
        };
      })
      .catch((error) => {
        log.error('Error during database upgrade to version 5:', error);
      }),
  ]);
});

export default database;
