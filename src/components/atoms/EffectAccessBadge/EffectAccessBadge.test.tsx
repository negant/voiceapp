import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { EffectAccessBadge } from './EffectAccessBadge';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock('lucide-react-native', () => ({
  BadgeCheck: () => null,
  Crown: () => null,
}));

describe('EffectAccessBadge', () => {
  it('renders free and premium labels', () => {
    let freeTree: ReactTestRenderer.ReactTestRenderer;
    let premiumTree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      freeTree = ReactTestRenderer.create(
        <EffectAccessBadge accessTier="free" />,
      );
      premiumTree = ReactTestRenderer.create(
        <EffectAccessBadge accessTier="premium" />,
      );
    });

    const freeValues = freeTree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children);
    const premiumValues = premiumTree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children);

    expect(freeValues).toContain('voiceStudio.tierBadgeFree');
    expect(premiumValues).toContain('voiceStudio.tierBadgePremium');
  });
});
