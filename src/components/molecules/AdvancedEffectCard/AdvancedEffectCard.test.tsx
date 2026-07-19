import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { AdvancedEffectCard } from './AdvancedEffectCard';

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

jest.mock('@/components/atoms/AdvancedEffectIcon', () => ({
  AdvancedEffectIcon: () => null,
}));

describe('AdvancedEffectCard', () => {
  it('renders label with optional access badge', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AdvancedEffectCard
          label="Chipmunk"
          description="High pitch filter chain"
          accessTier="free"
          accentColor="#EC4899"
          iconKey="chipmunk"
          selected={false}
          onSelect={jest.fn()}
        />,
      );
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const values = texts.map(node => node.props.children).flat();

    expect(values).toContain('Chipmunk');
    expect(values).toContain('voiceStudio.tierBadgeFree');
  });

  it('marks selected state for accessibility', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AdvancedEffectCard
          label="Chipmunk"
          accentColor="#EC4899"
          iconKey="chipmunk"
          selected
          onSelect={jest.fn()}
        />,
      );
    });

    const pressable = tree!.root.findByProps({ accessibilityRole: 'button' });
    expect(pressable.props.accessibilityState).toEqual({ selected: true });
  });
});
