const { View, Text } = require('react-native');

const createSharedValue = initialValue => ({ value: initialValue });

module.exports = {
  __esModule: true,
  default: {
    View,
    Text,
    createAnimatedComponent: Component => Component,
  },
  View,
  Text,
  createAnimatedComponent: Component => Component,
  useSharedValue: createSharedValue,
  useAnimatedStyle: updater => updater(),
  useAnimatedProps: updater => updater(),
  withTiming: value => value,
  withDelay: (_delay, value) => value,
  withSpring: value => value,
  withSequence: (...values) => values[values.length - 1],
  withRepeat: value => value,
  runOnJS: fn => fn,
  Easing: {
    out: easing => easing,
    cubic: 'cubic',
  },
};
