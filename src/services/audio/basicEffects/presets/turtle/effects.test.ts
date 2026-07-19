import { TURTLE_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/turtle/effects';
import { CHEETAH_PRESET_EFFECTS } from '@/services/audio/basicEffects/presets/cheetah/effects';

describe('turtle preset effects', () => {
  it('targets slow tempo and lower pitch', () => {
    expect(TURTLE_PRESET_EFFECTS.tempo).toBeLessThan(20);
    expect(TURTLE_PRESET_EFFECTS.pitch).toBeLessThan(45);
    expect(TURTLE_PRESET_EFFECTS.echo).toBe(50);
  });
});

describe('cheetah preset effects', () => {
  it('targets fast tempo and higher pitch', () => {
    expect(CHEETAH_PRESET_EFFECTS.tempo).toBeGreaterThan(80);
    expect(CHEETAH_PRESET_EFFECTS.pitch).toBeGreaterThan(55);
    expect(CHEETAH_PRESET_EFFECTS.echo).toBe(50);
  });
});
