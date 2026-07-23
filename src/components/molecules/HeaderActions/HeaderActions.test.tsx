import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { HeaderActions } from './HeaderActions';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'pl',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/providers/ProcessedRecordingsCountProvider', () => ({
  useProcessedRecordingsCount: () => ({
    count: 0,
    refreshCount: jest.fn().mockResolvedValue(0),
  }),
}));

jest.mock('@/providers/AiServiceStatusProvider', () => ({
  useAiServiceStatus: () => ({
    status: {
      severity: 'ok',
      color: 'green',
      pageStatus: 'UP',
      activeIncidentsCount: 0,
      activeMaintenancesCount: 0,
      fetchedAt: 1,
      source: 'network',
    },
    isChecking: false,
  }),
}));

jest.mock('@/components/molecules/RecordingsHeaderButton', () => ({
  RecordingsHeaderButton: 'RecordingsHeaderButton',
}));

jest.mock('@/components/molecules/ThemeToggle', () => ({
  ThemeToggle: 'ThemeToggle',
}));

jest.mock('lucide-react-native', () => ({
  Settings: 'Settings',
  CircleHelp: 'CircleHelp',
}));

describe('HeaderActions', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('navigates to Settings on press', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<HeaderActions />);
    });

    await ReactTestRenderer.act(() => {
      tree!.root
        .findByProps({ accessibilityLabel: 'accessibility.openSettings' })
        .props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });
});
