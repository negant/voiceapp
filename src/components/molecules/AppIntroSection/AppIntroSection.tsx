import { Text, View } from 'react-native';

import { Logo } from '@/components/atoms/Logo';
import type { AppIntroSectionProps } from '@/components/molecules/AppIntroSection/AppIntroSection.types';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

const INTRO_LOGO_SIZE = 88;

export function AppIntroSection({ className }: AppIntroSectionProps) {
  const { t } = useTranslation();

  return (
    <View
      className={cn(
        'mb-4 items-center rounded-2xl border border-border bg-surface px-4 py-5 dark:border-border-dark dark:bg-surface-dark',
        className,
      )}>
      <Logo size={INTRO_LOGO_SIZE} variant="mark" />
      <Text className="mt-3 text-center text-2xl font-bold text-foreground dark:text-foreground-dark">
        {t('home.brandName')}
      </Text>
      <Text className="mt-2 max-w-sm text-center text-base font-semibold leading-6 text-foreground dark:text-foreground-dark">
        {t('home.tagline')}
      </Text>
      <Text className="mt-2 max-w-sm text-center text-sm leading-5 text-foreground-muted dark:text-foreground-muted-dark">
        {t('home.heroSubtitle')}
      </Text>
    </View>
  );
}
