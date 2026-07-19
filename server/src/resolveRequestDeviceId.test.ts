import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FastifyRequest } from 'fastify';

import { resolveRequestDeviceId } from './resolveRequestDeviceId.js';

function fakeRequest(partial: {
  url: string;
  params?: { deviceId?: string };
  body?: { deviceId?: string; installationId?: string };
}): FastifyRequest {
  return partial as unknown as FastifyRequest;
}

describe('resolveRequestDeviceId', () => {
  it('reads deviceId from body', () => {
    const id = resolveRequestDeviceId(
      fakeRequest({
        url: '/v1/devices/register',
        body: { deviceId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' },
      }),
    );
    assert.equal(id, 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
  });

  it('reads deviceId from params', () => {
    const id = resolveRequestDeviceId(
      fakeRequest({
        url: '/v1/devices/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        params: { deviceId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' },
      }),
    );
    assert.equal(id, 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
  });

  it('parses deviceId from path when params missing', () => {
    const id = resolveRequestDeviceId(
      fakeRequest({
        url: '/v1/devices/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/plan-events',
      }),
    );
    assert.equal(id, 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
  });

  it('returns undefined for setup / health', () => {
    assert.equal(
      resolveRequestDeviceId(fakeRequest({ url: '/v1/setup' })),
      undefined,
    );
    assert.equal(
      resolveRequestDeviceId(fakeRequest({ url: '/health' })),
      undefined,
    );
  });
});
