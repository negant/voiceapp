import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';
import type { PermissionKind, PermissionStatus } from '@/types/permissions';

const KEY_BY_KIND: Record<PermissionKind, string> = {
  storage: SETTING_KEYS.PERMISSION_STORAGE,
  microphone: SETTING_KEYS.PERMISSION_MICROPHONE,
};

const VALID_STATUSES: PermissionStatus[] = ['granted', 'denied', 'unknown'];

export function parsePermissionStatus(
  value: string | null | undefined,
): PermissionStatus | null {
  if (!value) {
    return null;
  }
  return VALID_STATUSES.includes(value as PermissionStatus)
    ? (value as PermissionStatus)
    : null;
}

export async function getPermissionStatus(
  kind: PermissionKind,
): Promise<PermissionStatus | null> {
  const value = await getSetting(KEY_BY_KIND[kind]);
  return parsePermissionStatus(value);
}

export async function setPermissionStatus(
  kind: PermissionKind,
  status: PermissionStatus,
): Promise<void> {
  await setSetting(KEY_BY_KIND[kind], status);
}
