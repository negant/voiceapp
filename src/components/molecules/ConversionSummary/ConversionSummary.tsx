import { Text, View } from 'react-native';

import { AiServiceStatusBadge } from '@/components/atoms/AiServiceStatusBadge';
import type { ConversionSummaryProps } from '@/components/molecules/ConversionSummary/ConversionSummary.types';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';
import { useAiServiceStatus } from '@/providers/AiServiceStatusProvider';
import type { AiServiceStatusSeverity } from '@/services/aiServiceStatus';

function cloudStatusBadgeKey(
  severity: AiServiceStatusSeverity,
): TranslationKey {
  switch (severity) {
    case 'ok':
      return 'voiceStudio.aiServiceStatusBadgeOperational';
    case 'degraded':
      return 'voiceStudio.aiServiceStatusBadgeMaintenance';
    case 'outage':
      return 'voiceStudio.aiServiceStatusBadgeIssues';
    case 'unknown':
    default:
      return 'voiceStudio.aiServiceStatusBadgeUnknown';
  }
}

export function ConversionSummary({
  effectName,
  mode,
  creditCost,
  className,
}: ConversionSummaryProps) {
  const { t } = useTranslation();
  const { status, isChecking } = useAiServiceStatus();
  const showCloudStatus = mode === 'cloud' || mode === 'mixed';
  const showCredits = showCloudStatus && creditCost !== undefined;

  const statusSeverity = status?.severity ?? 'unknown';
  const statusColor = isChecking ? 'gray' : (status?.color ?? 'gray');
  const statusLabel = isChecking
    ? t('voiceStudio.aiServiceStatusBadgeChecking')
    : t(cloudStatusBadgeKey(statusSeverity));

  return (
    <View
      className={cn(
        'mb-2 rounded-xl border border-border bg-surface px-3 py-2.5 dark:border-border-dark dark:bg-surface-dark',
        className,
      )}>
      <Text className="text-xs font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
        {t('voiceStudio.convertSummaryTitle')}
      </Text>
      <View className="mt-1 flex-row items-center justify-between gap-2">
        <Text className="mr-2 flex-1 text-sm font-medium text-foreground dark:text-foreground-dark">
          {t('voiceStudio.convertSummaryEffect', { name: effectName })}
        </Text>
        {showCloudStatus ? (
          <AiServiceStatusBadge color={statusColor} label={statusLabel} />
        ) : null}
      </View>
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
