import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { VoicePresetCard } from './VoicePresetCard';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('lucide-react-native', () => ({
  Trash2: () => null,
}));

describe('VoicePresetCard', () => {
  it('reserves fixed height for label block without visible description', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <VoicePresetCard
          label="Kratos"
          description="Deep gravelly war god — slow and imposing"
          accentColor="#B91C1C"
          avatarInitial="K"
          selected={false}
          onSelect={jest.fn()}
        />,
      );
    });

    const views = tree!.root.findAllByType('View' as never);
    const labelSlot = views.find(
      node => node.props.className === 'h-8 w-full justify-center',
    );
    const descriptionSlot = views.find(
      node => node.props.className === 'mt-1 h-9 w-full justify-start',
    );
    const avatarSlot = views.find(node => {
      const className = node.props.className as string | undefined;
      return className?.includes('mb-2 h-24 w-full items-center justify-center');
    });
    const pressable = tree!.root.findByProps({ accessibilityRole: 'button' });

    expect(labelSlot).toBeTruthy();
    expect(descriptionSlot).toBeUndefined();
    expect(avatarSlot).toBeTruthy();
    expect(pressable.props.accessibilityLabel).toContain(
      'Deep gravelly war god — slow and imposing',
    );
  });

  it('hides label text when label is empty but keeps label slot height', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <VoicePresetCard
          label=""
          description="Lower, richer voice"
          accentColor="#3B82F6"
          avatarInitial="M"
          selected={false}
          onSelect={jest.fn()}
        />,
      );
    });

    const texts = tree!.root.findAllByType('Text' as never);
    const labelSlot = tree!.root.findAllByType('View' as never).find(
      node => node.props.className === 'h-8 w-full justify-center',
    );

    expect(labelSlot).toBeTruthy();
    expect(
      texts.some(node => node.props.children === 'Lower, richer voice'),
    ).toBe(false);
  });

  it('renders circular avatar without full-card background artwork', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <VoicePresetCard
          label="Light"
          description="Higher pitch"
          accentColor="#F59E0B"
          avatarInitial="F"
          avatarImage={1}
          selected={false}
          onSelect={jest.fn()}
        />,
      );
    });

    const images = tree!.root.findAllByType('Image' as never);
    expect(images).toHaveLength(1);
  });

  it('renders two smaller avatars for combined presets', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <VoicePresetCard
          label="Robot + Narrator"
          description="Robot → Narrator"
          accentColor="#6366F1"
          avatarInitial="R"
          avatarImages={[1, 2]}
          avatarAccentColors={['#111111', '#222222']}
          selected={false}
          onSelect={jest.fn()}
        />,
      );
    });

    const images = tree!.root.findAllByType('Image' as never);
    expect(images).toHaveLength(2);
  });

  it('renders delete icon when onDelete is provided', () => {
    const onDelete = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <VoicePresetCard
          label="My effect"
          accentColor="#4F46E5"
          avatarInitial="M"
          selected
          onSelect={jest.fn()}
          onDelete={onDelete}
          deleteAccessibilityLabel="Delete My effect"
        />,
      );
    });

    const deleteButton = tree!.root.findByProps({
      accessibilityLabel: 'Delete My effect',
    });
    expect(deleteButton).toBeTruthy();

    ReactTestRenderer.act(() => {
      deleteButton.props.onPress();
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
