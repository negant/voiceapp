import { useNavigation } from '@react-navigation/native';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { useScreenTitle } from './useScreenTitle';

const mockSetOptions = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => `t:${key}`,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/components/molecules/SubScreenHeader', () => {
  const { Text } = require('react-native');
  return {
    SubScreenHeader: ({ title }: { title: string }) => (
      <Text>{`header:${title}`}</Text>
    ),
  };
});

function HookHost({ titleKey }: { titleKey: 'nav.settings' }) {
  useScreenTitle(titleKey);
  return null;
}

describe('useScreenTitle', () => {
  beforeEach(() => {
    mockSetOptions.mockClear();
    (useNavigation as jest.Mock).mockReturnValue({
      setOptions: mockSetOptions,
    });
  });

  it('installs a JS SubScreenHeader via navigation options', async () => {
    await ReactTestRenderer.act(() => {
      ReactTestRenderer.create(<HookHost titleKey="nav.settings" />);
    });

    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 't:nav.settings',
        header: expect.any(Function),
      }),
    );

    const { header } = mockSetOptions.mock.calls[0][0] as {
      header: () => React.ReactElement;
    };
    let headerTree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      headerTree = ReactTestRenderer.create(header());
    });
    expect(
      headerTree!.root.findByProps({ children: 'header:t:nav.settings' }),
    ).toBeTruthy();
  });
});
