import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

/** RFC-4122-ish UUID v4 for device identity (no PII). */
export function createDeviceId(): string {
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Version 4 + variant bits (UUID v4)
  /* eslint-disable no-bitwise -- UUID version/variant nibble packing */
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  /* eslint-enable no-bitwise */

  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function isValidDeviceId(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

/**
 * Stable device id for credits API (no user account).
 * Stored in SQLite. For reinstall resistance, migrate to Keychain/Keystore later
 * — see credits-backend.md.
 */
export async function ensureDeviceId(): Promise<string> {
  const existing = await getSetting(SETTING_KEYS.DEVICE_ID);
  if (isValidDeviceId(existing)) {
    return existing!.trim();
  }

  const next = createDeviceId();
  await setSetting(SETTING_KEYS.DEVICE_ID, next);
  return next;
}

export async function getDeviceId(): Promise<string | null> {
  const existing = await getSetting(SETTING_KEYS.DEVICE_ID);
  return isValidDeviceId(existing) ? existing!.trim() : null;
}
