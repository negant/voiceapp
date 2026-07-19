import cors from '@fastify/cors';
import Fastify from 'fastify';

import { config } from './config.js';
import { migrate } from './db/migrate.js';
import { pool } from './db/pool.js';
import { registerRoutes } from './routes/api.js';

async function main(): Promise<void> {
  await migrate();

  const app = Fastify({
    logger: true,
  });

  await app.register(cors, { origin: true });
  await registerRoutes(app);

  await app.listen({ port: config.port, host: config.host });
}

main().catch(async error => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
