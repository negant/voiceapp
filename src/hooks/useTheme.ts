import { useDatabaseContext } from '@/providers/DatabaseProvider';
import { useThemeContext } from '@/providers/ThemeProvider';

export function useDatabase() {
  return useDatabaseContext();
}

export function useTheme() {
  return useThemeContext();
}

export type { ThemeMode } from '@/types/theme';
