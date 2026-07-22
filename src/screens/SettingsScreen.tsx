import { Switch, Text, View } from 'react-native';

import { AppVersionInfo, Screen } from '@/components';
import { SettingsRow } from '@/components/molecules/SettingsRow';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootStackScreenProps } from '@/navigation/types';
import { useCredits } from '@/providers/CreditsProvider';
import { env } from '@/config/env';

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
  const { isPremium, setAccountPlan } = useCredits();
  useScreenTitle('nav.settings');

  const showDeveloperSection = env.debugMode || __DEV__;

  const handlePremiumToggle = (enabled: boolean) => {
    // Provider syncs plan + balance to API when BACKEND_API_BASE_URL is set.
    setAccountPlan(enabled ? 'premium' : 'free').catch(() => undefined);
  };

  return (
    <Screen>
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
            isLast
            onValueChange={handlePremiumToggle}
          />
        </View>
      ) : null}

      <AppVersionInfo className="mt-4" />
    </Screen>
  );
}
