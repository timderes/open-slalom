import { dialog, ipcMain } from 'electron';
import { readFile } from 'fs';
import { DEFAULT_SAVE_PATH } from '.';

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
      event.reply('open-file', null);
      return;
    }

    readFile(path, (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        event.reply('open-file', null);
        return;
      }

      event.reply('open-file', data.buffer);
    });
  });
};

export default handleOpenFile;
