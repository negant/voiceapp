import type { ProcessedHistoryEntry } from '@/types/voiceStudio';
import { getSQLiteManager } from '@/services/database/sqliteManager';

export const PROCESSED_HISTORY_LIMIT = 20;

type ProcessedHistoryRow = {
  id: string;
  file_name: string;
  output_uri: string;
  source_file_name: string;
  preset_label: string;
  created_at: number;
};

export function createProcessedHistoryId(now: number = Date.now()): string {
  return `processed_${now}_${Math.random().toString(36).slice(2, 8)}`;
}

export function mapProcessedHistoryRow(
  row: ProcessedHistoryRow,
): ProcessedHistoryEntry {
  return {
    id: row.id,
    fileName: row.file_name,
    outputUri: row.output_uri,
    sourceFileName: row.source_file_name,
    presetLabel: row.preset_label,
    createdAt: row.created_at,
  };
}

export function buildProcessedHistoryInsert(
  input: Omit<ProcessedHistoryEntry, 'id' | 'createdAt'>,
  now: number = Date.now(),
): ProcessedHistoryEntry {
  return {
    id: createProcessedHistoryId(now),
    createdAt: now,
    ...input,
  };
}

export async function listProcessedHistory(): Promise<ProcessedHistoryEntry[]> {
  const result = await getSQLiteManager().executeQuery<ProcessedHistoryRow>(
    `SELECT id, file_name, output_uri, source_file_name, preset_label, created_at
     FROM processed_history
     ORDER BY created_at DESC`,
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to list processed history');
  }

  return result.data.map(mapProcessedHistoryRow);
}

export async function addProcessedHistoryEntry(
  input: Omit<ProcessedHistoryEntry, 'id' | 'createdAt'>,
): Promise<{ entry: ProcessedHistoryEntry; removedOutputUris: string[] }> {
  const entry = buildProcessedHistoryInsert(input);
  const insert = await getSQLiteManager().executeQuery(
    `INSERT INTO processed_history (
      id, file_name, output_uri, source_file_name, preset_label, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.fileName,
      entry.outputUri,
      entry.sourceFileName,
      entry.presetLabel,
      entry.createdAt,
    ],
  );

  if (!insert.success) {
    throw new Error(insert.error ?? 'Failed to save processed history entry');
  }

  const removedOutputUris = await trimProcessedHistory(PROCESSED_HISTORY_LIMIT);
  return { entry, removedOutputUris };
}

export async function deleteProcessedHistoryEntry(id: string): Promise<void> {
  const result = await getSQLiteManager().executeQuery(
    'DELETE FROM processed_history WHERE id = ?',
    [id],
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to delete processed history entry');
  }
}

/** Removes every processed history row; returns output URIs so callers can delete files. */
export async function deleteAllProcessedHistory(): Promise<string[]> {
  const entries = await listProcessedHistory();
  if (entries.length === 0) {
    return [];
  }

  const result = await getSQLiteManager().executeQuery(
    'DELETE FROM processed_history',
  );

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to delete all processed history');
  }

  return entries.map(entry => entry.outputUri);
}

export async function trimProcessedHistory(limit: number): Promise<string[]> {
  const entries = await listProcessedHistory();
  if (entries.length <= limit) {
    return [];
  }

  const removed = entries.slice(limit);
  for (const entry of removed) {
    await deleteProcessedHistoryEntry(entry.id);
  }

  return removed.map(entry => entry.outputUri);
}

export function selectEntriesToTrim(
  entries: ProcessedHistoryEntry[],
  limit: number,
): ProcessedHistoryEntry[] {
  if (entries.length <= limit) {
    return [];
  }

  return [...entries]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(limit);
}
