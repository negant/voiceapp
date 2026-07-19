/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@/components/atoms/Logo', () => {
  const { Logo } = jest.requireActual('@/components/atoms/Logo/Logo');
  return {
    Logo,
    AnimatedLogo: Logo,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
