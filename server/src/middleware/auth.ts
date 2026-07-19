import type { FastifyReply, FastifyRequest } from 'fastify';

import { config } from '../config.js';

/** Returns false when the request was rejected (401 already sent). */
export async function requireApiToken(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    await reply
      .code(401)
      .send({ error: 'unauthorized', message: 'Missing Bearer token' });
    return false;
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token || token !== config.apiToken) {
    await reply
      .code(401)
      .send({ error: 'unauthorized', message: 'Invalid API token' });
    return false;
  }

  return true;
}
