import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';

import { useTranslation } from '@/hooks/useTranslation';

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/** Isolated timer so parent modal does not re-render every tick. */
export function ProcessingElapsedTimer({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const startedAtRef = useRef<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!visible) {
      startedAtRef.current = null;
      setElapsedSec(0);
      return;
    }

    startedAtRef.current = Date.now();

    const updateElapsed = () => {
      if (startedAtRef.current === null) {
        return;
      }
      setElapsedSec(
        Math.floor((Date.now() - startedAtRef.current) / 1000),
      );
    };

    updateElapsed();
    // Whole-second display — 1 Hz updates keep the JS thread free for cancel taps.
    const intervalId = setInterval(updateElapsed, 1000);

    return () => clearInterval(intervalId);
  }, [visible]);

  return (
    <Text className="text-xs text-foreground-muted dark:text-foreground-muted-dark">
      {t('voiceStudio.processingElapsed', {
        time: formatElapsed(elapsedSec),
      })}
    </Text>
  );
}
