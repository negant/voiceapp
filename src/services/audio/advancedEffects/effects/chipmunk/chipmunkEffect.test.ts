import { CHIPMUNK_EFFECT } from './chipmunkEffect';

describe('CHIPMUNK_EFFECT', () => {
  it('defines a strong pitch-up filter chain', () => {
    expect(CHIPMUNK_EFFECT.id).toBe('chipmunk');
    expect(CHIPMUNK_EFFECT.filters).toEqual([
      expect.objectContaining({ type: 'pitch_shift', factor: 1.55 }),
    ]);
    expect(CHIPMUNK_EFFECT.ffmpegReference).toContain('asetrate');
  });
});
