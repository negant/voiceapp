import type { AppLocale } from '@/types/locale';
import { SUPPORTED_LOCALES } from '@/types/locale';
import type { ThemeMode } from '@/types/theme';
import { SETTING_KEYS } from '@/services/database/constants';
import { getSQLiteManager } from '@/services/database/sqliteManager';

const VALID_THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

export function parseThemeMode(value: string | null | undefined): ThemeMode | null {
  if (!value) {
    return null;
  }
  return VALID_THEME_MODES.includes(value as ThemeMode)
    ? (value as ThemeMode)
    : null;
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await getSQLiteManager().executeQuery<{ value: string }>(
    'SELECT value FROM settings WHERE key = ? LIMIT 1',
    [key],
  );

  if (!result.success) {
    throw new Error(result.error ?? `Failed to read setting: ${key}`);
  }

  return result.data[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const now = Date.now();
  const result = await getSQLiteManager().executeQuery(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = excluded.updated_at`,
    [key, value, now],
  );

  if (!result.success) {
    throw new Error(result.error ?? `Failed to save setting: ${key}`);
  }
}

export async function getThemeMode(): Promise<ThemeMode | null> {
  const value = await getSetting(SETTING_KEYS.THEME_MODE);
  return parseThemeMode(value);
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  await setSetting(SETTING_KEYS.THEME_MODE, mode);
}

export function parseAppLocale(
  value: string | null | undefined,
): AppLocale | null {
  if (!value) {
    return null;
  }
  return SUPPORTED_LOCALES.includes(value as AppLocale)
    ? (value as AppLocale)
    : null;
}

export async function getAppLocale(): Promise<AppLocale | null> {
  const value = await getSetting(SETTING_KEYS.APP_LOCALE);
  return parseAppLocale(value);
}

export async function setAppLocale(locale: AppLocale): Promise<void> {
  await setSetting(SETTING_KEYS.APP_LOCALE, locale);
}
