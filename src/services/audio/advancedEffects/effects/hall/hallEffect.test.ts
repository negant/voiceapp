import { HALL_EFFECT } from './hallEffect';

describe('HALL_EFFECT', () => {
  it('mirrors commander timbre with a much wetter multi-tap hall echo', () => {
    expect(HALL_EFFECT.id).toBe('hall');
    expect(HALL_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'tempo_shift', factor: 0.85 }),
    );
    expect(HALL_EFFECT.filters).toContainEqual(
      expect.objectContaining({
        type: 'resonant_echo',
        mix: 0.72,
        grit: 0.14,
        taps: expect.arrayContaining([
          expect.objectContaining({ delaySec: 0.35, gain: 0.32 }),
          expect.objectContaining({ delaySec: 1.1, gain: 0.18 }),
        ]),
      }),
    );
    expect(HALL_EFFECT.filters.at(-1)).toEqual(
      expect.objectContaining({ type: 'gain', linear: 0.68 }),
    );
  });
});
