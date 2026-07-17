import path from 'path';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import registerFileIpcHandlers from './ipc/files';
import log from 'electron-log';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  // This makes the logger available in the renderer process
  log.initialize();

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js'),
    },
  });

  if (isProd) {
    // Hide Electron's default application menu because the app uses
    // its own custom App Shell menu
    //
    // This also disables built-in Chromium shortcuts (for example: Ctrl+W)
    Menu.setApplicationMenu(null);

    await mainWindow.loadURL('app://./');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools({
      mode: 'detach',
    });
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('app-quit', () => {
  // In development, relaunch the app for easier debugging
  if (!isProd) {
    app.relaunch();
  }

  app.quit();
});

ipcMain.on('app-minimize-window', () => {
  const window = BrowserWindow.getFocusedWindow();

  if (window) {
    window.minimize();
  }
});

registerFileIpcHandlers();
