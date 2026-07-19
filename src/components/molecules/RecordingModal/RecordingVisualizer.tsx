import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { RecordingVisualizerProps } from '@/components/molecules/RecordingModal/RecordingVisualizer.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

const CONTROL_BUTTON_SIZE = 96;
const RING_BASE_SIZE = 120;

type PulseRingProps = {
  level: SharedValue<number>;
  breath: SharedValue<number>;
  offset: number;
  color: string;
};

function PulseRing({ level, breath, offset, color }: PulseRingProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const voiceBoost = level.value * (0.28 - offset * 0.06);
    const breathBoost = breath.value * 0.06 * (1 - level.value * 0.65);
    const scale = 1 + voiceBoost + breathBoost;

    return {
      transform: [{ scale }],
      opacity: 0.18 + level.value * 0.42 - offset * 0.04,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: RING_BASE_SIZE + offset * 28,
          height: RING_BASE_SIZE + offset * 28,
          borderRadius: (RING_BASE_SIZE + offset * 28) / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function RecordingVisualizer({
  isRecording,
  recordingLevel,
  onStart,
  onStop,
}: RecordingVisualizerProps) {
  const { t } = useTranslation();
  const level = useSharedValue(0);
  const breath = useSharedValue(0);

  const recordColor = '#EF4444';

  useEffect(() => {
    level.value = withTiming(recordingLevel, { duration: 90 });
  }, [level, recordingLevel]);

  useEffect(() => {
    if (!isRecording) {
      cancelAnimation(breath);
      breath.value = 0;
      level.value = withTiming(0, { duration: 150 });
      return;
    }

    breath.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(breath);
    };
  }, [breath, isRecording, level]);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    if (!isRecording) {
      return { transform: [{ scale: 1 }] };
    }

    return {
      transform: [{ scale: 1 + level.value * 0.08 + breath.value * 0.03 }],
    };
  });

  return (
    <View className="items-center py-2">
      <View
        className="items-center justify-center"
        style={{ width: 200, height: 200 }}>
        {isRecording ? (
          <>
            <PulseRing level={level} breath={breath} offset={2} color={recordColor} />
            <PulseRing level={level} breath={breath} offset={1} color={recordColor} />
            <PulseRing level={level} breath={breath} offset={0} color={recordColor} />
          </>
        ) : null}

        <Animated.View style={buttonAnimatedStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isRecording
                ? t('voiceStudio.recordingStop')
                : t('voiceStudio.recordingStart')
            }
            onPress={isRecording ? onStop : onStart}
            className={cn(
              'items-center justify-center rounded-full',
              isRecording ? 'bg-red-500' : 'bg-brand dark:bg-brand-dark',
            )}
            style={{ width: CONTROL_BUTTON_SIZE, height: CONTROL_BUTTON_SIZE }}>
            {isRecording ? (
              <Square size={34} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
            ) : (
              <Mic size={44} color="#FFFFFF" strokeWidth={2.2} />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
