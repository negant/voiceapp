import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from '@/types/locale';

/** Maps a BCP 47 / ICU language tag to a supported app locale, else `DEFAULT_LOCALE`. */
export function resolveSupportedLocale(
  languageTag: string | null | undefined,
): AppLocale {
  if (!languageTag) {
    return DEFAULT_LOCALE;
  }

  const primary = languageTag.replace(/_/g, '-').split('-')[0]?.toLowerCase();

  if (primary && SUPPORTED_LOCALES.includes(primary as AppLocale)) {
    return primary as AppLocale;
  }

  return DEFAULT_LOCALE;
}

/** Best-effort device locale tag (Hermes / JSC `Intl`). */
export function getDeviceLocaleTag(): string {
  return Intl.DateTimeFormat().resolvedOptions().locale;
}

/** Locale to use when the user has not chosen one in app settings. */
export function resolveDeviceAppLocale(): AppLocale {
  return resolveSupportedLocale(getDeviceLocaleTag());
}
