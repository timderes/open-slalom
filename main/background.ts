import path from "path";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { writeFile } from "fs";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools({
      mode: "detach",
    });
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("app-quit", () => {
  // In development, relaunch the app for easier debugging
  if (!isProd) {
    app.relaunch();
  }

  app.quit();
});

ipcMain.on("app-minimize-window", () => {
  const window = BrowserWindow.getFocusedWindow();

  if (window) {
    window.minimize();
  }
});

ipcMain.on(
  "save-file",
  async (
    _,
    { fileName, bufferData }: { fileName: string; bufferData: ArrayBuffer }
  ) => {
    const data = Buffer.from(bufferData);

    // Open electron dialog to select save location
    const filePath = await dialog
      .showSaveDialog({
        defaultPath: app.getPath("documents") + `/${fileName}`,

        title: "Datenbank sichern",
        buttonLabel: "Sichern",
        filters: [{ name: "JSON", extensions: ["json"] }],
      })
      .then((result) => {
        if (result.canceled || !result.filePath) {
          console.log("Save operation was canceled.");
          return null;
        }
        return result.filePath;
      });

    writeFile(filePath, data, (err) => {
      if (err) {
        console.error("Error saving file:", err);
      } else {
        console.log("File saved successfully:", filePath);
      }
    });
  }
);
