import { Moon, Sun } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

const ICON_SIZE = 14;

export function ThemeToggle() {
  const { isDark, setThemeMode } = useTheme();
  const { t } = useTranslation();

  const handlePress = () => {
    setThemeMode(isDark ? 'light' : 'dark').catch(() => {
      // Theme already switched in UI; avoid blocking the toggle on a failed DB write.
    });
  };

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? t('theme.darkOn') : t('theme.lightOn')}
      onPress={handlePress}
      className={cn(
        'mr-2 h-8 w-12 flex-row items-center rounded-full p-0.5',
        isDark ? 'justify-end bg-brand-dark' : 'justify-start bg-border',
      )}>
      <View className="h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
        {isDark ? (
          <Moon size={ICON_SIZE} color="#6366F1" />
        ) : (
          <Sun size={ICON_SIZE} color="#4F46E5" />
        )}
      </View>
    </Pressable>
  );
}
