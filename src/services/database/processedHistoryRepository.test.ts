import {
  buildProcessedHistoryInsert,
  deleteAllProcessedHistory,
  mapProcessedHistoryRow,
  selectEntriesToTrim,
} from './processedHistoryRepository';
import { getSQLiteManager } from '@/services/database/sqliteManager';

jest.mock('@/services/database/sqliteManager', () => ({
  getSQLiteManager: jest.fn(),
}));

const mockExecuteQuery = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getSQLiteManager as jest.Mock).mockReturnValue({
    executeQuery: mockExecuteQuery,
  });
});

describe('processedHistoryRepository helpers', () => {
  it('maps database rows to processed history entries', () => {
    const entry = mapProcessedHistoryRow({
      id: 'processed_1',
      file_name: 'demo-processed.wav',
      output_uri: 'file:///processed/demo.wav',
      source_file_name: 'demo.mp3',
      preset_label: 'Warm',
      created_at: 100,
    });

    expect(entry.fileName).toBe('demo-processed.wav');
    expect(entry.presetLabel).toBe('Warm');
  });

  it('builds insert payload with generated id', () => {
    const entry = buildProcessedHistoryInsert({
      fileName: 'voice-processed.wav',
      outputUri: 'file:///processed/voice.wav',
      sourceFileName: 'voice.mp3',
      presetLabel: 'Studio',
    });

    expect(entry.id).toContain('processed_');
    expect(entry.sourceFileName).toBe('voice.mp3');
  });

  it('selects oldest overflow entries beyond the limit', () => {
    const entries = selectEntriesToTrim(
      [
        {
          id: '1',
          fileName: 'a.wav',
          outputUri: 'file:///a.wav',
          sourceFileName: 'a.mp3',
          presetLabel: 'Natural',
          createdAt: 100,
        },
        {
          id: '2',
          fileName: 'b.wav',
          outputUri: 'file:///b.wav',
          sourceFileName: 'b.mp3',
          presetLabel: 'Warm',
          createdAt: 300,
        },
        {
          id: '3',
          fileName: 'c.wav',
          outputUri: 'file:///c.wav',
          sourceFileName: 'c.mp3',
          presetLabel: 'Deep',
          createdAt: 200,
        },
      ],
      2,
    );

    expect(removedIds(entries)).toEqual(['1']);
  });

  it('deleteAllProcessedHistory returns output URIs and clears the table', async () => {
    mockExecuteQuery
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: '1',
            file_name: 'a.wav',
            output_uri: 'file:///a.wav',
            source_file_name: 'a.mp3',
            preset_label: 'Natural',
            created_at: 100,
          },
          {
            id: '2',
            file_name: 'b.wav',
            output_uri: 'file:///b.wav',
            source_file_name: 'b.mp3',
            preset_label: 'Warm',
            created_at: 200,
          },
        ],
      })
      .mockResolvedValueOnce({ success: true });

    const outputUris = await deleteAllProcessedHistory();

    expect(outputUris).toEqual(['file:///a.wav', 'file:///b.wav']);
    expect(mockExecuteQuery).toHaveBeenLastCalledWith(
      'DELETE FROM processed_history',
    );
  });

  it('deleteAllProcessedHistory returns an empty array when there are no entries', async () => {
    mockExecuteQuery.mockResolvedValueOnce({ success: true, data: [] });

    const outputUris = await deleteAllProcessedHistory();

    expect(outputUris).toEqual([]);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
  });
});

function removedIds(entries: { id: string }[]): string[] {
  return entries.map(entry => entry.id);
}
