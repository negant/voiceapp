import { isAiEffectsConfigured } from '@/config/env';
import type { AiEffect, AiEffectId } from '@/types/voiceStudio';

/** All AI effects require a configured cloud AI provider. */
export const CLOUD_AI_EFFECT_IDS: ReadonlySet<AiEffectId> = new Set([
  'narrator',
  'narratorka',
  'legionista',
  'demonMale',
  'frenchFemale',
  'matureMale',
  'femaleSensual',
]);

const AI_EFFECT_CATALOG: AiEffect[] = [
  {
    id: 'narratorka',
    labelKey: 'voiceStudio.aiEffectItems.narratorka',
    descriptionKey: 'voiceStudio.aiEffectItems.narratorkaDescription',
    accentColor: '#4F46E5',
    iconKey: 'narratorka',
    avatarImageKey: 'narratorka',
  },
  {
    id: 'narrator',
    labelKey: 'voiceStudio.aiEffectItems.narrator',
    descriptionKey: 'voiceStudio.aiEffectItems.narratorDescription',
    accentColor: '#0D9488',
    iconKey: 'narrator',
    avatarImageKey: 'narrator',
  },
  {
    id: 'legionista',
    labelKey: 'voiceStudio.aiEffectItems.legionista',
    descriptionKey: 'voiceStudio.aiEffectItems.legionistaDescription',
    accentColor: '#B91C1C',
    iconKey: 'legionista',
    avatarImageKey: 'legionista',
  },
  {
    id: 'demonMale',
    labelKey: 'voiceStudio.aiEffectItems.demonMale',
    descriptionKey: 'voiceStudio.aiEffectItems.demonMaleDescription',
    accentColor: '#9F1239',
    iconKey: 'demonMale',
    avatarImageKey: 'demonMale',
  },
  {
    id: 'frenchFemale',
    labelKey: 'voiceStudio.aiEffectItems.frenchFemale',
    descriptionKey: 'voiceStudio.aiEffectItems.frenchFemaleDescription',
    accentColor: '#DB2777',
    iconKey: 'frenchFemale',
    avatarImageKey: 'frenchFemale',
  },
  {
    id: 'matureMale',
    labelKey: 'voiceStudio.aiEffectItems.matureMale',
    descriptionKey: 'voiceStudio.aiEffectItems.matureMaleDescription',
    accentColor: '#B45309',
    iconKey: 'matureMale',
    avatarImageKey: 'matureMale',
  },
  {
    id: 'femaleSensual',
    labelKey: 'voiceStudio.aiEffectItems.femaleSensual',
    descriptionKey: 'voiceStudio.aiEffectItems.femaleSensualDescription',
    accentColor: '#A855F7',
    iconKey: 'femaleSensual',
    avatarImageKey: 'femaleSensual',
  },
];

export function isAiEffectProviderConfigured(effectId: AiEffectId): boolean {
  return CLOUD_AI_EFFECT_IDS.has(effectId) && isAiEffectsConfigured();
}

/** AI effects shown when cloud AI is configured. */
export const AI_EFFECTS: AiEffect[] = isAiEffectsConfigured()
  ? AI_EFFECT_CATALOG
  : [];

export function findAiEffect(effectId: AiEffectId): AiEffect | undefined {
  return AI_EFFECT_CATALOG.find(effect => effect.id === effectId);
}
