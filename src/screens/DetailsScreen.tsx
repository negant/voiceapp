import { Text, View } from 'react-native';

import { Button, Screen } from '@/components';
import { useScreenTitle } from '@/hooks/useScreenTitle';
import { useTranslation } from '@/hooks/useTranslation';
import type { RootStackScreenProps } from '@/navigation/types';

export function DetailsScreen({
  navigation,
  route,
}: RootStackScreenProps<'Details'>) {
  const { message } = route.params;
  const { t } = useTranslation();
  useScreenTitle('nav.details');

  return (
    <Screen>
      <View className="mb-8 flex-1 justify-center">
        <Text className="mb-4 text-[28px] font-bold text-foreground dark:text-foreground-dark">
          {t('details.title')}
        </Text>
        <Text className="text-base leading-6 text-foreground-muted dark:text-foreground-muted-dark">
          {message}
        </Text>
      </View>

      <Button
        title={t('common.back')}
        variant="secondary"
        onPress={() => navigation.goBack()}
      />
    </Screen>
  );
}
