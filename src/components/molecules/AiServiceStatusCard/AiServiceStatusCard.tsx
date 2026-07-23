import { Text, View } from 'react-native';

import { AiServiceStatusBadge } from '@/components/atoms/AiServiceStatusBadge';
import type { AiServiceStatusCardProps } from '@/components/molecules/AiServiceStatusCard/AiServiceStatusCard.types';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/types';
import { cn } from '@/lib/cn';
import { useAiServiceStatus } from '@/providers/AiServiceStatusProvider';
import type {
  AiServiceStatusColor,
  AiServiceStatusSeverity,
} from '@/services/aiServiceStatus';

function badgeLabelKey(severity: AiServiceStatusSeverity): TranslationKey {
  switch (severity) {
    case 'ok':
      return 'settings.aiServiceStatusBadgeOperational';
    case 'degraded':
      return 'settings.aiServiceStatusBadgeMaintenance';
    case 'outage':
      return 'settings.aiServiceStatusBadgeIssues';
    case 'unknown':
    default:
      return 'settings.aiServiceStatusBadgeUnknown';
  }
}

function messageKey(severity: AiServiceStatusSeverity): TranslationKey {
  switch (severity) {
    case 'ok':
      return 'settings.aiServiceStatusMessageOk';
    case 'degraded':
      return 'settings.aiServiceStatusMessageDegraded';
    case 'outage':
      return 'settings.aiServiceStatusMessageOutage';
    case 'unknown':
    default:
      return 'settings.aiServiceStatusMessageUnknown';
  }
}

export function AiServiceStatusCard({ className }: AiServiceStatusCardProps) {
  const { t } = useTranslation();
  const { status, isChecking } = useAiServiceStatus();

  const severity = status?.severity ?? 'unknown';
  const color: AiServiceStatusColor = isChecking
    ? 'gray'
    : (status?.color ?? 'gray');
  const label = isChecking
    ? t('settings.aiServiceStatusBadgeChecking')
    : t(badgeLabelKey(severity));
  const message = isChecking
    ? t('settings.aiServiceStatusMessageChecking')
    : t(messageKey(severity));

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
        className,
      )}>
      <Text className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
        {t('settings.aiServiceStatusSection')}
      </Text>
      <View className="flex-row items-center justify-between px-4 pb-2">
        <Text className="mr-3 text-base font-medium text-foreground dark:text-foreground-dark">
          {t('settings.aiServiceStatusLabel')}
        </Text>
        <AiServiceStatusBadge color={color} label={label} />
      </View>
      <Text className="px-4 pb-4 text-xs leading-5 text-foreground-muted dark:text-foreground-muted-dark">
        {message}
      </Text>
    </View>
  );
}
