import { View } from 'react-native';

import { Screen, SettingsRow } from '@/components';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { SUPPORTED_LOCALES, useTranslation } from '@/hooks/useTranslation';
import { LOCALE_LABEL_KEYS } from '@/types/locale';

export function LanguageSettingsScreen() {
  const { locale, setLocale, t } = useTranslation();
  useScreenTitle('nav.language');

  return (
    <Screen>
      <View className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
        {SUPPORTED_LOCALES.map(appLocale => (
          <SettingsRow
            key={appLocale}
            title={t(LOCALE_LABEL_KEYS[appLocale])}
            selected={locale === appLocale}
            onPress={() => {
              setLocale(appLocale).catch(() => {
                // Locale already updated in UI; avoid blocking selection on a failed DB write.
              });
            }}
          />
        ))}
      </View>
    </Screen>
  );
}
