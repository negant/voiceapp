import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function migrate(): Promise<void> {
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
}

async function main(): Promise<void> {
  try {
    await migrate();
    console.log('Migrations applied.');
  } finally {
    await pool.end();
  }
}

const isDirectRun = process.argv[1]?.endsWith('migrate.ts')
  || process.argv[1]?.endsWith('migrate.js');

if (isDirectRun) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
