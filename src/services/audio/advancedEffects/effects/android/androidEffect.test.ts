import { ANDROID_EFFECT, ANDROID_MICRO_TAPS } from './androidEffect';

describe('ANDROID_EFFECT', () => {
  it('defines a dry synthetic TTS assistant chain', () => {
    expect(ANDROID_EFFECT.id).toBe('android');
    expect(ANDROID_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'formant_shift', factor: 1.1 }),
    );
    expect(ANDROID_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'equalizer', frequencyHz: 2_450, gainDb: 9 }),
    );
    expect(ANDROID_EFFECT.filters).toContainEqual(
      expect.objectContaining({
        type: 'resonant_echo',
        mix: 0.1,
        taps: [...ANDROID_MICRO_TAPS],
      }),
    );
    expect(ANDROID_EFFECT.filters.at(-1)).toEqual(
      expect.objectContaining({ type: 'gain', linear: 0.78 }),
    );
  });
});
