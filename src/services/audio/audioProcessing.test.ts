import { DEFAULT_AUDIO_EFFECTS } from '@/constants/voiceStudio';
import { getPresetEffects } from '@/utils/voiceStudioEffects';
import { ProcessingAbortedError } from '@/services/audio/processingErrors';
import { processAudio } from '@/services/audio/audioProcessing';

const demoFile = {
  uri: 'file://demo.mp3',
  name: 'demo.mp3',
  sizeBytes: 1000,
  durationSec: 25,
  extension: 'mp3',
};

jest.mock('@/services/audio/audioTrim', () => ({
  trimAudioFileIfNeeded: jest.fn(async (file: typeof demoFile) => ({
    ok: true,
    file,
    trimmed: false,
  })),
  prepareAiSourceForSts: jest.fn(async (file: typeof demoFile) => ({
    ok: true,
    mode: 'file',
    sourceUri: file.uri,
    trimmed: false,
  })),
}));

jest.mock('@/services/audio/aiEffects', () => ({
  applyAiEffect: jest.fn().mockResolvedValue({
    path: '/tmp/elevenlabs-out.mp3',
    extension: 'mp3',
  }),
}));

jest.mock('@/services/audio/aiEffects/waveSpeed/applyWaveSpeedAiEffect', () => ({
  discardAiTempFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/audio/processEffectChain', () => ({
  processEffectChain: jest.fn().mockResolvedValue({
    bytes: new Uint8Array([0, 1, 2, 3]),
    extension: 'mp3',
  }),
}));

const { processEffectChain } = jest.requireMock(
  '@/services/audio/processEffectChain',
) as { processEffectChain: jest.Mock };

const basicInput = {
  effectTier: 'basic' as const,
  effects: DEFAULT_AUDIO_EFFECTS,
};

describe('processAudio', () => {
  it('trims files longer than the processing limit before converting', async () => {
    const { trimAudioFileIfNeeded } = jest.requireMock(
      '@/services/audio/audioTrim',
    ) as { trimAudioFileIfNeeded: jest.Mock };

    trimAudioFileIfNeeded.mockResolvedValueOnce({
      ok: true,
      trimmed: true,
      file: { ...demoFile, durationSec: 30, uri: 'file://trimmed.wav' },
    });

    const result = await processAudio({
      file: { ...demoFile, durationSec: 45 },
      ...basicInput,
      presetId: 'female',
      maxDurationSec: 30,
    });

    expect(trimAudioFileIfNeeded).toHaveBeenCalled();
    expect(result.ok).toBe(true);
  });

  it('processes the source file for valid demo input', async () => {
    const result = await processAudio({
      file: demoFile,
      effectTier: 'basic',
      presetId: 'male',
      effects: getPresetEffects('male'),
      maxDurationSec: 30,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.fileName).toBe('demo-male-processed.wav');
      expect(result.result.outputUri).toContain('processed/demo-male-processed.wav');
    }
  });

  it('uses custom preset label in output filename', async () => {
    const result = await processAudio({
      file: demoFile,
      effectTier: 'basic',
      presetId: 'female',
      presetLabel: 'My Studio',
      effects: DEFAULT_AUDIO_EFFECTS,
      maxDurationSec: 30,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.fileName).toBe('demo-my-studio-processed.wav');
    }
  });

  it('processes advanced tier effects', async () => {
    const result = await processAudio({
      file: demoFile,
      effectTier: 'advanced',
      advancedEffectId: 'chipmunk',
      presetLabel: 'Chipmunk',
      maxDurationSec: 30,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.fileName).toBe('demo-chipmunk-processed.wav');
    }
  });

  it('processes ai tier effects as mp3 without local re-encode', async () => {
    const { applyAiEffect } = jest.requireMock('@/services/audio/aiEffects') as {
      applyAiEffect: jest.Mock;
    };
    applyAiEffect.mockClear();
    applyAiEffect.mockResolvedValue({
      path: '/tmp/elevenlabs-out.mp3',
      extension: 'mp3',
    });

    const result = await processAudio({
      file: demoFile,
      effectTier: 'ai',
      aiEffectId: 'narratorka',
      presetLabel: 'Narratorka',
      maxDurationSec: 30,
    });

    expect(applyAiEffect).toHaveBeenCalledWith(demoFile.uri, 'narratorka', {
      audioBase64: undefined,
      sourceExtension: undefined,
      sourceMime: undefined,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.fileName).toBe('demo-narratorka-processed.mp3');
    }
  });

  it('processes chained custom effects and keeps final extension', async () => {
    processEffectChain.mockClear();

    const result = await processAudio({
      file: demoFile,
      effectTier: 'basic',
      effectChain: [
        { tier: 'basic', presetId: 'robot' },
        { tier: 'ai', effectId: 'narratorka' },
      ],
      presetLabel: 'Robot + Narratorka',
      maxDurationSec: 30,
    });

    expect(processEffectChain).toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.fileName).toBe('demo-robot-narratorka-processed.mp3');
    }
  });

  it('returns cancelled when the abort signal is triggered', async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await processAudio(
      {
        file: demoFile,
        ...basicInput,
        presetId: 'female',
        maxDurationSec: 30,
      },
      { signal: controller.signal },
    );

    expect(result).toEqual({ ok: false, reason: 'cancelled' });
  });
});

describe('ProcessingAbortedError', () => {
  it('uses a stable error name', () => {
    expect(new ProcessingAbortedError().name).toBe('ProcessingAbortedError');
  });
});
