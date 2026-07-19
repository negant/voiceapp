import cors from '@fastify/cors';
import Fastify from 'fastify';

import { config } from './config.js';
import { migrate } from './db/migrate.js';
import {
  appendDevLogLine,
  ensureDevLogsDir,
  fileLoggingEnabled,
} from './devFileLog.js';
import { pool } from './db/pool.js';
import { resolveRequestDeviceId } from './resolveRequestDeviceId.js';
import { registerRoutes } from './routes/api.js';

async function main(): Promise<void> {
  await migrate();

  const app = Fastify({
    logger: true,
  });

  if (fileLoggingEnabled) {
    const logFile = ensureDevLogsDir();
    app.log.info({ logFile }, 'Dev file logging enabled (server/logs/)');
    appendDevLogLine({ msg: 'server_start', logFile, port: config.port });

    // preHandler: body already parsed so deviceId from JSON is available
    app.addHook('preHandler', async request => {
      const deviceId = resolveRequestDeviceId(request);
      appendDevLogLine({
        msg: 'request',
        method: request.method,
        url: request.url,
        reqId: request.id,
        ...(deviceId ? { deviceId } : {}),
      });
    });

    app.addHook('onResponse', async (request, reply) => {
      const deviceId = resolveRequestDeviceId(request);
      appendDevLogLine({
        msg: 'response',
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTimeMs: reply.elapsedTime,
        reqId: request.id,
        ...(deviceId ? { deviceId } : {}),
      });
    });
  } else {
    app.log.info(
      { nodeEnv: config.nodeEnv },
      'File logging disabled (NODE_ENV !== development)',
    );
  }

  await app.register(cors, { origin: true });
  await registerRoutes(app);

  await app.listen({ port: config.port, host: config.host });
}

main().catch(async error => {
  console.error(error);
  appendDevLogLine({ msg: 'fatal', error: String(error) });
  await pool.end();
  process.exit(1);
});
