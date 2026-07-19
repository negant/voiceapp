import { useCallback, useMemo, useRef } from 'react';
import { LayoutChangeEvent, PanResponder, View } from 'react-native';

import type { SliderProps } from '@/components/atoms/Slider/Slider.types';
import { cn } from '@/lib/cn';

const THUMB_SIZE = 28;

export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  accessibilityLabel,
  trackLayout = 'center',
  className,
}: SliderProps) {
  const trackWidth = useRef(0);
  const trackPageX = useRef(0);
  const trackRef = useRef<View>(null);

  const clampValue = useCallback(
    (next: number) =>
      Math.max(minimumValue, Math.min(maximumValue, Math.round(next))),
    [maximumValue, minimumValue],
  );

  const measureTrack = useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      trackPageX.current = x;
      trackWidth.current = width;
    });
  }, []);

  const updateFromPageX = useCallback(
    (pageX: number) => {
      if (trackWidth.current <= 0) {
        return;
      }

      const locationX = pageX - trackPageX.current;
      const ratio = Math.max(0, Math.min(1, locationX / trackWidth.current));
      const next = minimumValue + ratio * (maximumValue - minimumValue);
      onValueChange(clampValue(next));
    },
    [clampValue, maximumValue, minimumValue, onValueChange],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: event => {
          measureTrack();
          updateFromPageX(event.nativeEvent.pageX);
        },
        onPanResponderMove: event => {
          updateFromPageX(event.nativeEvent.pageX);
        },
      }),
    [measureTrack, updateFromPageX],
  );

  const onTrackLayout = (_event: LayoutChangeEvent) => {
    measureTrack();
  };

  const range = maximumValue - minimumValue;
  const fillPercent =
    range === 0 ? 0 : ((value - minimumValue) / range) * 100;

  return (
    <View
      className={cn(
        'overflow-visible',
        trackLayout === 'start' ? 'min-h-9 justify-start' : 'min-h-11 justify-center',
        className,
      )}>
      <View
        ref={trackRef}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min: minimumValue, max: maximumValue, now: value }}
        onLayout={onTrackLayout}
        className="h-7 w-full justify-center"
        {...panResponder.panHandlers}>
        <View
          pointerEvents="none"
          className="h-1.5 w-full overflow-hidden rounded-full bg-border dark:bg-border-dark">
          <View
            className="h-full rounded-full bg-brand dark:bg-brand-dark"
            style={{ width: `${fillPercent}%` }}
          />
        </View>
        <View
          pointerEvents="none"
          className="absolute top-0 h-7 w-7 rounded-full border-2 border-brand bg-surface dark:border-brand-dark dark:bg-surface-dark"
          style={{
            left: `${fillPercent}%`,
            marginLeft: -THUMB_SIZE / 2,
          }}
        />
      </View>
    </View>
  );
}
