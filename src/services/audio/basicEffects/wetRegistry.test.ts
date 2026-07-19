import { WET_PRESET_REGISTRY } from '@/services/audio/basicEffects/wetRegistry';
import { resolveWetPresetVoice } from '@/services/audio/basicEffects/shared/resolveWetPreset';

describe('WET_PRESET_REGISTRY', () => {
  it('registers demon, telephone, leader and alien wet chains', () => {
    expect(WET_PRESET_REGISTRY.demon.id).toBe('demon');
    expect(WET_PRESET_REGISTRY.telephone.id).toBe('telephone');
    expect(WET_PRESET_REGISTRY.leader.id).toBe('leader');
    expect(WET_PRESET_REGISTRY.alien.id).toBe('alien');
  });
});

describe('resolveWetPresetVoice', () => {
  it('maps new basic presets to wet voices', () => {
    expect(resolveWetPresetVoice('demon')).toBe('demon');
    expect(resolveWetPresetVoice('telephone')).toBe('telephone');
    expect(resolveWetPresetVoice('leader')).toBe('leader');
    expect(resolveWetPresetVoice('alien')).toBe('alien');
    expect(resolveWetPresetVoice('female')).toBe('default');
  });
});
