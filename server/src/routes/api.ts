import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { config } from '../config.js';
import { appendDevLogLine } from '../devFileLog.js';
import { requireApiToken } from '../middleware/auth.js';
import { applyFreeCreditsExpiry } from '../services/freeCreditsExpiry.js';
import {
  getDeviceById,
  listPlanEvents,
  registerDevice,
  setDevicePlan,
  spendCredits,
  syncDevice,
} from '../services/devicesService.js';
import { mapDeviceRow } from '../types.js';
import { getSetupSnapshot } from '../services/setupService.js';
import { getStatsSnapshot } from '../services/statsService.js';

const platformSchema = z.enum(['ios', 'android']);
const planSchema = z.enum(['free', 'premium']);

const registerBodySchema = z.object({
  deviceId: z.string().min(8).max(128),
  platform: platformSchema,
  appVersion: z.string().max(32).optional(),
});

const spendBodySchema = z.object({
  deviceId: z.string().min(8).max(128),
  amount: z.number().int().positive(),
  clientRequestId: z.string().min(8).max(128).optional(),
  reason: z.string().max(64).optional(),
});

const planBodySchema = z.object({
  deviceId: z.string().min(8).max(128),
  plan: planSchema,
  clientRequestId: z.string().min(8).max(128).optional(),
});

const syncBodySchema = z.object({
  deviceId: z.string().min(8).max(128),
  appVersion: z.string().max(32).optional(),
});

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    ok: true,
    service: 'voiceapp-api',
  }));

  app.addHook('preHandler', async (request, reply) => {
    if (request.url === '/health' || request.url.startsWith('/health?')) {
      return;
    }
    const ok = await requireApiToken(request, reply);
    if (!ok) {
      return reply;
    }
  });

  app.get('/v1/setup', async () => {
    const [setup, stats] = await Promise.all([
      getSetupSnapshot(),
      getStatsSnapshot(),
    ]);
    return { setup, stats };
  });

  app.get('/v1/stats', async () => {
    const stats = await getStatsSnapshot();
    return { stats };
  });

  app.post('/v1/devices/register', async (request, reply) => {
    const parsed = registerBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const result = await registerDevice(parsed.data);
    appendDevLogLine({
      msg: result.restored ? 'credits_restore' : 'credits_register',
      deviceId: result.device.deviceId,
      status: result.status,
      restored: result.restored,
      plan: result.device.plan,
      balance: result.device.balance,
      credits: result.device.credits,
      freeCredits: result.device.freeCredits,
      grantedFreeCredits: result.grantedFreeCredits,
      installCount: result.pool.installCount,
      freeCreditsGrants: result.pool.installsGranted,
      freeCreditsInstallCap: result.pool.installCap,
    });
    request.log.info(
      {
        event: result.restored ? 'credits_restore' : 'credits_register',
        deviceId: result.device.deviceId,
        status: result.status,
        restored: result.restored,
        plan: result.device.plan,
        balance: result.device.balance,
        installCount: result.pool.installCount,
      },
      result.restored ? 'credits_restore' : 'credits_register',
    );
    return {
      bootstrapStatus: result.status,
      restored: result.restored,
      grantedCredits: result.grantedFreeCredits,
      grantedFreeCredits: result.grantedFreeCredits,
      balance: result.device.balance,
      accountPlan: result.device.plan,
      creditsPerStartedMinute: config.creditsPerStartedMinute,
      // Legacy field expected by older app stub
      creditsPerAi10Sec: config.creditsPerStartedMinute,
      device: result.device,
      pool: result.pool,
      stats: {
        installCount: result.pool.installCount,
        freeCreditsGrants: result.pool.installsGranted,
        freeCreditsInstallCap: result.pool.installCap,
        remainingFreeGrantSlots: result.pool.remainingSlots,
      },
    };
  });

  // Alias for existing app stub path
  app.post('/v1/credits/bootstrap', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const deviceId =
      (typeof body.deviceId === 'string' && body.deviceId) ||
      (typeof body.installationId === 'string' && body.installationId) ||
      '';
    const parsed = registerBodySchema.safeParse({
      deviceId,
      platform: body.platform,
      appVersion: body.appVersion,
    });
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }

    const result = await registerDevice(parsed.data);
    appendDevLogLine({
      msg: result.restored ? 'credits_restore' : 'credits_register',
      via: 'bootstrap',
      deviceId: result.device.deviceId,
      status: result.status,
      restored: result.restored,
      plan: result.device.plan,
      balance: result.device.balance,
      credits: result.device.credits,
      freeCredits: result.device.freeCredits,
      installCount: result.pool.installCount,
    });
    request.log.info(
      {
        event: result.restored ? 'credits_restore' : 'credits_register',
        via: 'bootstrap',
        deviceId: result.device.deviceId,
        status: result.status,
        restored: result.restored,
        balance: result.device.balance,
      },
      result.restored ? 'credits_restore' : 'credits_register',
    );
    return {
      bootstrapStatus: result.status,
      restored: result.restored,
      grantedCredits: result.grantedFreeCredits,
      balance: result.device.balance,
      accountPlan: result.device.plan,
      creditsPerAi10Sec: config.creditsPerStartedMinute,
      creditsPerStartedMinute: config.creditsPerStartedMinute,
      device: result.device,
      pool: result.pool,
      stats: {
        installCount: result.pool.installCount,
        freeCreditsGrants: result.pool.installsGranted,
        freeCreditsInstallCap: result.pool.installCap,
        remainingFreeGrantSlots: result.pool.remainingSlots,
      },
    };
  });

  app.get('/v1/devices/:deviceId', async (request, reply) => {
    const { deviceId } = request.params as { deviceId: string };
    const row = await getDeviceById(deviceId);
    if (!row) {
      return reply.code(404).send({ error: 'device_not_found' });
    }
    const device = mapDeviceRow(await applyFreeCreditsExpiry(row));
    return { device };
  });

  app.get('/v1/devices/:deviceId/plan-events', async (request, reply) => {
    const { deviceId } = request.params as { deviceId: string };
    const row = await getDeviceById(deviceId);
    if (!row) {
      return reply.code(404).send({ error: 'device_not_found' });
    }
    const events = await listPlanEvents(deviceId);
    return { events };
  });

  app.post('/v1/credits/sync', async (request, reply) => {
    const parsed = syncBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const device = await syncDevice(parsed.data);
    if (!device) {
      appendDevLogLine({
        msg: 'credits_sync',
        deviceId: parsed.data.deviceId,
        ok: false,
        error: 'device_not_found',
      });
      return reply.code(404).send({ error: 'device_not_found' });
    }
    appendDevLogLine({
      msg: 'credits_sync',
      deviceId: device.deviceId,
      ok: true,
      plan: device.plan,
      balance: device.balance,
      credits: device.credits,
      freeCredits: device.freeCredits,
    });
    request.log.info(
      {
        event: 'credits_sync',
        deviceId: device.deviceId,
        plan: device.plan,
        balance: device.balance,
      },
      'credits_sync',
    );
    return {
      device,
      balance: device.balance,
      accountPlan: device.plan,
      creditsPerStartedMinute: config.creditsPerStartedMinute,
    };
  });

  app.post('/v1/credits/spend', async (request, reply) => {
    const parsed = spendBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const result = await spendCredits(parsed.data);
    if (!result.ok) {
      appendDevLogLine({
        msg: 'credits_spend',
        deviceId: parsed.data.deviceId,
        ok: false,
        amount: parsed.data.amount,
        error: result.error,
        balance: result.device?.balance,
      });
      const code = result.error === 'device_not_found' ? 404 : 409;
      return reply.code(code).send({
        error: result.error,
        device: result.device,
      });
    }
    appendDevLogLine({
      msg: 'credits_spend',
      deviceId: result.device.deviceId,
      ok: true,
      amount: parsed.data.amount,
      plan: result.device.plan,
      balance: result.device.balance,
      credits: result.device.credits,
      freeCredits: result.device.freeCredits,
    });
    request.log.info(
      {
        event: 'credits_spend',
        deviceId: result.device.deviceId,
        amount: parsed.data.amount,
        balance: result.device.balance,
      },
      'credits_spend',
    );
    return {
      ok: true,
      device: result.device,
      balance: result.device.balance,
    };
  });

  app.post('/v1/credits/plan', async (request, reply) => {
    const parsed = planBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid_body', details: parsed.error.flatten() });
    }
    const result = await setDevicePlan(parsed.data);
    if (!result.ok) {
      appendDevLogLine({
        msg: 'credits_plan',
        deviceId: parsed.data.deviceId,
        ok: false,
        plan: parsed.data.plan,
        error: result.error,
      });
      return reply.code(404).send({ error: result.error });
    }
    appendDevLogLine({
      msg: 'credits_plan',
      deviceId: result.device.deviceId,
      ok: true,
      plan: result.device.plan,
      balance: result.device.balance,
      credits: result.device.credits,
      freeCredits: result.device.freeCredits,
      planEnabledAt: result.device.planEnabledAt,
      planDisabledAt: result.device.planDisabledAt,
    });
    request.log.info(
      {
        event: 'credits_plan',
        deviceId: result.device.deviceId,
        plan: result.device.plan,
        balance: result.device.balance,
      },
      'credits_plan',
    );
    return {
      ok: true,
      device: result.device,
      balance: result.device.balance,
      accountPlan: result.device.plan,
    };
  });
}
