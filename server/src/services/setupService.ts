import { pool } from '../db/pool.js';

export type SetupSnapshot = {
  minAppVersion: string;
  latestAppVersion: string;
  forceUpdate: boolean;
  messageEn: string;
  messagePl: string;
  storeUrlIos: string;
  storeUrlAndroid: string;
};

const KEYS = [
  'min_app_version',
  'latest_app_version',
  'force_update',
  'message_en',
  'message_pl',
  'store_url_ios',
  'store_url_android',
] as const;

export async function getSetupSnapshot(): Promise<SetupSnapshot> {
  const result = await pool.query<{ key: string; value: string }>(
    `SELECT key, value FROM voiceapp_setup WHERE key = ANY($1::text[])`,
    [KEYS],
  );

  const map = new Map(result.rows.map(row => [row.key, row.value]));

  return {
    minAppVersion: map.get('min_app_version') ?? '0.0.1',
    latestAppVersion: map.get('latest_app_version') ?? '0.0.1',
    forceUpdate: (map.get('force_update') ?? 'false').toLowerCase() === 'true',
    messageEn: map.get('message_en') ?? '',
    messagePl: map.get('message_pl') ?? '',
    storeUrlIos: map.get('store_url_ios') ?? '',
    storeUrlAndroid: map.get('store_url_android') ?? '',
  };
}

export async function upsertSetupValue(
  key: string,
  value: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO voiceapp_setup (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value],
  );
}
