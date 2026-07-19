import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedLogo } from '@/components/atoms/Logo';
import {
  ComicLauncherBackground,
  COMIC_PAPER,
} from '@/components/molecules/ComicLauncherBackground';
import type { LaunchScreenProps } from '@/components/organisms/LaunchScreen/LaunchScreen.types';
import {
  canCompleteLaunch,
  LAUNCH_FADE_OUT_MS,
  LAUNCH_MIN_DURATION_MS,
} from '@/config/launch';
import { useTranslation } from '@/hooks/useTranslation';

const AnimatedView = Animated.createAnimatedComponent(View);

const styles = StyleSheet.create({
  root: {
    backgroundColor: COMIC_PAPER,
  },
  title: {
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
});

export function LaunchScreen({ isAppReady, onFinish }: LaunchScreenProps) {
  const { t } = useTranslation();
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDurationElapsed(true);
    }, LAUNCH_MIN_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canCompleteLaunch(isAppReady, minDurationElapsed) || isExiting) {
      return;
    }

    setIsExiting(true);
    screenOpacity.value = withTiming(
      0,
      { duration: LAUNCH_FADE_OUT_MS },
      finished => {
        if (finished) {
          runOnJS(onFinish)();
        }
      },
    );
  }, [isAppReady, isExiting, minDurationElapsed, onFinish, screenOpacity]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <AnimatedView style={[screenStyle, styles.root]} className="flex-1">
      <ComicLauncherBackground className="absolute inset-0" />
      <View
        pointerEvents="none"
        className="absolute inset-0 items-center justify-center">
        <View className="h-[42%] w-[88%] rounded-full bg-white/60 dark:bg-black/55" />
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <AnimatedLogo size={120} variant="mark" />
        <Text className="mt-6 text-2xl font-semibold text-white" style={styles.title}>
          {t('nav.home')}
        </Text>
      </View>
    </AnimatedView>
  );
}
