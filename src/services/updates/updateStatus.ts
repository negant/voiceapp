import type { TranslationParams } from '@/i18n';
import type { TranslationKey } from '@/i18n/types';

import type { AppUpdateStatus } from './types';

type TranslateFn = (key: TranslationKey, params?: TranslationParams) => string;

/** Stub until store / remote update checks are wired in. */
export async function fetchAppUpdateStatus(): Promise<AppUpdateStatus> {
  return { state: 'current' };
}

export function getUpdateStatusMessage(
  t: TranslateFn,
  status: AppUpdateStatus,
): string {
  switch (status.state) {
    case 'checking':
      return t('settings.updateChecking');
    case 'current':
      return t('settings.updateUpToDate');
    case 'available':
      return t('settings.updateAvailable', { version: status.version });
    case 'unknown':
      return t('settings.updateUnknown');
    default:
      return t('settings.updateUnknown');
  }
}
