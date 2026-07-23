import { useState } from 'react';
import { Linking, Switch, Text, View } from 'react-native';

import { AppVersionInfo, Screen } from '@/components';
import { Button } from '@/components/atoms/Button';
import { AiServiceStatusCard } from '@/components/molecules/AiServiceStatusCard';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { SettingsRow } from '@/components/molecules/SettingsRow';
import { env } from '@/config/env';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootStackScreenProps } from '@/navigation/types';
import { useCredits } from '@/providers/CreditsProvider';
import { useAiServiceStatus } from '@/providers/AiServiceStatusProvider';
import {
  reloadAppAfterReset,
  resetLocalAppData,
} from '@/services/database/resetAppData';

type DeveloperSwitchRowProps = {
  title: string;
  value: boolean;
  isLast?: boolean;
  onValueChange: (value: boolean) => void;
};

function DeveloperSwitchRow({
  title,
  value,
  isLast = false,
  onValueChange,
}: DeveloperSwitchRowProps) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-4 ${
        isLast ? '' : 'border-b border-border dark:border-border-dark'
      }`}
    >
      <Text className="mr-3 flex-1 text-base font-medium text-foreground dark:text-foreground-dark">
        {title}
      </Text>
      <Switch
        accessibilityRole="switch"
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

export function SettingsScreen({
  navigation,
}: RootStackScreenProps<'Settings'>) {
  const { t } = useTranslation();
  const { balance, isPremium, setAccountPlan, setBalance, spendCredits } =
    useCredits();
  const { applyDebugStatus, refreshStatus } = useAiServiceStatus();
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  useScreenTitle('nav.settings');

  const showDeveloperSection = env.debugMode || __DEV__;

  const handlePremiumToggle = (enabled: boolean) => {
    // Provider syncs plan + balance to API when BACKEND_API_BASE_URL is set.
    setAccountPlan(enabled ? 'premium' : 'free').catch(() => undefined);
  };

  const handleClearCredits = () => {
    // Prefer spend so the backend ledger stays authoritative when API is configured.
    if (balance > 0) {
      spendCredits(balance, 'debug_clear').catch(() => undefined);
      return;
    }
    setBalance(0).catch(() => undefined);
  };

  const handleConfirmResetAppData = async () => {
    setIsResetting(true);
    try {
      await resetLocalAppData();
      setResetConfirmVisible(false);
      reloadAppAfterReset();
    } catch {
      setIsResetting(false);
      setResetConfirmVisible(false);
    }
  };

  return (
    <Screen scrollable>
      <AiServiceStatusCard className="mt-4" />

      <View className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
        <Text className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
          {t('settings.languageSection')}
        </Text>
        <SettingsRow
          title={t('settings.languageTitle')}
          subtitle={t('settings.languageSubtitle')}
          showChevron
          onPress={() => navigation.navigate('LanguageSettings')}
        />
      </View>

      {showDeveloperSection ? (
        <View className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
          <Text className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
            {t('settings.developerSection')}
          </Text>
          <DeveloperSwitchRow
            title={t('settings.enablePremiumTitle')}
            value={isPremium}
            onValueChange={handlePremiumToggle}
          />
          <View className="gap-3 border-t border-border px-4 py-4 dark:border-border-dark">
            <Button
              title={t('settings.clearCreditsTitle')}
              variant="secondary"
              accessibilityLabel={t('settings.clearCreditsTitle')}
              accessibilityHint={t('settings.clearCreditsSubtitle')}
              onPress={handleClearCredits}
            />
            <Button
              title={t('settings.clearAppDataTitle')}
              variant="secondary"
              accessibilityLabel={t('settings.clearAppDataTitle')}
              accessibilityHint={t('settings.clearAppDataSubtitle')}
              onPress={() => setResetConfirmVisible(true)}
            />
            <Text className="pt-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
              {t('settings.debugAiStatusSection')}
            </Text>
            <Button
              title={t('settings.debugAiStatusOperational')}
              variant="secondary"
              accessibilityLabel={t('settings.debugAiStatusOperational')}
              onPress={() => {
                applyDebugStatus('ok').catch(() => undefined);
              }}
            />
            <Button
              title={t('settings.debugAiStatusMaintenance')}
              variant="secondary"
              accessibilityLabel={t('settings.debugAiStatusMaintenance')}
              onPress={() => {
                applyDebugStatus('degraded').catch(() => undefined);
              }}
            />
            <Button
              title={t('settings.debugAiStatusIssues')}
              variant="secondary"
              accessibilityLabel={t('settings.debugAiStatusIssues')}
              onPress={() => {
                applyDebugStatus('outage').catch(() => undefined);
              }}
            />
            <Button
              title={t('settings.debugAiStatusRefreshLive')}
              variant="secondary"
              accessibilityLabel={t('settings.debugAiStatusRefreshLive')}
              onPress={() => {
                refreshStatus().catch(() => undefined);
              }}
            />
          </View>
        </View>
      ) : null}

      <View className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
        <Text className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wide text-foreground-muted dark:text-foreground-muted-dark">
          {t('settings.legalSection')}
        </Text>
        <SettingsRow
          title={t('settings.privacyPolicyTitle')}
          subtitle={t('settings.privacyPolicySubtitle')}
          showChevron
          className="border-b-0"
          onPress={() => {
            Linking.openURL(env.privacyPolicyUrl).catch(() => undefined);
          }}
        />
      </View>

      <AppVersionInfo className="mt-4" />

      <ConfirmDialog
        visible={resetConfirmVisible}
        title={t('settings.clearAppDataConfirmTitle')}
        message={t('settings.clearAppDataConfirmMessage')}
        confirmLabel={t('settings.clearAppDataConfirmAction')}
        isLoading={isResetting}
        onCancel={() => {
          if (!isResetting) {
            setResetConfirmVisible(false);
          }
        }}
        onConfirm={() => {
          handleConfirmResetAppData().catch(() => undefined);
        }}
      />
    </Screen>
  );
}
