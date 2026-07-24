import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

import type { HeaderBackButtonProps } from '@/components/molecules/HeaderBackButton/HeaderBackButton.types';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

const ICON_SIZE = 28;

export function HeaderBackButton({
  className,
  side = 'left',
}: HeaderBackButtonProps) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const iconColor = isDark ? '#F9FAFB' : '#1A1A2E';

  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      onPress={() => navigation.goBack()}
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full active:opacity-70',
        side === 'right' ? 'ml-1' : 'mr-3',
        className,
      )}>
      <ChevronLeft size={ICON_SIZE} color={iconColor} />
    </Pressable>
  );
}
