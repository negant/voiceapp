import type { DbClient } from '../db/pool.js';
import { pool } from '../db/pool.js';
import { isFreeCreditsExpired } from '../domain/creditsEconomy.js';
import type { DeviceRow } from '../types.js';

/**
 * Expire free credits when past free_credits_expires_at.
 * Returns the (possibly updated) row.
 */
export async function applyFreeCreditsExpiry(
  row: DeviceRow,
  db: DbClient = pool,
  now: Date = new Date(),
): Promise<DeviceRow> {
  if (
    row.free_credits <= 0 ||
    !isFreeCreditsExpired(row.free_credits_expires_at, now)
  ) {
    return row;
  }

  const updated = await db.query<DeviceRow>(
    `UPDATE voiceapp_devices
     SET free_credits = 0,
         free_credits_expires_at = NULL,
         updated_at = NOW()
     WHERE device_id = $1 AND free_credits > 0
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

  return { ...row, free_credits: 0, free_credits_expires_at: null };
}
