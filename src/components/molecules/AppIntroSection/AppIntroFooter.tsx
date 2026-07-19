import { Text, View } from 'react-native';

import type { AppIntroFooterProps } from '@/components/molecules/AppIntroSection/AppIntroFooter.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

export function AppIntroFooter({ className }: AppIntroFooterProps) {
  const { t } = useTranslation();

  return (
    <View className={cn('mt-3 bg-transparent px-2 pb-2', className)}>
      <Text className="max-w-md self-center text-center text-sm leading-6 text-foreground-muted dark:text-foreground-muted-dark">
        {t('home.introBody')}
      </Text>
    </View>
  );
}
