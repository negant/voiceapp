import type { TranslationKey } from '@/i18n/types';

export const SUPPORTED_LOCALES = ['pl', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_LABEL_KEYS: Record<AppLocale, TranslationKey> = {
  pl: 'languages.pl',
  en: 'languages.en',
};
