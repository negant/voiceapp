import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { EffectSlider } from './EffectSlider';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ isDark: false, isHydrated: true }),
}));

describe('EffectSlider', () => {
  it('renders display scale labels and numeric value', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <EffectSlider
          label="Pitch"
          effectKey="pitch"
          value={50}
          onValueChange={jest.fn()}
        />,
      );
    });

    const textValues = tree!.root
      .findAllByType('Text' as never)
      .map(node => node.props.children)
      .flat();

    expect(textValues).toContain('Pitch');
    expect(textValues).toContain('-10');
    expect(textValues).toContain('0');
    expect(textValues).toContain('+10');

    const input = tree!.root.findByType('TextInput' as never);
    expect(input.props.value).toBe('0');
    expect(input.props.className).toContain('w-14');
  });

  it('keeps the slider in a flex row beside the numeric input', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <EffectSlider
          label="Pitch"
          effectKey="pitch"
          value={50}
          onValueChange={jest.fn()}
        />,
      );
    });

    const sliderRow = tree!.root
      .findAllByType('View' as never)
      .find(node => node.props.className === 'flex-row items-center gap-5');

    expect(sliderRow).toBeTruthy();
    expect(sliderRow!.findAllByType('TextInput' as never)).toHaveLength(1);
  });
});
