import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
  G,
} from 'react-native-svg';

import { buildWaveform } from '@/components/atoms/Logo/logoWaveform';
import type { LogoProps } from '@/components/atoms/Logo/Logo.types';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

/** App logo: symmetric waveform inside a rounded square (`mark` = icon with gradient). */
export function Logo({ size = 96, variant = 'mark', className }: LogoProps) {
  const { isDark } = useTheme();

  const gradient = useMemo(
    () =>
      isDark
        ? { from: '#6366F1', to: '#4338CA' }
        : { from: '#6366F1', to: '#4F46E5' },
    [isDark],
  );

  const waveColor = variant === 'mark' ? '#FFFFFF' : gradient.to;
  const radius = size * 0.22;
  const bars = useMemo(() => buildWaveform(size), [size]);

  return (
    <View className={cn(className)}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {variant === 'mark' && (
          <Defs>
            <LinearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradient.from} />
              <Stop offset="1" stopColor={gradient.to} />
            </LinearGradient>
          </Defs>
        )}

        {variant === 'mark' && (
          <Rect
            x={0}
            y={0}
            width={size}
            height={size}
            rx={radius}
            ry={radius}
            fill="url(#logoBg)"
          />
        )}

        <G>
          {bars.map(bar => (
            <Rect
              key={bar.key}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx={bar.width / 2}
              ry={bar.width / 2}
              fill={waveColor}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
