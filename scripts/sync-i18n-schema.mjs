#!/usr/bin/env node
/**
 * Regenerates schema.json from en.json (dot-path reference for translators).
 * Run after adding keys to en.json: npm run i18n:schema
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/i18n/locales');
const enPath = path.join(localesDir, 'en.json');
const schemaPath = path.join(localesDir, 'schema.json');

function buildSchema(node, prefix = '') {
  const schema = {};

  for (const [key, value] of Object.entries(node)) {
    const dotPath = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      schema[key] = dotPath;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      schema[key] = buildSchema(value, dotPath);
    }
  }

  return schema;
}

async function main() {
  const en = JSON.parse(await readFile(enPath, 'utf8'));
  const schema = buildSchema(en);
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
  console.log(`Wrote ${schemaPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
