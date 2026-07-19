import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { FaqSection } from './FaqSection';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    isHydrated: true,
    setLocale: jest.fn(),
  }),
}));

jest.mock('@/hooks/useSupportedFormatsLabel', () => ({
  useSupportedFormatsLabel: () => 'MP3, WAV',
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
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

describe('FaqSection', () => {
  it('renders FAQ title and first question expanded by default', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<FaqSection />);
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const values = texts.map(node => node.props.children).flat();

    expect(values).toContain('guide.faqTitle');
    expect(values).toContain('faq.q1Title');
    expect(values).toContain('faq.q1Answer');
    expect(values).not.toContain('faq.q2Answer');
    expect(values).toContain('faq.q8Title');
    expect(values).toContain('faq.q9Title');
  });

  it('expands a question when its header is pressed', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<FaqSection />);
    });

    const pressables = tree!.root.findAll(
      node => typeof node.props?.onPress === 'function',
    );

    await ReactTestRenderer.act(() => {
      pressables[1].props.onPress();
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const values = texts.map(node => node.props.children).flat();

    expect(values).toContain('faq.q2Answer');
  });
});
