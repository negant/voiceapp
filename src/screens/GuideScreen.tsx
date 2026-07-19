import { Text, View } from 'react-native';

import { FaqSection, Screen } from '@/components';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useSupportedFormatsLabel } from '@/hooks/useSupportedFormatsLabel';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootStackScreenProps } from '@/navigation/types';

const STEP_KEYS = [
  'guide.step1',
  'guide.step2',
  'guide.step3',
  'guide.step4',
] as const;

export function GuideScreen(_props: RootStackScreenProps<'Guide'>) {
  const { t } = useTranslation();
  const supportedFormatsLabel = useSupportedFormatsLabel();
  useScreenTitle('nav.guide');

  return (
    <Screen scrollable>
      <Text className="mb-4 mt-2 text-sm leading-6 text-foreground-muted dark:text-foreground-muted-dark">
        {t('guide.intro')}
      </Text>

      <Text className="mb-3 text-lg font-semibold text-foreground dark:text-foreground-dark">
        {t('guide.stepsTitle')}
      </Text>

      {STEP_KEYS.map((key, index) => (
        <View
          key={key}
          className="mb-4 rounded-2xl border border-border bg-surface p-4 dark:border-border-dark dark:bg-surface-dark">
          <Text className="mb-2 text-base font-semibold text-foreground dark:text-foreground-dark">
            {t('guide.stepLabel', { number: index + 1 })}
          </Text>
          <Text className="text-sm leading-6 text-foreground-muted dark:text-foreground-muted-dark">
            {t(
              key,
              key === 'guide.step1'
                ? { formats: supportedFormatsLabel }
                : undefined,
            )}
          </Text>
        </View>
      ))}

      <FaqSection className="mt-2" />
    </Screen>
  );
}
