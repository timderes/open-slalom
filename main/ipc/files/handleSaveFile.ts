import { dialog, ipcMain } from "electron";
import { writeFile } from "fs";
import { DEFAULT_SAVE_PATH } from "./index";

const handleSaveFile = () => {
  ipcMain.on(
    "save-file",
    async (
      _,
      { fileName, bufferData }: { fileName: string; bufferData: ArrayBuffer }
    ) => {
      const data = Buffer.from(bufferData);

      const filePath = await dialog
        .showSaveDialog({
          defaultPath: DEFAULT_SAVE_PATH + `/${fileName}`,
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
};

export default handleSaveFile;
