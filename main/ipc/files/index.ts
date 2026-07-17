import { app } from 'electron';
import handleSaveFile from './handleSaveFile';
import handleOpenFile from './handleOpenFile';
import log from 'electron-log/main';

/**
 * Default path for saving files.
 */
export const DEFAULT_SAVE_PATH = app.getPath('documents');

/**
 * Register IPC handlers for file operations like saving and opening files.
 */
const registerFileIpcHandlers = () => {
  log.info('Registering IPC handlers for file operations...');

  handleSaveFile();
  handleOpenFile();
};

export default registerFileIpcHandlers;
