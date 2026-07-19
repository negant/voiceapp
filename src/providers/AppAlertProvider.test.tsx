import React, { useEffect } from 'react';
import ReactTestRenderer from 'react-test-renderer';

import {
  AppAlertProvider,
  useAppAlert,
} from '@/providers/AppAlertProvider';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

jest.mock('@/hooks/useNetworkConnectivity', () => ({
  useNetworkConnectivity: () => ({ isOnline: true }),
}));

function Probe({
  onReady,
}: {
  onReady: (api: ReturnType<typeof useAppAlert>) => void;
}) {
  const api = useAppAlert();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

describe('AppAlertProvider', () => {
  it('shows offline alert copy via helper', () => {
    let api: ReturnType<typeof useAppAlert> | null = null;
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AppAlertProvider>
          <Probe
            onReady={value => {
              api = value;
            }}
          />
        </AppAlertProvider>,
      );
    });

    ReactTestRenderer.act(() => {
      api!.showOfflineAlert();
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(texts).toContain('alerts.offlineTitle');
    expect(texts).toContain('alerts.offlineMessage');
  });

  it('shows online alert copy via helper', () => {
    let api: ReturnType<typeof useAppAlert> | null = null;
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AppAlertProvider>
          <Probe
            onReady={value => {
              api = value;
            }}
          />
        </AppAlertProvider>,
      );
    });

    ReactTestRenderer.act(() => {
      api!.showOnlineAlert();
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(texts).toContain('alerts.onlineTitle');
    expect(texts).toContain('alerts.onlineMessage');
  });

  it('shows error alert via helper', () => {
    let api: ReturnType<typeof useAppAlert> | null = null;
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AppAlertProvider>
          <Probe
            onReady={value => {
              api = value;
            }}
          />
        </AppAlertProvider>,
      );
    });

    ReactTestRenderer.act(() => {
      api!.showErrorAlert('Save failed', 'Could not write preset.');
    });

    const texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(texts).toContain('Save failed');
    expect(texts).toContain('Could not write preset.');
  });

  it('queues a second alert after dismiss', () => {
    let api: ReturnType<typeof useAppAlert> | null = null;
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AppAlertProvider>
          <Probe
            onReady={value => {
              api = value;
            }}
          />
        </AppAlertProvider>,
      );
    });

    ReactTestRenderer.act(() => {
      api!.showAlert({ title: 'First', message: 'One' });
      api!.showAlert({ title: 'Second', message: 'Two' });
    });

    let texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();
    expect(texts).toContain('First');
    expect(texts).not.toContain('Second');

    ReactTestRenderer.act(() => {
      api!.dismissAlert();
    });

    texts = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();
    expect(texts).toContain('Second');
  });
});
