import { Text, View } from 'react-native';

import type { ConversionSummaryProps } from '@/components/molecules/ConversionSummary/ConversionSummary.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function ConversionSummary({
  effectName,
  mode,
  creditCost,
  className,
}: ConversionSummaryProps) {
  const { t } = useTranslation();
  const showCredits =
    (mode === 'cloud' || mode === 'mixed') && creditCost !== undefined;

  return (
    <View
      className={cn(
        'mb-2 rounded-xl border border-border bg-surface px-3 py-2.5 dark:border-border-dark dark:bg-surface-dark',
        className,
      )}>
      <Text className="text-xs font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
        {t('voiceStudio.convertSummaryTitle')}
      </Text>
      <Text className="mt-1 text-sm font-medium text-foreground dark:text-foreground-dark">
        {t('voiceStudio.convertSummaryEffect', { name: effectName })}
      </Text>
      {mode === 'local' ? (
        <Text className="mt-1 text-xs leading-5 text-foreground-muted dark:text-foreground-muted-dark">
          {t('voiceStudio.convertSummaryModeLocal')}
        </Text>
      ) : null}
      {showCredits ? (
        <Text className="mt-1 text-xs leading-5 text-foreground-muted dark:text-foreground-muted-dark">
          {t('voiceStudio.convertSummaryCredits', { cost: creditCost })}
        </Text>
      ) : null}
    </View>
  );
}
