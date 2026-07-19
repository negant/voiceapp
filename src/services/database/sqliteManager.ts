import SQLite, {
  type ResultSet,
  type SQLiteDatabase,
  type SQLError,
  type Transaction,
} from 'react-native-sqlite-storage';

import { DATABASE_NAME } from '@/services/database/constants';
import type { QueryResult } from '@/services/database/types';

SQLite.enablePromise(true);

class SQLiteManager {
  private db: SQLiteDatabase | null = null;

  async initDatabase(): Promise<SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
      });
    }
    return this.db;
  }

  async executeQuery<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    try {
      const db = await this.initDatabase();

      return await new Promise(resolve => {
        db.transaction((tx: Transaction) => {
          tx.executeSql(
            query,
            params,
            (_: Transaction, results: ResultSet) => {
              const data: T[] = [];
              for (let i = 0; i < results.rows.length; i++) {
                data.push(results.rows.item(i) as T);
              }
              resolve({ data, error: null, success: true });
            },
            (_: Transaction, error: SQLError) => {
              resolve({ data: [], error: error.message, success: false });
              return false;
            },
          );
        });
      });
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown database error',
        success: false,
      };
    }
  }

  closeDatabase(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

let manager: SQLiteManager | null = null;

export function getSQLiteManager(): SQLiteManager {
  if (!manager) {
    manager = new SQLiteManager();
  }
  return manager;
}

export function resetSQLiteManagerForTests(): void {
  if (manager) {
    manager.closeDatabase();
    manager = null;
  }
}

export type { SQLiteManager };
