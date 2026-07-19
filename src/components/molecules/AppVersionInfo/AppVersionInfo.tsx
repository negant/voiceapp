import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import type { AppVersionInfoProps } from '@/components/molecules/AppVersionInfo/AppVersionInfo.types';
import { SettingsInfoRow } from '@/components/molecules/SettingsInfoRow';
import { appVersion } from '@/config/app';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import { useCredits } from '@/providers/CreditsProvider';
import {
  fetchAppUpdateStatus,
  getUpdateStatusMessage,
  type AppUpdateStatus,
} from '@/services/updates';

export function AppVersionInfo({ className }: AppVersionInfoProps) {
  const { t } = useTranslation();
  const { deviceId } = useCredits();
  const [updateStatus, setUpdateStatus] = useState<AppUpdateStatus>({
    state: 'checking',
  });

  useEffect(() => {
    let cancelled = false;

    fetchAppUpdateStatus()
      .then(status => {
        if (!cancelled) {
          setUpdateStatus(status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUpdateStatus({ state: 'unknown' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark',
        className,
      )}>
      <Text className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
        {t('settings.aboutSection')}
      </Text>
      <SettingsInfoRow label={t('settings.versionLabel')} value={appVersion} />
      <SettingsInfoRow
        label={t('settings.updateLabel')}
        value={getUpdateStatusMessage(t, updateStatus)}
      />
      <SettingsInfoRow
        label={t('settings.deviceIdLabel')}
        value={deviceId ?? t('settings.deviceIdPending')}
        selectable={Boolean(deviceId)}
        compactValue
        className="border-b-0"
      />
      <Text className="px-4 pb-4 text-xs leading-4 text-foreground-muted dark:text-foreground-muted-dark">
        {t('settings.deviceIdHint')}
      </Text>
    </View>
  );
}
