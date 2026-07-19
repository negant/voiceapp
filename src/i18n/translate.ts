import en from '@/i18n/locales/en.json';
import pl from '@/i18n/locales/pl.json';
import type { TranslationKey, TranslationNode } from '@/i18n/types';
import { DEFAULT_LOCALE, type AppLocale } from '@/types/locale';

export type TranslationParams = Record<string, string | number>;

const translations: Record<AppLocale, TranslationNode> = {
  pl,
  en,
};

function getNestedValue(
  dictionary: TranslationNode,
  path: string,
): string | undefined {
  const parts = path.split('.');
  let current: TranslationNode | undefined = dictionary;

  for (const part of parts) {
    if (current === undefined || typeof current !== 'string' && typeof current !== 'object') {
      return undefined;
    }
    if (typeof current === 'string') {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{{${key}}}` : String(value);
  });
}

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const localized =
    getNestedValue(translations[locale], key) ??
    getNestedValue(translations[DEFAULT_LOCALE], key);

  if (localized === undefined) {
    return key;
  }

  return interpolate(localized, params);
}
