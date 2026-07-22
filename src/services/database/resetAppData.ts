import { DevSettings } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import * as Keychain from 'react-native-keychain';

import {
  AUDIO_IMPORTS_DIR,
  AUDIO_OUTPUT_DIR,
  ensureAudioDirs,
} from '@/services/audio/audioStorage';
import { getSQLiteManager } from '@/services/database/sqliteManager';

const EXPORT_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/VoiceApp`;
const STS_CACHE_DIR = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/voice-app-sts`;
const DEVICE_ID_KEYCHAIN_SERVICE = 'pl.ukrywane.voiceapp.device_id';

/**
 * Clears user tables and local audio folders so the next bootstrap looks like
 * a fresh install (new device_id after reload). Keeps schema_version.
 */
export async function resetLocalAppData(): Promise<void> {
  const db = getSQLiteManager();

  for (const statement of [
    'DELETE FROM settings',
    'DELETE FROM voice_presets',
    'DELETE FROM processed_history',
  ] as const) {
    const result = await db.executeQuery(statement);
    if (!result.success) {
      throw new Error(result.error ?? `Failed to run: ${statement}`);
    }
  }

  try {
    await Keychain.resetGenericPassword({ service: DEVICE_ID_KEYCHAIN_SERVICE });
  } catch {
    // Ignore — Keychain may be unavailable in some test environments.
  }

  await clearDirectory(AUDIO_IMPORTS_DIR);
  await clearDirectory(AUDIO_OUTPUT_DIR);
  await clearDirectory(EXPORT_DIR);
  await clearDirectory(STS_CACHE_DIR);
  await ensureAudioDirs();
}

/** Best-effort JS reload after wipe (dev / debug builds). */
export function reloadAppAfterReset(): void {
  DevSettings.reload();
}

async function clearDirectory(dir: string): Promise<void> {
  const exists = await ReactNativeBlobUtil.fs.exists(dir);
  if (!exists) {
    return;
  }

  try {
    const entries = await ReactNativeBlobUtil.fs.ls(dir);
    await Promise.all(
      entries.map(name =>
        ReactNativeBlobUtil.fs
          .unlink(`${dir}/${name}`)
          .catch(() => undefined),
      ),
    );
  } catch {
    // Directory may be missing mid-wipe; ignore and continue.
  }
}
