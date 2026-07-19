import { MALE_VOICE_EFFECT } from './maleVoiceEffect';

describe('MALE_VOICE_EFFECT', () => {
  it('deepens pitch with STFT formant shift and chest EQ via the shared advanced filter chain', () => {
    expect(MALE_VOICE_EFFECT.id).toBe('maleVoice');
    expect(MALE_VOICE_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 0.86 }),
    );
    expect(MALE_VOICE_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'formant_shift', factor: 0.87 }),
    );
    expect(MALE_VOICE_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'lowshelf', frequencyHz: 190, gainDb: 4.5 }),
    );
  });
});
