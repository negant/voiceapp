import { Coins } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';

import type { CreditsHeaderBadgeProps } from '@/components/molecules/CreditsHeaderBadge/CreditsHeaderBadge.types';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import type { RootStackParamList } from '@/navigation/types';
import { useCredits } from '@/providers/CreditsProvider';
import { formatCreditsBalance } from '@/utils/formatCreditsBalance';

const ICON_SIZE = 14;

export function CreditsHeaderBadge({ className }: CreditsHeaderBadgeProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, locale } = useTranslation();
  const { isDark } = useTheme();
  const { balance, isHydrated, isPremium } = useCredits();

  if (!isHydrated) {
    return null;
  }

  const iconColor = isDark ? '#FCD34D' : '#D97706';
  // Free plan starts with welcome credits — show balance; Buy Premium when empty.
  const showBalance = isPremium || balance > 0;
  const label = showBalance
    ? formatCreditsBalance(balance, locale)
    : t('credits.buyPremium');
  const accessibilityHint = showBalance
    ? t('accessibility.creditsBalance', { count: balance })
    : t('accessibility.buyPremium');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        showBalance
          ? t('accessibility.openCreditsInfo')
          : t('accessibility.buyPremium')
      }
      accessibilityHint={accessibilityHint}
      onPress={() => navigation.navigate('CreditsInfo')}
      className={cn(
        'flex-row items-center gap-1 rounded-full border border-amber-500/35 bg-surface px-2 py-1 shadow-sm active:opacity-70 dark:border-amber-400/40 dark:bg-surface-dark',
        className,
      )}>
      <Coins size={ICON_SIZE} color={iconColor} />
      <Text className="text-xs font-semibold text-amber-700 dark:text-amber-300">
        {label}
      </Text>
    </Pressable>
  );
}
