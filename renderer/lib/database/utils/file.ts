import exportDatabase from './export';
import importDatabase from './import';
import { APP_NAME, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from '@/lib/constants';
import log from 'electron-log/renderer';

export const exportToFile = () => {
  if (typeof window === 'undefined' || !window?.ipc) {
    log.error("IPC is not available. Can't export database to file.");
    return false;
  }

  return new Promise<boolean>(async (resolve, reject) => {
    try {
      const now = new Date();

      const date = now
        .toLocaleDateString(undefined, {
          ...DEFAULT_DATE_FORMAT,
        })
        .replace(/[^\d]+/g, '-');

      const time = now
        .toLocaleTimeString(undefined, {
          ...DEFAULT_TIME_FORMAT,
        })
        .replace(/[^\d]+/g, '-');

      const blob = await exportDatabase();
      const fileName = `${APP_NAME}-datenbank-${date}_${time}`;

      const bufferData = await blob.arrayBuffer();

      window.ipc.once('save-file-result', (success: boolean) => {
        resolve(success);
      });

      window.ipc.send('save-file', { fileName, bufferData });
    } catch (err) {
      log.error('Error occurred while exporting database to file:', err);
      reject(err);
    }
  });
};

export const importFromFile = () => {
  if (typeof window === 'undefined' || !window?.ipc) {
    throw new Error("IPC is not available. Can't import database from file.");
  }

  return new Promise<boolean>((resolve, reject) => {
    window.ipc.once('open-file', async (bufferData: ArrayBuffer | null) => {
      try {
        if (!bufferData) {
          resolve(false);
          return;
        }

        const blob = new Blob([new Uint8Array(bufferData)], {
          type: 'application/json',
        });

        await importDatabase(blob, {
          clearTablesBeforeImport: true,
        });

        resolve(true);
      } catch (err) {
        reject(err);
      }
    });

    window.ipc.send('open-file', {
      title: 'Datenbank importieren',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });
  });
};
