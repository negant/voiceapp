import type { FastifyRequest } from 'fastify';

/** Pull deviceId from params, body, or /v1/devices/:id path when present. */
export function resolveRequestDeviceId(
  request: FastifyRequest,
): string | undefined {
  const params = request.params as { deviceId?: string } | undefined;
  if (params?.deviceId?.trim()) {
    return params.deviceId.trim();
  }

  const body = request.body as
    | { deviceId?: unknown; installationId?: unknown }
    | undefined;
  if (typeof body?.deviceId === 'string' && body.deviceId.trim()) {
    return body.deviceId.trim();
  }
  if (typeof body?.installationId === 'string' && body.installationId.trim()) {
    return body.installationId.trim();
  }

  const pathMatch = request.url.match(
    /\/v1\/devices\/([^/?]+)(?:\/|$|\?)/,
  );
  const segment = pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : '';
  if (segment && segment !== 'register') {
    return segment;
  }

  return undefined;
}
