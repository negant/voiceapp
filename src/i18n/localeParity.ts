import schema from '@/i18n/locales/schema.json';
import en from '@/i18n/locales/en.json';
import pl from '@/i18n/locales/pl.json';
import type { TranslationNode } from '@/i18n/types';
import { SUPPORTED_LOCALES, type AppLocale } from '@/types/locale';

function flattenTranslationKeys(
  tree: TranslationNode,
  prefix = '',
): string[] {
  if (typeof tree === 'string') {
    return prefix ? [prefix] : [];
  }

  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      return [path];
    }
    return flattenTranslationKeys(value, path);
  });
}

function flattenSchemaPaths(tree: TranslationNode): string[] {
  if (typeof tree === 'string') {
    return [tree];
  }

  return Object.entries(tree).flatMap(([, value]) => {
    if (typeof value === 'string') {
      return [value];
    }
    return flattenSchemaPaths(value);
  });
}

const localeFiles: Record<AppLocale, TranslationNode> = {
  pl,
  en,
};

export function getTranslationKeys(locale: AppLocale): string[] {
  return flattenTranslationKeys(localeFiles[locale]).sort();
}

export function getSchemaPaths(): string[] {
  return flattenSchemaPaths(schema as TranslationNode).sort();
}

export function findMissingTranslationKeys(): Partial<Record<AppLocale, string[]>> {
  const allKeys = new Set(
    SUPPORTED_LOCALES.flatMap(locale => getTranslationKeys(locale)),
  );

  const missing: Partial<Record<AppLocale, string[]>> = {};

  for (const locale of SUPPORTED_LOCALES) {
    const localeKeys = new Set(getTranslationKeys(locale));
    const missingKeys = [...allKeys].filter(key => !localeKeys.has(key));
    if (missingKeys.length > 0) {
      missing[locale] = missingKeys.sort();
    }
  }

  return missing;
}

export function findSchemaDrift(): string[] {
  const enKeys = getTranslationKeys('en');
  const schemaPaths = getSchemaPaths();
  const enSet = new Set(enKeys);
  const schemaSet = new Set(schemaPaths);

  const drift = [
    ...enKeys.filter(key => !schemaSet.has(key)),
    ...schemaPaths.filter(path => !enSet.has(path)),
  ];

  return [...new Set(drift)].sort();
}
