import { dialog, ipcMain } from 'electron';
import { writeFile } from 'fs';
import { DEFAULT_SAVE_PATH } from './index';

const handleSaveFile = () => {
  ipcMain.on('save-file', async (event, { fileName, bufferData }) => {
    try {
      const data = Buffer.from(bufferData);

      const result = await dialog.showSaveDialog({
        defaultPath: DEFAULT_SAVE_PATH + `/${fileName}`,
        title: 'Datenbank sichern',
        buttonLabel: 'Sichern',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });

      if (result.canceled || !result.filePath) {
        event.reply('save-file-result', false);
        return;
      }

      writeFile(result.filePath, data, (err) => {
        if (err) {
          event.reply('save-file-result', false);
        } else {
          event.reply('save-file-result', true);
        }
      });
    } catch (err) {
      event.reply('save-file-result', false);
    }
  });
};

export default handleSaveFile;
