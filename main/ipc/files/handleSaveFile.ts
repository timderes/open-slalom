import { dialog, ipcMain } from 'electron';
import { writeFile } from 'fs';
import { DEFAULT_SAVE_PATH } from './index';
import log from 'electron-log/main';

const handleSaveFile = () => {
  ipcMain.on('save-file', async (event, { fileName, bufferData }) => {
    try {
      const data = Buffer.from(bufferData);

      // TODO: This dialog uses hardcoded strings for title and labels
      // Make these strings customizable for other saveable files
      const result = await dialog.showSaveDialog({
        defaultPath: DEFAULT_SAVE_PATH + `/${fileName}`,
        title: 'Datenbank sichern',
        buttonLabel: 'Sichern',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });

      if (result.canceled || !result.filePath) {
        log.info('User canceled file save dialog or no file path selected...');
        event.reply('save-file-result', false);
        return;
      }

      writeFile(result.filePath, data, (err) => {
        if (err) {
          log.error('Unable to save file! Error:', err);
          event.reply('save-file-result', false);
        } else {
          log.info(`File saved successfully to ${result.filePath}.`);
          event.reply('save-file-result', true);
        }
      });
    } catch (err) {
      event.reply('save-file-result', false);
    }
  });
};

export default handleSaveFile;
