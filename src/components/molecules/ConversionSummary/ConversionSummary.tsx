import { Text, View } from 'react-native';

import type { ConversionSummaryProps } from '@/components/molecules/ConversionSummary/ConversionSummary.types';
import { DEFAULT_MAX_AUDIO_DURATION_FREE_SEC } from '@/constants/audioDurationDefaults';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function ConversionSummary({
  effectName,
  mode,
  aiMaxDurationSec,
  affordableAiSeconds,
  billableSeconds,
  creditCost,
  isPremium = false,
  className,
}: ConversionSummaryProps) {
  const { t } = useTranslation();

  const cloudKey =
    mode === 'mixed'
      ? isPremium
        ? 'voiceStudio.convertSummaryModeMixedPremium'
        : 'voiceStudio.convertSummaryModeMixed'
      : isPremium
        ? 'voiceStudio.convertSummaryModeCloudPremium'
        : 'voiceStudio.convertSummaryModeCloud';

  const modeParams =
    mode === 'cloud' || mode === 'mixed'
      ? isPremium
        ? { seconds: affordableAiSeconds ?? 0 }
        : { aiSeconds: aiMaxDurationSec ?? DEFAULT_MAX_AUDIO_DURATION_FREE_SEC }
      : undefined;

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
      <Text className="mt-1 text-xs leading-5 text-foreground-muted dark:text-foreground-muted-dark">
        {t(
          mode === 'local' ? 'voiceStudio.convertSummaryModeLocal' : cloudKey,
          modeParams,
        )}
      </Text>
      {(mode === 'cloud' || mode === 'mixed') &&
      creditCost !== undefined &&
      billableSeconds !== undefined ? (
        <Text className="mt-1 text-xs leading-5 text-foreground-muted dark:text-foreground-muted-dark">
          {t('voiceStudio.convertSummaryCredits', {
            cost: creditCost,
            billableMinutes:
              billableSeconds > 0 ? Math.ceil(billableSeconds / 60) : 0,
          })}
        </Text>
      ) : null}
    </View>
  );
}
