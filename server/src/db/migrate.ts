import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './pool.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** schema.sql is not emitted by tsc — resolve dist copy or source tree (VPS has both). */
function resolveSchemaSqlPath(): string {
  const candidates = [
    join(__dirname, 'schema.sql'),
    join(process.cwd(), 'src/db/schema.sql'),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      return path;
    }
  }
  throw new Error(`schema.sql not found (tried: ${candidates.join(', ')})`);
}

export async function migrate(): Promise<void> {
  const sql = readFileSync(resolveSchemaSqlPath(), 'utf8');
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
