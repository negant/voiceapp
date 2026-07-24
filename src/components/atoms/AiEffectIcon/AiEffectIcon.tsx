import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import type { AiEffectId } from '@/types/voiceStudio';

type AiEffectIconProps = {
  effectId: AiEffectId;
  size?: number;
};

function BadgeIcon({
  size,
  colors,
  glyph,
}: {
  size: number;
  colors: [string, string, string];
  glyph: 'person' | 'star';
}) {
  const gid = `aiBadge-${colors[1].replace('#', '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="0.5" stopColor={colors[1]} />
          <Stop offset="1" stopColor={colors[2]} />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="64" height="64" rx="18" fill={`url(#${gid})`} />
      {glyph === 'star' ? (
        <Path
          d="M36 18 L44 30 L58 32 L48 42 L50 56 L36 50 L22 56 L24 42 L14 32 L28 30 Z"
          fill="#FEE2E2"
          opacity="0.9"
        />
      ) : (
        <>
          <Circle cx="36" cy="28" r="10" fill="#E0E7FF" opacity="0.95" />
          <Path
            d="M24 52 C28 44, 32 48, 36 44 C40 40, 44 44, 48 52"
            stroke="#C7D2FE"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
}

/** SVG badges for AI tier effects (fallback when PNG avatar is missing). */
export function AiEffectIcon({ effectId, size = 72 }: AiEffectIconProps) {
  switch (effectId) {
    case 'legionista':
      return (
        <BadgeIcon
          size={size}
          colors={['#7F1D1D', '#B91C1C', '#450A0A']}
          glyph="star"
        />
      );
    case 'demonMale':
      return (
        <BadgeIcon
          size={size}
          colors={['#881337', '#9F1239', '#4C0519']}
          glyph="star"
        />
      );
    case 'frenchFemale':
      return (
        <BadgeIcon
          size={size}
          colors={['#9D174D', '#DB2777', '#500724']}
          glyph="person"
        />
      );
    case 'femaleSensual':
      return (
        <BadgeIcon
          size={size}
          colors={['#6B21A8', '#A855F7', '#3B0764']}
          glyph="person"
        />
      );
    case 'matureMale':
      return (
        <BadgeIcon
          size={size}
          colors={['#92400E', '#B45309', '#451A03']}
          glyph="person"
        />
      );
    case 'narrator':
      return (
        <BadgeIcon
          size={size}
          colors={['#115E59', '#0D9488', '#042F2E']}
          glyph="person"
        />
      );
    case 'narratorka':
    default:
      return (
        <BadgeIcon
          size={size}
          colors={['#312E81', '#4F46E5', '#1E1B4B']}
          glyph="person"
        />
      );
  }
}
