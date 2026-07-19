declare module 'react-native-sqlite-storage' {
  export interface SQLError {
    message: string;
    code?: number;
  }

  export interface ResultSet {
    rows: {
      length: number;
      item: (index: number) => Record<string, unknown>;
    };
    rowsAffected: number;
    insertId?: number;
  }

  export interface Transaction {
    executeSql: (
      sql: string,
      params?: unknown[],
      success?: (tx: Transaction, result: ResultSet) => void,
      error?: (tx: Transaction, err: SQLError) => boolean | void,
    ) => void;
  }

  export interface SQLiteDatabase {
    transaction: (
      fn: (tx: Transaction) => void,
      error?: (err: SQLError) => void,
      success?: () => void,
    ) => void;
    close: () => void;
  }

  interface SQLiteStatic {
    enablePromise: (enable: boolean) => void;
    openDatabase: (params: {
      name: string;
      location?: string;
    }) => Promise<SQLiteDatabase>;
  }

  const SQLite: SQLiteStatic;
  export default SQLite;
}
