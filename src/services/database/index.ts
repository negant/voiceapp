export {
  DATABASE_NAME,
  SCHEMA_VERSION,
  SETTING_KEYS,
  type SettingKey,
} from './constants';
export { runMigrations } from './schema';
export {
  getSQLiteManager,
  resetSQLiteManagerForTests,
  type SQLiteManager,
} from './sqliteManager';
export {
  getSetting,
  getAppLocale,
  getThemeMode,
  parseAppLocale,
  parseThemeMode,
  setAppLocale,
  setSetting,
  setThemeMode,
} from './settingsRepository';
export {
  buildVoicePresetInsert,
  createVoicePreset,
  deleteVoicePreset,
  getVoicePresetById,
  hasDuplicatePresetName,
  listVoicePresets,
  mapVoicePresetRow,
} from './voicePresetRepository';
export type { QueryResult } from './types';
