export const colors = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    primary: '#4F46E5',
    primaryText: '#FFFFFF',
    border: '#E5E7EB',
    error: '#DC2626',
  },
  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#6366F1',
    primaryText: '#FFFFFF',
    border: '#374151',
    error: '#F87171',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ThemeColors = (typeof colors)[ColorScheme];
