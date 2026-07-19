import { SCHEMA_VERSION } from '@/services/database/constants';
import { SCHEMA_DDL, runMigrations } from './schema';
import type { SQLiteManager } from './sqliteManager';

function createMockDb(
  initialVersion: number | null,
): SQLiteManager & { queries: string[] } {
  let version = initialVersion;
  const queries: string[] = [];

  return {
    queries,
    async executeQuery<T = Record<string, unknown>>(
      query: string,
      params: unknown[] = [],
    ) {
      queries.push(query.trim());

      if (query.includes('PRAGMA table_info(voice_presets)')) {
        return {
          success: true,
          error: null,
          data: [{ name: 'id' }, { name: 'name' }, { name: 'pitch' }] as T[],
        };
      }

      if (query.includes('SELECT version FROM schema_version')) {
        return {
          success: true,
          error: null,
          data: version === null ? [] : [{ version }],
        } as { success: true; error: null; data: T[] };
      }

      if (query.startsWith('INSERT INTO schema_version')) {
        version = params[0] as number;
        return { success: true, error: null, data: [] };
      }

      if (query.startsWith('UPDATE schema_version')) {
        version = params[0] as number;
        return { success: true, error: null, data: [] };
      }

      return { success: true, error: null, data: [] };
    },
  } as SQLiteManager & { queries: string[] };
}

describe('runMigrations', () => {
  it('creates all tables on fresh install', async () => {
    const db = createMockDb(null);

    await runMigrations(db);

    expect(db.queries.some(query => query.includes('processed_history'))).toBe(
      true,
    );
    expect(db.queries.some(query => query.includes('voice_presets'))).toBe(
      true,
    );
    expect(db.queries).toContain(
      'INSERT INTO schema_version (version) VALUES (?)',
    );
  });

  it('ensures processed_history exists when upgrading from v2', async () => {
    const db = createMockDb(2);

    await runMigrations(db);

    expect(db.queries.some(query => query.includes('processed_history'))).toBe(
      true,
    );
    expect(db.queries).toContain('UPDATE schema_version SET version = ?');
  });

  it('adds voice_presets v4 columns when they are missing', async () => {
    const db = createMockDb(3);

    await runMigrations(db);

    expect(
      db.queries.some(query =>
        query.includes('ALTER TABLE voice_presets ADD COLUMN source_tier'),
      ),
    ).toBe(true);
    expect(db.queries).toContain('UPDATE schema_version SET version = ?');
  });

  it('adds voice_presets v5 chain columns when they are missing', async () => {
    const db = createMockDb(4);

    await runMigrations(db);

    expect(
      db.queries.some(query =>
        query.includes('ALTER TABLE voice_presets ADD COLUMN chain_step1_tier'),
      ),
    ).toBe(true);
    expect(db.queries).toContain('UPDATE schema_version SET version = ?');
  });

  it('skips voice_presets alters when v4 columns already exist', async () => {
    const db = createMockDb(3);
    const originalExecute = db.executeQuery.bind(db);

    db.executeQuery = async (query: string, params: unknown[] = []) => {
      if (query.includes('PRAGMA table_info(voice_presets)')) {
        return {
          success: true,
          error: null,
          data: [
            { name: 'source_tier' },
            { name: 'source_id' },
            { name: 'avatar_image_key' },
            { name: 'chain_step1_tier' },
            { name: 'chain_step1_id' },
            { name: 'chain_step2_tier' },
            { name: 'chain_step2_id' },
          ],
        };
      }

      return originalExecute(query, params);
    };

    await runMigrations(db);

    expect(
      db.queries.some(query =>
        query.includes('ALTER TABLE voice_presets ADD COLUMN'),
      ),
    ).toBe(false);
    expect(db.queries).toContain('UPDATE schema_version SET version = ?');
  });

  it('repairs schema when version is already v4 but ddl was skipped', async () => {
    const db = createMockDb(SCHEMA_VERSION);

    await runMigrations(db);

    expect(db.queries.some(query => query.includes('processed_history'))).toBe(
      true,
    );
    expect(db.queries).not.toContain('UPDATE schema_version SET version = ?');
  });

  it('exports ddl for every current table', () => {
    expect(SCHEMA_DDL.length).toBe(4);
    expect(SCHEMA_DDL.join('\n')).toContain('processed_history');
  });
});
