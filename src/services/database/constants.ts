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
  /**
   * Pending free-welcome dialog amount (stringified int).
   * Cleared only after the user dismisses the prompt.
   */
  WELCOME_CREDITS_PROMPT: 'welcome_credits_prompt',
  /**
   * Last yellow/red WaveSpeed public status snapshot (JSON).
   * Cleared when status returns to green / ok.
   */
  AI_SERVICE_STATUS_DEGRADED: 'ai_service_status_degraded',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];
