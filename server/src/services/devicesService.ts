import type { PoolClient } from 'pg';

import { config } from '../config.js';
import {
  addMonthsUtc,
  isFreeCreditsExpired,
  resolvePremiumPackTotal,
  type AccountPlan,
  type PlanEventType,
  type Platform,
} from '../domain/creditsEconomy.js';
import type { DbClient } from '../db/pool.js';
import { pool } from '../db/pool.js';
import { mapDeviceRow, type DeviceRow, type DeviceSnapshot } from '../types.js';

export { applyFreeCreditsExpiry } from './freeCreditsExpiry.js';

async function insertPlanEvent(
  client: PoolClient,
  params: {
    deviceId: string;
    eventType: PlanEventType;
    plan: AccountPlan;
    previousPlan?: AccountPlan | null;
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO voiceapp_device_plan_events
      (device_id, event_type, plan, previous_plan, meta)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      params.deviceId,
      params.eventType,
      params.plan,
      params.previousPlan ?? null,
      params.meta ? JSON.stringify(params.meta) : null,
    ],
  );
}

async function insertLedger(
  client: PoolClient,
  params: {
    deviceId: string;
    reason: string;
    deltaCredits: number;
    deltaFreeCredits: number;
    balanceCredits: number;
    balanceFreeCredits: number;
    clientRequestId?: string | null;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO voiceapp_credit_ledger
      (device_id, reason, delta_credits, delta_free_credits,
       balance_credits, balance_free_credits, client_request_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (client_request_id) DO NOTHING`,
    [
      params.deviceId,
      params.reason,
      params.deltaCredits,
      params.deltaFreeCredits,
      params.balanceCredits,
      params.balanceFreeCredits,
      params.clientRequestId ?? null,
    ],
  );
}

export async function getDeviceById(
  deviceId: string,
  db: DbClient = pool,
): Promise<DeviceRow | null> {
  const result = await db.query<DeviceRow>(
    'SELECT * FROM voiceapp_devices WHERE device_id = $1',
    [deviceId],
  );
  return result.rows[0] ?? null;
}

async function getFreeInstallsGranted(client: PoolClient): Promise<number> {
  const result = await client.query<{ value: string }>(
    `SELECT value FROM voiceapp_meta WHERE key = 'free_installs_granted' FOR UPDATE`,
  );
  return Number.parseInt(result.rows[0]?.value ?? '0', 10) || 0;
}

async function setFreeInstallsGranted(
  client: PoolClient,
  value: number,
): Promise<void> {
  await client.query(
    `INSERT INTO voiceapp_meta (key, value, updated_at)
     VALUES ('free_installs_granted', $1, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [String(value)],
  );
}

export type RegisterResult = {
  status: 'granted' | 'already_registered' | 'pool_exhausted';
  grantedFreeCredits: number;
  device: DeviceSnapshot;
  pool: {
    installCap: number;
    installsGranted: number;
    remainingSlots: number;
  };
};

export async function registerDevice(params: {
  deviceId: string;
  platform: Platform;
  appVersion?: string;
}): Promise<RegisterResult> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query<DeviceRow>(
      'SELECT * FROM voiceapp_devices WHERE device_id = $1 FOR UPDATE',
      [params.deviceId],
    );

    const installsGranted = await getFreeInstallsGranted(client);
    const installCap = config.freeInstallsWithTestCredits;
    const remainingSlots = Math.max(0, installCap - installsGranted);

    if (existing.rows[0]) {
      let row = existing.rows[0];
      if (params.appVersion && params.appVersion !== row.app_version) {
        const updated = await client.query<DeviceRow>(
          `UPDATE voiceapp_devices
           SET app_version = $2, last_sync_at = NOW(), updated_at = NOW()
           WHERE device_id = $1
           RETURNING *`,
          [params.deviceId, params.appVersion],
        );
        row = updated.rows[0] ?? row;
      } else {
        await client.query(
          `UPDATE voiceapp_devices SET last_sync_at = NOW(), updated_at = NOW()
           WHERE device_id = $1`,
          [params.deviceId],
        );
      }

      // Apply expiry inside the same transaction via direct update
      if (
        row.free_credits > 0 &&
        isFreeCreditsExpired(row.free_credits_expires_at)
      ) {
        const expired = await client.query<DeviceRow>(
          `UPDATE voiceapp_devices
           SET free_credits = 0, free_credits_expires_at = NULL, updated_at = NOW()
           WHERE device_id = $1
           RETURNING *`,
          [params.deviceId],
        );
        if (expired.rows[0]) {
          await insertLedger(client, {
            deviceId: params.deviceId,
            reason: 'expire_free',
            deltaCredits: 0,
            deltaFreeCredits: -row.free_credits,
            balanceCredits: expired.rows[0].credits,
            balanceFreeCredits: 0,
          });
          row = expired.rows[0];
        }
      }

      await client.query('COMMIT');
      return {
        status: 'already_registered',
        grantedFreeCredits: 0,
        device: mapDeviceRow(row),
        pool: {
          installCap,
          installsGranted,
          remainingSlots,
        },
      };
    }

    const canGrant =
      installsGranted < installCap && config.startingFreeCredits > 0;
    const grantedFreeCredits = canGrant ? config.startingFreeCredits : 0;
    const now = new Date();
    const freeExpires = canGrant
      ? addMonthsUtc(now, config.freeCreditsValidityMonths)
      : null;

    const inserted = await client.query<DeviceRow>(
      `INSERT INTO voiceapp_devices (
         device_id, platform, plan, credits, free_credits,
         free_credits_expires_at, installed_at, plan_enabled_at, app_version,
         last_sync_at
       ) VALUES ($1, $2, 'free', 0, $3, $4, $5, $5, $6, $5)
       RETURNING *`,
      [
        params.deviceId,
        params.platform,
        grantedFreeCredits,
        freeExpires,
        now,
        params.appVersion ?? null,
      ],
    );

    const row = inserted.rows[0];
    await insertPlanEvent(client, {
      deviceId: params.deviceId,
      eventType: 'installed',
      plan: 'free',
      meta: {
        platform: params.platform,
        appVersion: params.appVersion ?? null,
        grantedFreeCredits,
      },
    });
    await insertPlanEvent(client, {
      deviceId: params.deviceId,
      eventType: 'plan_enabled',
      plan: 'free',
      previousPlan: null,
    });

    if (grantedFreeCredits > 0) {
      await insertLedger(client, {
        deviceId: params.deviceId,
        reason: 'grant_welcome',
        deltaCredits: 0,
        deltaFreeCredits: grantedFreeCredits,
        balanceCredits: 0,
        balanceFreeCredits: grantedFreeCredits,
      });
      await setFreeInstallsGranted(client, installsGranted + 1);
    }

    await client.query('COMMIT');

    const nextGranted = grantedFreeCredits > 0 ? installsGranted + 1 : installsGranted;
    return {
      status: canGrant
        ? 'granted'
        : config.startingFreeCredits > 0
          ? 'pool_exhausted'
          : 'granted',
      grantedFreeCredits,
      device: mapDeviceRow(row),
      pool: {
        installCap,
        installsGranted: nextGranted,
        remainingSlots: Math.max(0, installCap - nextGranted),
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function syncDevice(params: {
  deviceId: string;
  appVersion?: string;
}): Promise<DeviceSnapshot | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query<DeviceRow>(
      'SELECT * FROM voiceapp_devices WHERE device_id = $1 FOR UPDATE',
      [params.deviceId],
    );
    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    let row = existing.rows[0];
    if (
      row.free_credits > 0 &&
      isFreeCreditsExpired(row.free_credits_expires_at)
    ) {
      const expired = await client.query<DeviceRow>(
        `UPDATE voiceapp_devices
         SET free_credits = 0, free_credits_expires_at = NULL, updated_at = NOW()
         WHERE device_id = $1
         RETURNING *`,
        [params.deviceId],
      );
      if (expired.rows[0]) {
        await insertLedger(client, {
          deviceId: params.deviceId,
          reason: 'expire_free',
          deltaCredits: 0,
          deltaFreeCredits: -row.free_credits,
          balanceCredits: expired.rows[0].credits,
          balanceFreeCredits: 0,
        });
        row = expired.rows[0];
      }
    }

    // Monthly Premium renewal: refill pack when renew_at is due
    if (
      row.plan === 'premium' &&
      row.premium_credits_renew_at &&
      row.premium_credits_renew_at.getTime() <= Date.now()
    ) {
      const pack = resolvePremiumPackTotal(
        config.premiumCredits,
        config.premiumGratisCredits,
      );
      const renewAt = addMonthsUtc(new Date(), 1);
      const renewed = await client.query<DeviceRow>(
        `UPDATE voiceapp_devices
         SET credits = $2,
             premium_credits_renew_at = $3,
             updated_at = NOW(),
             last_sync_at = NOW(),
             app_version = COALESCE($4, app_version)
         WHERE device_id = $1
         RETURNING *`,
        [params.deviceId, pack, renewAt, params.appVersion ?? null],
      );
      row = renewed.rows[0] ?? row;
      await insertPlanEvent(client, {
        deviceId: params.deviceId,
        eventType: 'plan_renewed',
        plan: 'premium',
        previousPlan: 'premium',
        meta: { credits: pack },
      });
      await insertLedger(client, {
        deviceId: params.deviceId,
        reason: 'renew_premium',
        deltaCredits: pack - existing.rows[0].credits,
        deltaFreeCredits: 0,
        balanceCredits: row.credits,
        balanceFreeCredits: row.free_credits,
      });
    } else {
      const touched = await client.query<DeviceRow>(
        `UPDATE voiceapp_devices
         SET last_sync_at = NOW(),
             updated_at = NOW(),
             app_version = COALESCE($2, app_version)
         WHERE device_id = $1
         RETURNING *`,
        [params.deviceId, params.appVersion ?? null],
      );
      row = touched.rows[0] ?? row;
    }

    await client.query('COMMIT');
    return mapDeviceRow(row);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function spendCredits(params: {
  deviceId: string;
  amount: number;
  clientRequestId?: string;
  reason?: string;
}): Promise<{ ok: true; device: DeviceSnapshot } | { ok: false; error: string; device?: DeviceSnapshot }> {
  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    return { ok: false, error: 'invalid_amount' };
  }
  const amount = Math.floor(params.amount);

  if (params.clientRequestId) {
    const prior = await pool.query(
      `SELECT 1 FROM voiceapp_credit_ledger WHERE client_request_id = $1`,
      [params.clientRequestId],
    );
    if (prior.rowCount && prior.rowCount > 0) {
      const device = await getDeviceById(params.deviceId);
      if (device) {
        return { ok: true, device: mapDeviceRow(device) };
      }
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query<DeviceRow>(
      'SELECT * FROM voiceapp_devices WHERE device_id = $1 FOR UPDATE',
      [params.deviceId],
    );
    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, error: 'device_not_found' };
    }

    let row = existing.rows[0];
    if (
      row.free_credits > 0 &&
      isFreeCreditsExpired(row.free_credits_expires_at)
    ) {
      const expired = await client.query<DeviceRow>(
        `UPDATE voiceapp_devices
         SET free_credits = 0, free_credits_expires_at = NULL, updated_at = NOW()
         WHERE device_id = $1
         RETURNING *`,
        [params.deviceId],
      );
      row = expired.rows[0] ?? { ...row, free_credits: 0 };
    }

    const total = row.credits + row.free_credits;
    if (total < amount) {
      await client.query('ROLLBACK');
      return {
        ok: false,
        error: 'insufficient_credits',
        device: mapDeviceRow(row),
      };
    }

    // Spend free credits first (they expire), then paid credits
    let remaining = amount;
    let freeDelta = 0;
    let paidDelta = 0;
    if (row.free_credits > 0) {
      freeDelta = Math.min(row.free_credits, remaining);
      remaining -= freeDelta;
    }
    if (remaining > 0) {
      paidDelta = remaining;
    }

    const nextFree = row.free_credits - freeDelta;
    const nextPaid = row.credits - paidDelta;
    const updated = await client.query<DeviceRow>(
      `UPDATE voiceapp_devices
       SET credits = $2,
           free_credits = $3,
           free_credits_expires_at = CASE WHEN $3 = 0 THEN NULL ELSE free_credits_expires_at END,
           last_sync_at = NOW(),
           updated_at = NOW()
       WHERE device_id = $1
       RETURNING *`,
      [params.deviceId, nextPaid, nextFree],
    );
    row = updated.rows[0] ?? row;

    await insertLedger(client, {
      deviceId: params.deviceId,
      reason: params.reason ?? 'spend_ai',
      deltaCredits: -paidDelta,
      deltaFreeCredits: -freeDelta,
      balanceCredits: row.credits,
      balanceFreeCredits: row.free_credits,
      clientRequestId: params.clientRequestId ?? null,
    });

    await client.query('COMMIT');
    return { ok: true, device: mapDeviceRow(row) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function setDevicePlan(params: {
  deviceId: string;
  plan: AccountPlan;
  clientRequestId?: string;
}): Promise<
  | { ok: true; device: DeviceSnapshot }
  | { ok: false; error: string }
> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query<DeviceRow>(
      'SELECT * FROM voiceapp_devices WHERE device_id = $1 FOR UPDATE',
      [params.deviceId],
    );
    if (!existing.rows[0]) {
      await client.query('ROLLBACK');
      return { ok: false, error: 'device_not_found' };
    }

    const row = existing.rows[0];
    if (row.plan === params.plan) {
      await client.query('COMMIT');
      return { ok: true, device: mapDeviceRow(row) };
    }

    const now = new Date();
    let next: DeviceRow;

    if (params.plan === 'premium') {
      const pack = resolvePremiumPackTotal(
        config.premiumCredits,
        config.premiumGratisCredits,
      );
      const renewAt = addMonthsUtc(now, 1);
      const updated = await client.query<DeviceRow>(
        `UPDATE voiceapp_devices
         SET plan = 'premium',
             credits = credits + $2,
             premium_credits_renew_at = $3,
             plan_enabled_at = $4,
             plan_disabled_at = NULL,
             last_sync_at = NOW(),
             updated_at = NOW()
         WHERE device_id = $1
         RETURNING *`,
        [params.deviceId, pack, renewAt, now],
      );
      next = updated.rows[0];
      await insertPlanEvent(client, {
        deviceId: params.deviceId,
        eventType: 'plan_enabled',
        plan: 'premium',
        previousPlan: row.plan,
        meta: { pack },
      });
      await insertLedger(client, {
        deviceId: params.deviceId,
        reason: 'grant_premium',
        deltaCredits: pack,
        deltaFreeCredits: 0,
        balanceCredits: next.credits,
        balanceFreeCredits: next.free_credits,
        clientRequestId: params.clientRequestId ?? null,
      });
    } else {
      const updated = await client.query<DeviceRow>(
        `UPDATE voiceapp_devices
         SET plan = 'free',
             premium_credits_renew_at = NULL,
             plan_enabled_at = $2,
             plan_disabled_at = $2,
             last_sync_at = NOW(),
             updated_at = NOW()
         WHERE device_id = $1
         RETURNING *`,
        [params.deviceId, now],
      );
      next = updated.rows[0];
      await insertPlanEvent(client, {
        deviceId: params.deviceId,
        eventType: 'plan_disabled',
        plan: 'free',
        previousPlan: row.plan,
      });
    }

    await client.query('COMMIT');
    return { ok: true, device: mapDeviceRow(next) };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listPlanEvents(
  deviceId: string,
  limit = 50,
): Promise<
  Array<{
    id: string;
    eventType: PlanEventType;
    plan: AccountPlan;
    previousPlan: AccountPlan | null;
    createdAt: string;
    meta: Record<string, unknown> | null;
  }>
> {
  const result = await pool.query<{
    id: string;
    event_type: PlanEventType;
    plan: AccountPlan;
    previous_plan: AccountPlan | null;
    created_at: Date;
    meta: Record<string, unknown> | null;
  }>(
    `SELECT id::text, event_type, plan, previous_plan, created_at, meta
     FROM voiceapp_device_plan_events
     WHERE device_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [deviceId, limit],
  );

  return result.rows.map(row => ({
    id: row.id,
    eventType: row.event_type,
    plan: row.plan,
    previousPlan: row.previous_plan,
    createdAt: row.created_at.toISOString(),
    meta: row.meta,
  }));
}
