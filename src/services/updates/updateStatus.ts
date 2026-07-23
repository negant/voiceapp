import { appVersion } from '@/config/app';
import { env } from '@/config/env';
import type { TranslationParams } from '@/i18n';
import type { TranslationKey } from '@/i18n/types';
import { fetchSetupWithApi } from '@/services/credits/creditsApi';

import type { AppUpdateStatus } from './types';
import { compareSemver } from './compareSemver';

type TranslateFn = (key: TranslationKey, params?: TranslationParams) => string;

/**
 * Check remote setup for newer / required app versions.
 * Falls back to "current" when API is not configured or unreachable.
 */
export async function fetchAppUpdateStatus(): Promise<AppUpdateStatus> {
  if (!env.backendApiBaseUrl?.trim()) {
    return { state: 'current' };
  }

  try {
    const payload = await fetchSetupWithApi();
    if (!payload?.setup) {
      return { state: 'unknown' };
    }

    const { latestAppVersion, minAppVersion, forceUpdate, storeUrlAndroid, storeUrlIos } =
      payload.setup;

    const belowMin = compareSemver(appVersion, minAppVersion) < 0;
    const behindLatest = compareSemver(appVersion, latestAppVersion) < 0;

    if (belowMin || (forceUpdate && behindLatest)) {
      return {
        state: 'required',
        version: latestAppVersion || minAppVersion,
        storeUrlAndroid: storeUrlAndroid || undefined,
        storeUrlIos: storeUrlIos || undefined,
      };
    }

    if (behindLatest) {
      return {
        state: 'available',
        version: latestAppVersion,
        storeUrlAndroid: storeUrlAndroid || undefined,
        storeUrlIos: storeUrlIos || undefined,
      };
    }

    return { state: 'current' };
  } catch {
    return { state: 'unknown' };
  }
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
    case 'required':
      return t('settings.updateRequired', { version: status.version });
    case 'unknown':
      return t('settings.updateUnknown');
    default:
      return t('settings.updateUnknown');
  }
}
