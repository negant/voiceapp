export const DATABASE_NAME = 'voiceapp.db';

export const SCHEMA_VERSION = 5;

export const SETTING_KEYS = {
  THEME_MODE: 'theme_mode',
  APP_LOCALE: 'app_locale',
  PERMISSION_STORAGE: 'permission_storage',
  PERMISSION_MICROPHONE: 'permission_microphone',
  CREDITS_BALANCE: 'credits_balance',
  CREDITS_SEED_VERSION: 'credits_seed_version',
  CREDITS_PER_AI_10_SEC: 'credits_per_ai_10_sec',
  ACCOUNT_PLAN: 'account_plan',
  /** Stable device id for credits API (no PII). */
  DEVICE_ID: 'device_id',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];
