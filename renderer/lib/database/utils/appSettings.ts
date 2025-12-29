import database from "../index";
import { DEFAULT_STOPWATCH_INTERVAL } from "../../constants";

/**
 * The UUID for the single app settings record.
 * Using a constant UUID ensures we only have one settings record.
 */
const SETTINGS_UUID = "00000000-0000-0000-0000-000000000001";

/**
 * Gets the current app settings, or creates default settings if none exist.
 */
export async function getAppSettings(): Promise<AppSettings> {
  let settings = await database.settings.get(SETTINGS_UUID);
  
  if (!settings) {
    // Create default settings if they don't exist
    settings = {
      uuid: SETTINGS_UUID,
      stopwatchInterval: DEFAULT_STOPWATCH_INTERVAL,
      updatedAt: Date.now(),
    };
    await database.settings.add(settings);
  }
  
  return settings;
}

/**
 * Updates app settings.
 */
export async function updateAppSettings(
  updates: Partial<Omit<AppSettings, "uuid">>
): Promise<void> {
  await database.settings.update(SETTINGS_UUID, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Resets app settings to defaults.
 */
export async function resetAppSettings(): Promise<void> {
  await database.settings.put({
    uuid: SETTINGS_UUID,
    stopwatchInterval: DEFAULT_STOPWATCH_INTERVAL,
    updatedAt: Date.now(),
  });
}
