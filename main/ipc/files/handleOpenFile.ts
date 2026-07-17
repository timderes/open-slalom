import { dialog, ipcMain } from 'electron';
import { readFile } from 'fs';
import { DEFAULT_SAVE_PATH } from '.';
import log from 'electron-log';

const handleOpenFile = () => {
  ipcMain.on('open-file', async (event, options: Electron.OpenDialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      ...options,
      defaultPath: DEFAULT_SAVE_PATH,
      properties: ['openFile'],
    });

    // App only replies the first selected file
    const path = filePaths[0];

    if (canceled || !path) {
      log.info('User canceled file open dialog or no file selected...');

      event.reply('open-file', null);
      return;
    }

    readFile(path, (err, data) => {
      if (err) {
        log.error('Unable to read file! Error:', err);

        event.reply('open-file', null);
        return;
      }

      log.info(`File opened successfully from ${path}.`);

      // Sending the buffer directly can include unrelated bytes
      // before and after the actual file contents. So we slice
      // the buffer to only include the relevant portion
      const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

      event.reply('open-file', buffer);
    });
  });
};

export default handleOpenFile;
