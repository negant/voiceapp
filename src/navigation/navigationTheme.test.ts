import { lightNavigationTheme, darkNavigationTheme } from './navigationTheme';

describe('navigationTheme', () => {
  it('defines light theme colors', () => {
    expect(lightNavigationTheme.colors.background).toBe('#F8F9FA');
    expect(lightNavigationTheme.colors.primary).toBe('#4F46E5');
  });

  it('defines dark theme colors', () => {
    expect(darkNavigationTheme.colors.background).toBe('#0F0F1A');
    expect(darkNavigationTheme.colors.primary).toBe('#6366F1');
  });
});
