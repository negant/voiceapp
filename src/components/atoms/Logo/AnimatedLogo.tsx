import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  G,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { AnimatedLogoProps } from '@/components/atoms/Logo/AnimatedLogo.types';
import {
  buildWaveform,
  getLogoMetrics,
  LOGO_BAR_HEIGHT_RATIOS,
} from '@/components/atoms/Logo/logoWaveform';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const WAVE_CYCLE_MS = 1_050;

type LogoWaveBarProps = {
  barIndex: number;
  barWidth: number;
  center: number;
  maxBarHeight: number;
  phase: SharedValue<number>;
  waveColor: string;
  x: number;
  baseRatio: number;
};

/** One waveform bar driven by a shared phase — cheap playback illusion on the launcher only. */
function LogoWaveBar({
  barIndex,
  barWidth,
  center,
  maxBarHeight,
  phase,
  waveColor,
  x,
  baseRatio,
}: LogoWaveBarProps) {
  const animatedProps = useAnimatedProps(() => {
    const wobble = 0.56 + 0.44 * Math.sin(phase.value + barIndex * 0.82);
    const height = Math.max(barWidth, maxBarHeight * baseRatio * wobble);

    return {
      height,
      y: center - height / 2,
    };
  });

  return (
    <AnimatedRect
      animatedProps={animatedProps}
      x={x}
      width={barWidth}
      rx={barWidth / 2}
      ry={barWidth / 2}
      fill={waveColor}
    />
  );
}

/** Launcher-only logo with a light waveform pulse (single Reanimated shared value). */
export function AnimatedLogo({
  size = 96,
  variant = 'mark',
  className,
}: AnimatedLogoProps) {
  const { isDark } = useTheme();
  const phase = useSharedValue(0);

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
  const { barWidth, center, maxBarHeight } = useMemo(
    () => getLogoMetrics(size),
    [size],
  );

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: WAVE_CYCLE_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(phase);
    };
  }, [phase]);

  return (
    <View className={cn(className)}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {variant === 'mark' && (
          <Defs>
            <LinearGradient id="animatedLogoBg" x1="0" y1="0" x2="1" y2="1">
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
            fill="url(#animatedLogoBg)"
          />
        )}

        <G>
          {bars.map((bar, index) => (
            <LogoWaveBar
              key={bar.key}
              barIndex={index}
              barWidth={barWidth}
              center={center}
              maxBarHeight={maxBarHeight}
              phase={phase}
              waveColor={waveColor}
              x={bar.x}
              baseRatio={LOGO_BAR_HEIGHT_RATIOS[index] ?? 0.5}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
