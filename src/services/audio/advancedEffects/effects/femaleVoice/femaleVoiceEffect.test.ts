import { FEMALE_VOICE_EFFECT } from './femaleVoiceEffect';

describe('FEMALE_VOICE_EFFECT', () => {
  it('lifts pitch with STFT formant shift and bright EQ via the shared advanced filter chain', () => {
    expect(FEMALE_VOICE_EFFECT.id).toBe('femaleVoice');
    expect(FEMALE_VOICE_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 1.14 }),
    );
    expect(FEMALE_VOICE_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'formant_shift', factor: 1.12 }),
    );
    expect(FEMALE_VOICE_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'equalizer', frequencyHz: 2_350, gainDb: 6.5 }),
    );
  });
});
