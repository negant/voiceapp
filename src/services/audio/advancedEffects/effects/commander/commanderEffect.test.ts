import { COMMANDER_EFFECT } from './commanderEffect';

describe('COMMANDER_EFFECT', () => {
  it('cleans noise, slows delivery and adds gritty resonant echo', () => {
    expect(COMMANDER_EFFECT.id).toBe('commander');
    expect(COMMANDER_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'tempo_shift', factor: 0.85 }),
    );
    expect(COMMANDER_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'resonant_echo', mix: 0.34, grit: 0.22 }),
    );
    expect(COMMANDER_EFFECT.filters.at(-1)).toEqual(
      expect.objectContaining({ type: 'gain', linear: 0.76 }),
    );
  });
});
