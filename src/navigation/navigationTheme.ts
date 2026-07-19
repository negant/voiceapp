import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from '@react-navigation/native';

export const lightNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A2E',
    border: '#E5E7EB',
    notification: '#4F46E5',
  },
};

export const darkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6366F1',
    background: '#0F0F1A',
    card: '#1A1A2E',
    text: '#F9FAFB',
    border: '#374151',
    notification: '#6366F1',
  },
};
