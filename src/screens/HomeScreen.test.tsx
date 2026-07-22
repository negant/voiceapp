import { HomeScreen } from '@/screens/HomeScreen';
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params) {
        return `${key}:${JSON.stringify(params)}`;
      }
      return key;
    },
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

jest.mock('@/hooks/useDatabase', () => ({
  useDatabase: () => ({ isReady: true, isLoading: false }),
}));

jest.mock('@/services/database/voicePresetRepository', () => ({
  listVoicePresets: jest.fn().mockResolvedValue([]),
  createVoicePreset: jest.fn(),
  hasDuplicatePresetName: jest.fn().mockReturnValue(false),
}));

jest.mock('@/services/database/processedHistoryRepository', () => ({
  listProcessedHistory: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/hooks/useScreenTitle', () => ({
  useScreenTitle: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@/providers/ProcessedRecordingsCountProvider', () => ({
  useProcessedRecordingsCount: () => ({
    count: 0,
    refreshCount: jest.fn().mockResolvedValue(0),
  }),
}));

jest.mock('@/providers/CreditsProvider', () => ({
  useCredits: () => ({
    accountPlan: 'free',
    isPremium: false,
    balance: 0,
    creditsPerStartedMinute: 1,
    creditsPerAiSecond: 1,
    creditsPerAi10Sec: 1,
    aiBillingChunkSec: 60,
    isHydrated: true,
    refreshBalance: jest.fn(),
    setBalance: jest.fn(),
    refreshAccount: jest.fn(),
    setAccountPlan: jest.fn(),
    setCreditsPerAi10Sec: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAppAlert', () => ({
  useAppAlert: () => ({
    showAlert: jest.fn(),
    dismissAlert: jest.fn(),
    showErrorAlert: jest.fn(),
    showWarningAlert: jest.fn(),
    showOfflineAlert: jest.fn(),
    showOnlineAlert: jest.fn(),
  }),
}));

jest.mock('@/config/env', () => ({
  env: {
    appDisplayName: 'Voice App',
    supportedAudioFormats: ['mp3'],
    maxUploadSizeMb: 50,
    enableAiEffects: true,
    aiEffectsApiKey: 'wsk_test_key',
  },
  isAiEffectsConfigured: () => true,
  isCloudAiConfigured: () => true,
}));

describe('HomeScreen', () => {
  it('renders the voice studio panel', async () => {
    const navigation = { navigate: jest.fn() } as never;
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <HomeScreen navigation={navigation} route={{ key: 'Home', name: 'Home' }} />,
      );
      await Promise.resolve();
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const values = texts.map(node => node.props.children).flat();
    expect(values).toContain('home.brandName');
  });
});
