import { useColorScheme } from 'react-native';

import { colors, type ColorScheme, type ThemeColors } from '@/theme';

export function useAppTheme(): {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
} {
  const scheme = useColorScheme();
  const colorScheme: ColorScheme = scheme === 'dark' ? 'dark' : 'light';

  return {
    colorScheme,
    colors: colors[colorScheme],
    isDark: colorScheme === 'dark',
  };
}
