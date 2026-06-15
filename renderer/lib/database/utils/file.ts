import exportDatabase from './export';
import importDatabase from './import';
import { APP_NAME, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT } from '@/lib/constants';

export const exportToFile = async () => {
  if (typeof window === 'undefined' || !window?.ipc) return;
  const now = new Date();

  const date = now
    .toLocaleDateString(undefined, {
      ...DEFAULT_DATE_FORMAT,
    })
    .replace(/\./g, '-');

  const time = now
    .toLocaleTimeString(undefined, {
      ...DEFAULT_TIME_FORMAT,
    })
    .replace(/:/g, '-');

  const blob = await exportDatabase();
  const fileName = `${APP_NAME}-datenbank-${date}_${time}`;

  const bufferData = await blob.arrayBuffer();

  window.ipc.send('save-file', { fileName, bufferData });
};

export const importFromFile = () => {
  if (typeof window === 'undefined' || !window?.ipc) return;

  return new Promise<void>((resolve, reject) => {
    window.ipc.once('open-file', async (bufferData: ArrayBuffer | null) => {
      try {
        if (!bufferData) return resolve();

        const blob = new Blob([new Uint8Array(bufferData)], {
          type: 'application/json',
        });

        await importDatabase(blob, {
          clearTablesBeforeImport: true,
        });

        resolve();
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
