import type { ReactNode } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CircleHelp, Settings } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { HeaderActionsProps } from '@/components/molecules/HeaderActions/HeaderActions.types';
import { RecordingsHeaderButton } from '@/components/molecules/RecordingsHeaderButton';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useProcessedRecordingsCount } from '@/providers/ProcessedRecordingsCountProvider';
import type { RootStackParamList } from '@/navigation/types';
import { cn } from '@/lib/cn';

const ICON_SIZE = 22;

function HeaderIconButton({
  label,
  onPress,
  className,
  children,
}: {
  label: string;
  onPress: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cn(
        'mr-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70',
        className,
      )}>
      {children}
    </Pressable>
  );
}

export function HeaderActions({ className }: HeaderActionsProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { count: recordingsCount } = useProcessedRecordingsCount();
  const iconColor = isDark ? '#F9FAFB' : '#1A1A2E';
  const recordingsLabel =
    recordingsCount > 0
      ? t('accessibility.openYourRecordingsWithCount', {
          count: recordingsCount,
        })
      : t('accessibility.openYourRecordings');

  return (
    <View className={cn('flex-row items-center', className)}>
      <HeaderIconButton
        label={t('accessibility.openGuide')}
        onPress={() => navigation.navigate('Guide')}>
        <CircleHelp size={ICON_SIZE} color={iconColor} />
      </HeaderIconButton>
      <HeaderIconButton
        label={t('accessibility.openSettings')}
        onPress={() => navigation.navigate('Settings')}>
        <Settings size={ICON_SIZE} color={iconColor} />
      </HeaderIconButton>
      <RecordingsHeaderButton
        count={recordingsCount}
        label={recordingsLabel}
        iconColor={iconColor}
        onPress={() => navigation.navigate('YourRecordings')}
      />
      <ThemeToggle />
    </View>
  );
}
