jest.mock('@/config/env', () => ({
  isAiEffectsConfigured: jest.fn(() => true),
}));

import {
  AI_EFFECTS,
  CLOUD_AI_EFFECT_IDS,
  findAiEffect,
} from '@/constants/aiEffects';
import { isAiEffectsConfigured } from '@/config/env';

describe('aiEffects catalog', () => {
  it('exposes AI voices when cloud AI is configured', () => {
    expect(isAiEffectsConfigured()).toBe(true);
    expect(AI_EFFECTS.map(effect => effect.id).sort()).toEqual([
      'legionista',
      'narrator',
      'narratorka',
    ]);
    expect(CLOUD_AI_EFFECT_IDS.size).toBe(3);
  });

  it('resolves effects for labels and avatars', () => {
    expect(findAiEffect('narratorka')?.avatarImageKey).toBe('narratorka');
    expect(findAiEffect('narrator')?.accentColor).toBe('#0D9488');
    expect(findAiEffect('legionista')?.id).toBe('legionista');
  });
});
