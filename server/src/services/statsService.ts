import type { PoolClient } from 'pg';

import { config } from '../config.js';
import { pool } from '../db/pool.js';

export type StatsRow = {
  id: number;
  install_count: number;
  free_credits_grants: number;
  updated_at: Date;
};

export type StatsSnapshot = {
  installCount: number;
  freeCreditsGrants: number;
  freeCreditsInstallCap: number;
  remainingFreeGrantSlots: number;
};

/** Lock the singleton stats row (creates/migrates from legacy meta if needed). */
export async function lockStatsRow(client: PoolClient): Promise<StatsRow> {
  await client.query(
    `INSERT INTO voiceapp_stats (id, install_count, free_credits_grants)
     VALUES (1, 0, 0)
     ON CONFLICT (id) DO NOTHING`,
  );

  const result = await client.query<StatsRow>(
    `SELECT id, install_count, free_credits_grants, updated_at
     FROM voiceapp_stats WHERE id = 1 FOR UPDATE`,
  );
  let row = result.rows[0];

  // One-time migrate from legacy voiceapp_meta.free_installs_granted
  if (row && row.install_count === 0 && row.free_credits_grants === 0) {
    const legacy = await client.query<{ value: string }>(
      `SELECT value FROM voiceapp_meta WHERE key = 'free_installs_granted'`,
    );
    const legacyCount = Number.parseInt(legacy.rows[0]?.value ?? '0', 10) || 0;
    if (legacyCount > 0) {
      const migrated = await client.query<StatsRow>(
        `UPDATE voiceapp_stats
         SET install_count = $1,
             free_credits_grants = $1,
             updated_at = NOW()
         WHERE id = 1
         RETURNING id, install_count, free_credits_grants, updated_at`,
        [legacyCount],
      );
      row = migrated.rows[0] ?? row;
    }
  }

  return row;
}

/** Cap for welcome free credits — from voiceapp_setup, fallback env. */
export async function getFreeCreditsInstallCap(
  client: PoolClient,
): Promise<number> {
  const result = await client.query<{ value: string }>(
    `SELECT value FROM voiceapp_setup WHERE key = 'free_credits_install_cap'`,
  );
  const parsed = Number.parseInt(result.rows[0]?.value ?? '', 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return config.freeInstallsWithTestCredits;
}

export async function bumpStatsForNewInstall(
  client: PoolClient,
  params: { grantedFreeCredits: boolean },
): Promise<StatsRow> {
  const result = await client.query<StatsRow>(
    `UPDATE voiceapp_stats
     SET install_count = install_count + 1,
         free_credits_grants = free_credits_grants + $1,
         updated_at = NOW()
     WHERE id = 1
     RETURNING id, install_count, free_credits_grants, updated_at`,
    [params.grantedFreeCredits ? 1 : 0],
  );
  return result.rows[0];
}

export async function getStatsSnapshot(): Promise<StatsSnapshot> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const stats = await lockStatsRow(client);
    const cap = await getFreeCreditsInstallCap(client);
    await client.query('COMMIT');
    return {
      installCount: stats.install_count,
      freeCreditsGrants: stats.free_credits_grants,
      freeCreditsInstallCap: cap,
      remainingFreeGrantSlots: Math.max(0, cap - stats.free_credits_grants),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
