import * as Keychain from 'react-native-keychain';

import { SETTING_KEYS } from '@/services/database/constants';
import { getSetting, setSetting } from '@/services/database/settingsRepository';

const KEYCHAIN_SERVICE = 'pl.ukrywane.voiceapp.device_id';
const KEYCHAIN_USERNAME = 'device_id';

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

async function readKeychainDeviceId(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    if (!credentials || !isValidDeviceId(credentials.password)) {
      return null;
    }
    return credentials.password.trim();
  } catch {
    return null;
  }
}

async function writeKeychainDeviceId(deviceId: string): Promise<void> {
  try {
    await Keychain.setGenericPassword(KEYCHAIN_USERNAME, deviceId, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  } catch {
    // SQLite remains the fallback if Keystore/Keychain is unavailable.
  }
}

/**
 * Stable device id for credits API (no user account).
 * Prefers Android Keystore / iOS Keychain so the id survives reinstall when possible;
 * mirrors into SQLite for offline reads and migration from older installs.
 */
export async function ensureDeviceId(): Promise<string> {
  const fromKeychain = await readKeychainDeviceId();
  if (fromKeychain) {
    const sqlite = await getSetting(SETTING_KEYS.DEVICE_ID);
    if (sqlite !== fromKeychain) {
      await setSetting(SETTING_KEYS.DEVICE_ID, fromKeychain);
    }
    return fromKeychain;
  }

  const existing = await getSetting(SETTING_KEYS.DEVICE_ID);
  if (isValidDeviceId(existing)) {
    const id = existing!.trim();
    await writeKeychainDeviceId(id);
    return id;
  }

  const next = createDeviceId();
  await setSetting(SETTING_KEYS.DEVICE_ID, next);
  await writeKeychainDeviceId(next);
  return next;
}

export async function getDeviceId(): Promise<string | null> {
  const fromKeychain = await readKeychainDeviceId();
  if (fromKeychain) {
    return fromKeychain;
  }
  const existing = await getSetting(SETTING_KEYS.DEVICE_ID);
  return isValidDeviceId(existing) ? existing!.trim() : null;
}
