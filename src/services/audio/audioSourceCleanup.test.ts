jest.mock('@/services/audio/audioTrim', () => ({
  trimAudioFileIfNeeded: jest.fn(),
}));

import { prepareSourceAudio } from '@/services/audio/audioSourceCleanup';
import { trimAudioFileIfNeeded } from '@/services/audio/audioTrim';

const sourceFile = {
  uri: 'file:///mock/documents/audio/imports/source.m4a',
  name: 'voice-note.m4a',
  sizeBytes: 1200,
  durationSec: 8,
  extension: 'm4a',
};

describe('prepareSourceAudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns trim result when duration limit is applied', async () => {
    const trimmedFile = {
      ...sourceFile,
      name: 'voice-note-trim.m4a',
      durationSec: 600,
    };
    (trimAudioFileIfNeeded as jest.Mock).mockResolvedValue({
      ok: true,
      file: trimmedFile,
      trimmed: true,
      originalDurationSec: 900,
    });

    const prepared = await prepareSourceAudio(sourceFile, {
      maxDurationSec: 600,
    });

    expect(trimAudioFileIfNeeded).toHaveBeenCalledWith(
      sourceFile,
      600,
      expect.objectContaining({ outputSuffix: 'trim' }),
    );
    expect(prepared).toEqual({
      file: trimmedFile,
      trimmed: true,
      originalDurationSec: 900,
    });
  });

  it('keeps the original file when trim fails', async () => {
    (trimAudioFileIfNeeded as jest.Mock).mockResolvedValue({
      ok: false,
      reason: 'decode_failed',
    });

    const prepared = await prepareSourceAudio(sourceFile, {
      maxDurationSec: 600,
    });

    expect(prepared).toEqual({ file: sourceFile, trimmed: false });
  });
});
