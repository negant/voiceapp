import { SCHEMA_VERSION } from '@/services/database/constants';
import type { SQLiteManager } from '@/services/database/sqliteManager';

const CREATE_SCHEMA_VERSION = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
  );
`;

const CREATE_SETTINGS = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

const CREATE_VOICE_PRESETS = `
  CREATE TABLE IF NOT EXISTS voice_presets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    pitch INTEGER NOT NULL,
    tempo INTEGER NOT NULL,
    echo INTEGER NOT NULL,
    reverb INTEGER NOT NULL,
    bass INTEGER NOT NULL,
    accent_color TEXT NOT NULL,
    source_tier TEXT,
    source_id TEXT,
    avatar_image_key TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

const CREATE_PROCESSED_HISTORY = `
  CREATE TABLE IF NOT EXISTS processed_history (
    id TEXT PRIMARY KEY NOT NULL,
    file_name TEXT NOT NULL,
    output_uri TEXT NOT NULL,
    source_file_name TEXT NOT NULL,
    preset_label TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`;

/** Idempotent DDL — safe on fresh install and when repairing a partial schema. */
export const SCHEMA_DDL = [
  CREATE_SCHEMA_VERSION,
  CREATE_SETTINGS,
  CREATE_VOICE_PRESETS,
  CREATE_PROCESSED_HISTORY,
] as const;

async function getCurrentSchemaVersion(
  db: SQLiteManager,
): Promise<number | null> {
  const versionResult = await db.executeQuery<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1',
  );

  if (!versionResult.success) {
    throw new Error(versionResult.error ?? 'Failed to read schema version');
  }

  return versionResult.data[0]?.version ?? null;
}

async function getTableColumnNames(
  db: SQLiteManager,
  tableName: string,
): Promise<Set<string>> {
  const result = await db.executeQuery<{ name: string }>(
    `PRAGMA table_info(${tableName})`,
  );

  if (!result.success) {
    throw new Error(result.error ?? `Failed to read ${tableName} columns`);
  }

  return new Set(result.data.map(row => row.name));
}

function isDuplicateColumnError(error: unknown): boolean {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' &&
            error !== null &&
            'message' in error &&
            typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : String(error);

  return message.toLowerCase().includes('duplicate column');
}

/** Adds v4 voice_presets metadata columns when missing (safe to run repeatedly). */
async function ensureVoicePresetV4Columns(db: SQLiteManager): Promise<void> {
  const columns = await getTableColumnNames(db, 'voice_presets');
  const additions = [
    {
      name: 'source_tier',
      statement: 'ALTER TABLE voice_presets ADD COLUMN source_tier TEXT',
    },
    {
      name: 'source_id',
      statement: 'ALTER TABLE voice_presets ADD COLUMN source_id TEXT',
    },
    {
      name: 'avatar_image_key',
      statement:
        'ALTER TABLE voice_presets ADD COLUMN avatar_image_key TEXT',
    },
  ] as const;

  for (const column of additions) {
    if (columns.has(column.name)) {
      continue;
    }

    const result = await db.executeQuery(column.statement);
    if (!result.success && !isDuplicateColumnError(result.error)) {
      throw new Error(
        result.error ?? `Failed to add voice_presets.${column.name}`,
      );
    }
  }
}

/** Adds v5 voice_presets effect-chain columns when missing (safe to run repeatedly). */
async function ensureVoicePresetV5Columns(db: SQLiteManager): Promise<void> {
  const columns = await getTableColumnNames(db, 'voice_presets');
  const additions = [
    {
      name: 'chain_step1_tier',
      statement: 'ALTER TABLE voice_presets ADD COLUMN chain_step1_tier TEXT',
    },
    {
      name: 'chain_step1_id',
      statement: 'ALTER TABLE voice_presets ADD COLUMN chain_step1_id TEXT',
    },
    {
      name: 'chain_step2_tier',
      statement: 'ALTER TABLE voice_presets ADD COLUMN chain_step2_tier TEXT',
    },
    {
      name: 'chain_step2_id',
      statement: 'ALTER TABLE voice_presets ADD COLUMN chain_step2_id TEXT',
    },
  ] as const;

  for (const column of additions) {
    if (columns.has(column.name)) {
      continue;
    }

    const result = await db.executeQuery(column.statement);
    if (!result.success && !isDuplicateColumnError(result.error)) {
      throw new Error(
        result.error ?? `Failed to add voice_presets.${column.name}`,
      );
    }
  }
}

export async function runMigrations(db: SQLiteManager): Promise<void> {
  for (const statement of SCHEMA_DDL) {
    const result = await db.executeQuery(statement);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to apply database schema');
    }
  }

  await ensureVoicePresetV4Columns(db);
  await ensureVoicePresetV5Columns(db);

  const currentVersion = await getCurrentSchemaVersion(db);

  if (currentVersion === null) {
    const insert = await db.executeQuery(
      'INSERT INTO schema_version (version) VALUES (?)',
      [SCHEMA_VERSION],
    );
    if (!insert.success) {
      throw new Error(insert.error ?? 'Failed to initialize schema version');
    }
    return;
  }

  if (currentVersion < SCHEMA_VERSION) {
    const update = await db.executeQuery(
      'UPDATE schema_version SET version = ?',
      [SCHEMA_VERSION],
    );
    if (!update.success) {
      throw new Error(update.error ?? 'Failed to update schema version');
    }
  }
}
