import { app } from 'electron';

import handleSaveFile from './handleSaveFile';
import handleOpenFile from './handleOpenFile';

/**
 * Default path for saving files.
 */
export const DEFAULT_SAVE_PATH = app.getPath('documents');

/**
 * Register IPC handlers for file operations like saving and opening files.
 */
const registerFileIpcHandlers = () => {
  handleSaveFile();
  handleOpenFile();
};

export default registerFileIpcHandlers;
