import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import type { AdvancedEffectId } from '@/types/voiceStudio';

type AdvancedEffectIconProps = {
  effectId: AdvancedEffectId;
  size?: number;
};

/** Distinct SVG icons for advanced tier — hexagonal badge with gradient accents. */
export function AdvancedEffectIcon({
  effectId,
  size = 72,
}: AdvancedEffectIconProps) {
  if (effectId === 'commander') {
    return (
      <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
        <Defs>
          <LinearGradient id="commanderBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7F1D1D" />
            <Stop offset="0.5" stopColor="#B91C1C" />
            <Stop offset="1" stopColor="#450A0A" />
          </LinearGradient>
          <LinearGradient id="commanderMark" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FCA5A5" />
            <Stop offset="1" stopColor="#EF4444" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="4" width="64" height="64" rx="18" fill="url(#commanderBg)" />
        <Path
          d="M36 14 L44 28 L60 30 L48 40 L52 56 L36 48 L20 56 L24 40 L12 30 L28 28 Z"
          fill="url(#commanderMark)"
          opacity="0.92"
        />
        <Path
          d="M20 52 C26 44, 30 50, 36 46 C42 42, 46 48, 52 42"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </Svg>
    );
  }

  if (effectId === 'hall') {
    return (
      <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
        <Defs>
          <LinearGradient id="hallBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#4C1D95" />
            <Stop offset="0.5" stopColor="#6D28D9" />
            <Stop offset="1" stopColor="#312E81" />
          </LinearGradient>
          <LinearGradient id="hallWave" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#C4B5FD" />
            <Stop offset="1" stopColor="#A78BFA" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="4" width="64" height="64" rx="18" fill="url(#hallBg)" />
        <Path
          d="M12 40 C20 28, 28 52, 36 36 C44 20, 52 44, 60 32"
          stroke="url(#hallWave)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <Path
          d="M16 48 C24 38, 32 54, 40 42 C48 30, 56 46, 64 38"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        <Path
          d="M24 18 L36 12 L48 18 L48 30 C48 38, 42 44, 36 44 C30 44, 24 38, 24 30 Z"
          fill="#FFFFFF"
          opacity="0.2"
        />
      </Svg>
    );
  }

  if (effectId === 'warrior') {
    return (
      <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
        <Defs>
          <LinearGradient id="warriorBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#450A0A" />
            <Stop offset="0.5" stopColor="#991B1B" />
            <Stop offset="1" stopColor="#1C1917" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="4" width="64" height="64" rx="18" fill="url(#warriorBg)" />
        <Path
          d="M36 16 L48 30 L44 48 L36 56 L28 48 L24 30 Z"
          fill="#FCA5A5"
          opacity="0.85"
        />
        <Path
          d="M22 50 C28 42, 32 48, 36 44 C40 40, 44 46, 50 40"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </Svg>
    );
  }

  if (effectId === 'femaleVoice') {
    return (
      <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
        <Defs>
          <LinearGradient id="femaleVoiceBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#F59E0B" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="4" width="64" height="64" rx="18" fill="url(#femaleVoiceBg)" />
        <Path
          d="M36 20 C28 20, 24 28, 24 36 C24 48, 30 54, 36 54 C42 54, 48 48, 48 36 C48 28, 44 20, 36 20 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <Path
          d="M30 58 C32 52, 40 52, 42 58"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  }

  if (effectId === 'maleVoice') {
    return (
      <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
        <Defs>
          <LinearGradient id="maleVoiceBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#38BDF8" />
            <Stop offset="1" stopColor="#0EA5E9" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="4" width="64" height="64" rx="18" fill="url(#maleVoiceBg)" />
        <Path
          d="M36 18 C26 18, 22 28, 22 38 C22 50, 28 56, 36 56 C44 56, 50 50, 50 38 C50 28, 46 18, 36 18 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <Path
          d="M28 24 L44 24"
          stroke="#0EA5E9"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (effectId === 'android') {
    return (
      <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
        <Defs>
          <LinearGradient id="androidBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#34D399" />
            <Stop offset="1" stopColor="#059669" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="4" width="64" height="64" rx="18" fill="url(#androidBg)" />
        <Path
          d="M36 18 C28 18, 22 26, 22 34 C22 42, 26 48, 36 50 C46 48, 50 42, 50 34 C50 26, 44 18, 36 18 Z"
          fill="#FFFFFF"
          opacity="0.92"
        />
        <Path
          d="M30 30 C30 28, 32 26, 34 28 C36 30, 38 28, 40 30"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M28 56 L44 56" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </Svg>
    );
  }

  if (effectId === 'chipmunk') {
    return (
      <Svg width={size} height={size} viewBox="0 0 72 72" accessibilityRole="image">
        <Defs>
          <LinearGradient id="chipmunkBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FBBF24" />
            <Stop offset="1" stopColor="#F97316" />
          </LinearGradient>
        </Defs>
        <Rect x="4" y="4" width="64" height="64" rx="18" fill="url(#chipmunkBg)" />
        <Path
          d="M16 46 C22 28, 30 54, 36 34 C42 16, 50 50, 56 30"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M22 22 C26 14, 34 14, 36 22 C38 14, 46 14, 50 22 C48 30, 36 34, 36 34 C36 34, 24 30, 22 22 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </Svg>
    );
  }

  return null;
}
