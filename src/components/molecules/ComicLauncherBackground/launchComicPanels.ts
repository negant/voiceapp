import type { ImageSourcePropType } from 'react-native';

import { ADVANCED_EFFECT_AVATAR_IMAGES } from '@/constants/advancedEffectAvatars';
import { AI_EFFECT_AVATAR_IMAGES } from '@/constants/aiEffectAvatars';
import { PRESET_AVATAR_IMAGES } from '@/constants/presetAvatars';
import type { VoicePresetId } from '@/types/voiceStudio';

export type LaunchComicPresetId =
  | Extract<VoicePresetId, 'female' | 'male' | 'robot'>
  | 'femaleVoice'
  | 'legionista';

export type LaunchComicPanel = {
  id: string;
  presetId: LaunchComicPresetId;
  /** Polygon vertices in launcher viewBox coordinates (100×200). */
  points: string;
  image: ImageSourcePropType;
  /** Extra scale so cover-crop fills skewed panels without empty corners. */
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
};

/** Five angled comic panels — order matches reading flow on the launcher. */
export const LAUNCH_COMIC_PANELS: LaunchComicPanel[] = [
  {
    id: 'female',
    presetId: 'female',
    points: '0,0 70,0 62,88 0,95',
    image: PRESET_AVATAR_IMAGES.female,
    imageScale: 1.28,
    imageOffsetY: -4,
  },
  {
    id: 'male',
    presetId: 'male',
    points: '70,0 100,0 100,45 82,88 62,88',
    image: PRESET_AVATAR_IMAGES.male,
    imageScale: 1.22,
  },
  {
    id: 'robot',
    presetId: 'robot',
    points: '82,88 100,45 100,95 65,115 62,88',
    image: PRESET_AVATAR_IMAGES.robot,
    imageScale: 1.18,
    imageOffsetX: 2,
  },
  {
    id: 'femaleVoice',
    presetId: 'femaleVoice',
    points: '0,95 62,88 65,115 58,142 0,150',
    image: ADVANCED_EFFECT_AVATAR_IMAGES.femaleVoice,
    imageScale: 1.24,
    imageOffsetY: 3,
  },
  {
    id: 'legionista',
    presetId: 'legionista',
    points: '0,150 58,142 65,115 100,95 100,200 0,200',
    image: AI_EFFECT_AVATAR_IMAGES.legionista,
    imageScale: 1.32,
    imageOffsetY: 8,
  },
];

export type PanelBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

/** Bounding box for placing a cover-cropped image inside a clipped panel. */
export function getPanelBounds(points: string): PanelBounds {
  const pairs = points.trim().split(/\s+/);
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const pair of pairs) {
    const [xRaw, yRaw] = pair.split(',');
    const x = Number(xRaw);
    const y = Number(yRaw);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: minX + width / 2,
    centerY: minY + height / 2,
  };
}
