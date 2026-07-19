import type { PoolClient } from 'pg';

import { config } from '../config.js';
import {
  shouldExpireFreeCredits,
  type AccountPlan,
} from '../domain/creditsEconomy.js';
import type { DbClient } from '../db/pool.js';
import { pool } from '../db/pool.js';
import type { DeviceRow } from '../types.js';

type ExpirySource = Pick<
  DeviceRow,
  | 'device_id'
  | 'plan'
  | 'credits'
  | 'free_credits'
  | 'free_credits_expires_at'
  | 'installed_at'
>;

export function deviceNeedsFreeCreditsExpiry(
  row: ExpirySource,
  now: Date = new Date(),
): boolean {
  return shouldExpireFreeCredits({
    plan: row.plan as AccountPlan,
    freeCredits: row.free_credits,
    freeCreditsExpiresAt: row.free_credits_expires_at,
    installedAt: row.installed_at,
    validityMonths: config.freeCreditsValidityMonths,
    now,
  });
}

async function zeroFreeCredits(
  db: DbClient,
  row: ExpirySource,
): Promise<DeviceRow> {
  const updated = await db.query<DeviceRow>(
    `UPDATE voiceapp_devices
     SET free_credits = 0,
         free_credits_expires_at = NULL,
         updated_at = NOW()
     WHERE device_id = $1 AND free_credits > 0 AND plan = 'free'
     RETURNING *`,
    [row.device_id],
  );

  if (updated.rows[0]) {
    await db.query(
      `INSERT INTO voiceapp_credit_ledger
        (device_id, reason, delta_credits, delta_free_credits,
         balance_credits, balance_free_credits)
       VALUES ($1, 'expire_free', 0, $2, $3, 0)`,
      [row.device_id, -row.free_credits, updated.rows[0].credits],
    );
    return updated.rows[0];
  }

  return {
    ...(row as DeviceRow),
    free_credits: 0,
    free_credits_expires_at: null,
  };
}

/**
 * Expire free credits when past install+3 months.
 * Premium devices keep free credits permanently (no wipe).
 */
export async function applyFreeCreditsExpiry(
  row: DeviceRow,
  db: DbClient = pool,
  now: Date = new Date(),
): Promise<DeviceRow> {
  if (!deviceNeedsFreeCreditsExpiry(row, now)) {
    return row;
  }
  return zeroFreeCredits(db, row);
}

/** Same as applyFreeCreditsExpiry but for an open transaction. */
export async function applyFreeCreditsExpiryInTx(
  client: PoolClient,
  row: DeviceRow,
  now: Date = new Date(),
): Promise<DeviceRow> {
  if (!deviceNeedsFreeCreditsExpiry(row, now)) {
    return row;
  }
  return zeroFreeCredits(client, row);
}
