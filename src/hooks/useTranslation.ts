import { useLocaleContext } from '@/providers/LocaleProvider';

export function useTranslation() {
  return useLocaleContext();
}

export type { AppLocale } from '@/types/locale';
export type { TranslationKey, TranslationSchema } from '@/i18n/types';
export { SUPPORTED_LOCALES } from '@/types/locale';
