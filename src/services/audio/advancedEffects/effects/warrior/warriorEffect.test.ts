import { WARRIOR_EFFECT } from './warriorEffect';

describe('WARRIOR_EFFECT', () => {
  it('targets a deep hoarse game-warrior chain with gritty echo', () => {
    expect(WARRIOR_EFFECT.id).toBe('warrior');
    expect(WARRIOR_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'pitch_shift', factor: 0.76 }),
    );
    expect(WARRIOR_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'resonant_echo', mix: 0.36, grit: 0.32 }),
    );
    expect(WARRIOR_EFFECT.filters).toContainEqual(
      expect.objectContaining({ type: 'waveshaper', amount: 0.38 }),
    );
  });
});
